/**
 * OpenAI GPT-5.2 integration for specific guardians.
 * Uses the unified OPENAI_API_KEY (or legacy OpenAIAPIKey4Manus).
 * Configured for all 4 active guardians (Andy, Anya, Alma, Axel).
 */

import { ENV } from "./_core/env";
import type { Message, InvokeResult } from "./_core/llm";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = "gpt-5.2"; // Upgraded to GPT-5.2 — OpenAI's flagship model as of Feb 2026

// Guardians that should use OpenAI instead of built-in LLM
const OPENAI_GUARDIAN_SLUGS = new Set(["career", "anxiety", "relationships", "transformation"]);

/**
 * Check if a guardian slug should use OpenAI GPT
 */
export function shouldUseOpenAI(slug: string): boolean {
  return OPENAI_GUARDIAN_SLUGS.has(slug) && !!ENV.openaiApiKey;
}

/**
 * Normalize messages for OpenAI API format
 */
function normalizeMessages(messages: Message[]): Array<{ role: string; content: string }> {
  return messages.map(m => ({
    role: m.role,
    content: typeof m.content === "string" 
      ? m.content 
      : Array.isArray(m.content) 
        ? m.content.map(part => typeof part === "string" ? part : ("text" in part ? part.text : "")).join("\n")
        : String(m.content),
  }));
}

/**
 * Invoke OpenAI GPT for guardian conversations.
 * Returns the same InvokeResult shape as the built-in invokeLLM for compatibility.
 */
export async function invokeOpenAI(params: { messages: Message[] }): Promise<InvokeResult> {
  const apiKey = ENV.openaiApiKey;
  if (!apiKey) {
    throw new Error("OpenAI API key is not configured. Set OPENAI_API_KEY or OpenAIAPIKey4Manus environment variable.");
  }

  const payload = {
    model: OPENAI_MODEL,
    messages: normalizeMessages(params.messages),
    max_completion_tokens: 4096,
  };

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenAI invoke failed: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  return (await response.json()) as InvokeResult;
}
