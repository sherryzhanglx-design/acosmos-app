import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { transcribeAudioBuffer } from "./voiceTranscription";
import { textToSpeech, isTTSEnabled } from "./tts";
import { streamOpenAIChat } from "./streamChat";
import { COACHING_SYSTEM_PROMPTS, DEFAULT_SYSTEM_PROMPT } from "../routers";
import { 
  getConversationById, 
  getCoachingRoleById, 
  createMessage, 
  getConversationMessages, 
  updateConversation,
  incrementMessageCount,
  logUsageAction 
} from "../db";
import { sdk } from "./sdk";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // Voice transcription endpoint — receives raw audio, returns transcribed text
  app.post("/api/transcribe", express.raw({ type: "application/octet-stream", limit: "25mb" }), async (req, res) => {
    try {
      const audioBuffer = req.body as Buffer;
      if (!audioBuffer || audioBuffer.length === 0) {
        return res.status(400).json({ error: "No audio data provided" });
      }
      
      const result = await transcribeAudioBuffer(audioBuffer, "audio/webm");
      
      if ('error' in result) {
        return res.status(500).json({ error: result.error, details: result.details });
      }
      
      res.json({ text: result.text });
    } catch (error) {
      console.error("Transcription failed:", error);
      res.status(500).json({ error: "Failed to transcribe audio" });
    }
  });
  
  // Text-to-Speech endpoint — converts text to audio using ElevenLabs
  app.post("/api/tts", express.json({ limit: "1mb" }), async (req, res) => {
    try {
      const { text, guardianSlug } = req.body;
      
      if (!text || !guardianSlug) {
        return res.status(400).json({ error: "Missing text or guardianSlug" });
      }
      
      if (!isTTSEnabled(guardianSlug)) {
        return res.status(400).json({ error: "TTS not available for this guardian" });
      }
      
      const audioBuffer = await textToSpeech(text, guardianSlug);
      
      res.set({
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
        "Cache-Control": "public, max-age=3600",
      });
      res.send(audioBuffer);
    } catch (error) {
      console.error("[TTS] Failed:", error);
      res.status(500).json({ error: "Failed to generate speech" });
    }
  });

  // Streaming chat endpoint — SSE for progressive text output
  app.post("/api/chat/stream", express.json({ limit: "1mb" }), async (req, res) => {
    try {
      // Authenticate user via session cookie
      const user = await sdk.authenticateRequest(req as any);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { conversationId, message, isVoiceInput } = req.body;
      if (!conversationId || !message) {
        return res.status(400).json({ error: "Missing conversationId or message" });
      }

      // Verify conversation belongs to user
      const conversation = await getConversationById(conversationId, user.id);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      const role = await getCoachingRoleById(conversation.roleId);
      const systemPrompt = role?.slug
        ? COACHING_SYSTEM_PROMPTS[role.slug] || DEFAULT_SYSTEM_PROMPT
        : DEFAULT_SYSTEM_PROMPT;

      // Save user message
      await createMessage({
        conversationId,
        role: "user",
        content: message,
        isVoiceInput: isVoiceInput ? 1 : 0,
      });

      // Track usage
      await incrementMessageCount(user.id);
      await logUsageAction({
        userId: user.id,
        actionType: isVoiceInput ? 'voice_input' : 'message_sent',
        guardianSlug: role?.slug,
        conversationId,
      });

      // Get conversation history
      const history = await getConversationMessages(conversationId);
      const messagesForLLM = [
        { role: "system" as const, content: systemPrompt },
        ...history.slice(-20).map(m => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      // Update conversation title if first exchange
      if (history.length <= 1) {
        const titlePrompt = message.slice(0, 50) + (message.length > 50 ? "..." : "");
        await updateConversation(conversationId, { title: titlePrompt });
      }

      // Set up SSE headers
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no", // Disable nginx buffering
      });

      // Stream the response
      await streamOpenAIChat(
        messagesForLLM,
        // onChunk — send each text chunk to the client
        (chunk) => {
          res.write(`data: ${JSON.stringify({ type: "chunk", content: chunk })}\n\n`);
        },
        // onDone — save the complete message and close the stream
        async (fullText) => {
          const assistantContent = fullText || "I'm here with you. What would you like to explore?";
          
          // Save assistant message to database
          await createMessage({
            conversationId,
            role: "assistant",
            content: assistantContent,
          });

          res.write(`data: ${JSON.stringify({ type: "done", content: assistantContent })}\n\n`);
          res.end();
        },
        // onError — send error and close
        (error) => {
          console.error("[Stream] Error:", error);
          res.write(`data: ${JSON.stringify({ type: "error", content: "Failed to generate response" })}\n\n`);
          res.end();
        }
      );

      // Handle client disconnect
      req.on("close", () => {
        // Client disconnected, stream will end naturally
      });
    } catch (error) {
      console.error("[Stream] Endpoint error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to start streaming" });
      } else {
        res.end();
      }
    }
  });

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
