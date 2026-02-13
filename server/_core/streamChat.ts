/**
 * Streaming Chat Endpoint
 * 
 * Provides Server-Sent Events (SSE) streaming for Guardian AI responses.
 * Text appears progressively on the frontend instead of waiting for the complete response.
 * 
 * Uses the same system prompts, models, and conversation logic as the tRPC chat.send mutation.
 */

import { ENV } from "./env";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = "gpt-5.2";

interface StreamMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Stream a chat completion from OpenAI via SSE.
 * Yields text chunks as they arrive from the model.
 */
export async function streamOpenAIChat(
  messages: StreamMessage[],
  onChunk: (chunk: string) => void,
  onDone: (fullText: string) => void,
  onError: (error: Error) => void
): Promise<void> {
  const apiKey = ENV.openaiApiKey;
  if (!apiKey) {
    onError(new Error("OpenAI API key is not configured"));
    return;
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages,
        max_completion_tokens: 1024,
        temperature: 0.5,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      onError(new Error(`OpenAI API error: ${response.status} – ${errorText}`));
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError(new Error("No response body reader available"));
      return;
    }

    const decoder = new TextDecoder();
    let fullText = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE lines
      const lines = buffer.split("\n");
      // Keep the last potentially incomplete line in the buffer
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;

        const data = trimmed.slice(6); // Remove "data: " prefix
        if (data === "[DONE]") {
          onDone(fullText);
          return;
        }

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            fullText += delta;
            onChunk(delta);
          }
        } catch {
          // Skip malformed JSON chunks
        }
      }
    }

    // If we exit the loop without [DONE], still call onDone
    if (fullText) {
      onDone(fullText);
    }
  } catch (error) {
    onError(error instanceof Error ? error : new Error(String(error)));
  }
}
