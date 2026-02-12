/**
 * ElevenLabs Text-to-Speech Integration
 * 
 * Provides TTS functionality for Guardian voice responses.
 * Currently configured for Axel (transformation) only.
 */

// Voice ID mapping for each Guardian
const GUARDIAN_VOICES: Record<string, string> = {
  transformation: "u3ApgO7Ql8TWHjWdlX3q", // Axel
  // Future: Add other guardians here
  // career: "voice_id_for_andy",
  // anxiety: "voice_id_for_anya",
  // relationships: "voice_id_for_alma",
};

// Guardians that have TTS enabled
export function isTTSEnabled(guardianSlug: string): boolean {
  return guardianSlug in GUARDIAN_VOICES;
}

/**
 * Convert text to speech using ElevenLabs API
 * Returns an audio buffer (mp3)
 */
export async function textToSpeech(
  text: string,
  guardianSlug: string
): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not configured");
  }

  const voiceId = GUARDIAN_VOICES[guardianSlug];
  if (!voiceId) {
    throw new Error(`No voice configured for guardian: ${guardianSlug}`);
  }

  // Strip markdown formatting for cleaner speech
  const cleanText = stripMarkdown(text);

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: cleanText,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.6,       // Higher = more stable, less harsh edges
          similarity_boost: 0.6, // Lower = slightly softer, more natural warmth
          style: 0.2,           // Higher = more expressive, adds emotional warmth
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[TTS] ElevenLabs API error (${response.status}):`, errorText);
    throw new Error(`ElevenLabs API error: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Strip markdown formatting from text for cleaner TTS output
 */
function stripMarkdown(text: string): string {
  return text
    // Remove [PHASE_CLOSURE] marker
    .replace(/\[PHASE_CLOSURE\]/g, "")
    // Remove bold/italic markers
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    // Remove headers
    .replace(/^#{1,6}\s+/gm, "")
    // Remove bullet points but keep text
    .replace(/^[\s]*[-*+]\s+/gm, "")
    // Remove numbered lists prefix
    .replace(/^[\s]*\d+\.\s+/gm, "")
    // Remove blockquotes
    .replace(/^>\s+/gm, "")
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`(.+?)`/g, "$1")
    // Remove links but keep text
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    // Remove horizontal rules
    .replace(/^---+$/gm, "")
    // Clean up extra whitespace
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
