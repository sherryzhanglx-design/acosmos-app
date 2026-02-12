/**
 * Voice transcription using OpenAI Whisper API directly.
 * No intermediate storage needed — audio buffer is sent directly to OpenAI.
 */
import { ENV } from "./env";

const OPENAI_WHISPER_URL = "https://api.openai.com/v1/audio/transcriptions";

export type TranscriptionResult = {
  text: string;
  language?: string;
};

export type TranscriptionError = {
  error: string;
  code: "FILE_TOO_LARGE" | "INVALID_FORMAT" | "TRANSCRIPTION_FAILED" | "SERVICE_ERROR";
  details?: string;
};

/**
 * Transcribe audio buffer to text using OpenAI Whisper API.
 * Accepts raw audio data (Buffer) and sends it directly to OpenAI.
 */
export async function transcribeAudioBuffer(
  audioBuffer: Buffer,
  mimeType: string = "audio/webm"
): Promise<TranscriptionResult | TranscriptionError> {
  try {
    // Step 1: Validate API key
    const apiKey = ENV.openaiApiKey;
    if (!apiKey) {
      return {
        error: "Voice transcription is not available",
        code: "SERVICE_ERROR",
        details: "OpenAI API key is not configured.",
      };
    }

    // Step 2: Validate file size (25MB limit for Whisper)
    const sizeMB = audioBuffer.length / (1024 * 1024);
    if (sizeMB > 25) {
      return {
        error: "Audio file exceeds maximum size limit",
        code: "FILE_TOO_LARGE",
        details: `File size is ${sizeMB.toFixed(2)}MB, maximum allowed is 25MB`,
      };
    }

    // Step 3: Build FormData with audio file
    const ext = getFileExtension(mimeType);
    const filename = `audio.${ext}`;
    const audioBlob = new Blob([new Uint8Array(audioBuffer)], { type: mimeType });

    const formData = new FormData();
    formData.append("file", audioBlob, filename);
    formData.append("model", "whisper-1");
    formData.append("response_format", "json");

    // Step 4: Call OpenAI Whisper API
    const response = await fetch(OPENAI_WHISPER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return {
        error: "Transcription service request failed",
        code: "TRANSCRIPTION_FAILED",
        details: `${response.status} ${response.statusText}${errorText ? `: ${errorText}` : ""}`,
      };
    }

    // Step 5: Parse and return result
    const result = await response.json();

    if (!result.text || typeof result.text !== "string") {
      return {
        error: "Invalid transcription response",
        code: "SERVICE_ERROR",
        details: "Whisper API returned an invalid response format",
      };
    }

    return { text: result.text };
  } catch (error) {
    return {
      error: "Voice transcription failed",
      code: "SERVICE_ERROR",
      details: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Helper: get file extension from MIME type
 */
function getFileExtension(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    "audio/webm": "webm",
    "audio/mp3": "mp3",
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "audio/wave": "wav",
    "audio/ogg": "ogg",
    "audio/m4a": "m4a",
    "audio/mp4": "m4a",
  };
  return mimeToExt[mimeType] || "webm";
}
