import { SummaryOutput, summarizeExtractive } from "./extractive-summarizer";
import { summarizeWithGemini } from "./gemini-summarizer";

export * from "./extractive-summarizer";
export * from "./gemini-summarizer";

/**
 * Unified Summarization Router:
 * - Attempts Gemini AI if GEMINI_API_KEY is configured.
 * - Automatically falls back to local Extractive Summarizer if key is missing or API errors.
 */
export async function generateSummary(
  text: string,
  targetLength: "short" | "medium" | "long" = "medium"
): Promise<SummaryOutput> {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY?.trim());

  if (hasGeminiKey) {
    try {
      return await summarizeWithGemini(text, targetLength);
    } catch (err: any) {
      console.warn(
        "Gemini AI summarization failed or quota exceeded; falling back to offline extractive summarizer.",
        err?.message
      );
    }
  }

  // Primary / Fallback Engine: Zero-Config Extractive Summarizer
  return summarizeExtractive(text, targetLength);
}
