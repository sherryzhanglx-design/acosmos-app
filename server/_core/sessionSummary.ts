/**
 * Session Summary Generator
 * 
 * Automatically generates structured summaries of coaching conversations
 * using AI. Summaries are stored in the database for future growth review
 * and personalization features. Not visible to users.
 * 
 * Uses direct fetch to OpenAI API (no openai package dependency).
 */
import { ENV } from "./env";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const SUMMARY_MODEL = "gpt-4.1-mini";

const SUMMARY_SYSTEM_PROMPT = `You are an internal analysis engine for a coaching platform called A.Cosmos. Your task is to analyze a coaching conversation and produce a structured JSON summary.

You must output ONLY valid JSON with the following fields:
- "topic": Core topic of the conversation in one sentence (string)
- "key_insight": The most important insight the user reached in one sentence. If no clear insight, write "No clear insight reached in this session." (string)
- "emotional_state": The user's emotional state at the end of the session. Choose ONE from: calm, activated, overwhelmed, hopeful, reflective, resistant, curious, uncertain, relieved, determined (string)
- "action_committed": If the user committed to a specific action, describe it. If not, write "None" (string)
- "summary": A 2-3 sentence overview of the conversation capturing the arc and key moments (string)

Guidelines:
- Be concise and precise
- Focus on the user's journey, not the coach's techniques
- Capture emotional shifts, not just topics discussed
- "key_insight" should reflect a moment of genuine recognition or understanding
- "summary" should read like a clinical note — factual, structured, non-judgmental
- Output ONLY the JSON object, no markdown formatting, no code blocks, no explanation`;

interface SummaryResult {
  topic: string;
  key_insight: string;
  emotional_state: string;
  action_committed: string;
  summary: string;
}

/**
 * Generate a structured summary from conversation messages using AI.
 * Returns parsed summary fields or null if generation fails.
 */
export async function generateSessionSummary(
  messages: Array<{ role: string; content: string }>,
  guardianName: string
): Promise<SummaryResult | null> {
  try {
    const apiKey = ENV.openaiApiKey;
    if (!apiKey) {
      console.error("[SessionSummary] No OpenAI API key configured");
      return null;
    }

    // Build the conversation transcript for analysis
    const transcript = messages
      .map(m => `${m.role === "user" ? "User" : guardianName}: ${m.content}`)
      .join("\n\n");

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: SUMMARY_MODEL,
        messages: [
          { role: "system", content: SUMMARY_SYSTEM_PROMPT },
          { role: "user", content: `Analyze the following coaching conversation with ${guardianName} and produce the JSON summary:\n\n${transcript}` },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[SessionSummary] OpenAI API error: ${response.status} – ${errorText}`);
      return null;
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      console.error("[SessionSummary] Empty response from AI");
      return null;
    }

    // Parse JSON — handle potential markdown code blocks
    let jsonStr = content;
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(jsonStr) as SummaryResult;

    // Validate required fields
    if (!parsed.topic || !parsed.summary) {
      console.error("[SessionSummary] Missing required fields in AI response");
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("[SessionSummary] Failed to generate summary:", error);
    return null;
  }
}
