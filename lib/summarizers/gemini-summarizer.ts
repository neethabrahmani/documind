import { SummaryOutput } from "./extractive-summarizer";

/**
 * Summarizes document text using Google Gemini 1.5/2.0 Flash API
 * Server-side only: uses process.env.GEMINI_API_KEY
 */
export async function summarizeWithGemini(
  text: string,
  targetLength: "short" | "medium" | "long" = "medium"
): Promise<SummaryOutput> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }

  const words = text ? text.split(/\s+/).filter(Boolean) : [];
  const originalWordCount = words.length;

  if (originalWordCount === 0) {
    throw new Error("Cannot summarize empty document text.");
  }

  const lengthInstructions = {
    short: "Generate an ultra-concise executive summary of approximately 50-80 words.",
    medium: "Generate a well-balanced structured executive summary of approximately 150-200 words across 2 clear paragraphs.",
    long: "Generate a comprehensive in-depth summary of approximately 350-450 words detailing all key sections, metrics, and context.",
  }[targetLength];

  const prompt = `You are an expert document summarizer. Analyze the following document text and provide a structured JSON response with two fields:
1. "summary": A clean narrative summary. ${lengthInstructions}
2. "keyTakeaways": An array of 3 to 5 clear, actionable bullet points highlighting critical metrics, dates, entities, or conclusions.

Document Text:
"""
${text}
"""

Respond ONLY with valid JSON in this exact structure, with no markdown code fences:
{
  "summary": "...",
  "keyTakeaways": ["...", "..."]
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Clean JSON fences if model wrapped response in ```json ... ```
  const cleanedJson = rawContent
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: { summary?: string; keyTakeaways?: string[] } = {};
  try {
    parsed = JSON.parse(cleanedJson);
  } catch {
    // If JSON parsing fails, use the raw content as summary
    parsed = {
      summary: rawContent.trim(),
      keyTakeaways: [],
    };
  }

  const summary = parsed.summary || rawContent.trim();
  const keyTakeaways = Array.isArray(parsed.keyTakeaways) ? parsed.keyTakeaways : [];
  const summaryWords = summary.split(/\s+/).filter(Boolean).length;
  const reductionPercentage = Math.max(
    0,
    Math.round(((originalWordCount - summaryWords) / originalWordCount) * 100)
  );

  return {
    summary,
    keyTakeaways,
    engine: "gemini",
    length: targetLength,
    originalWordCount,
    summaryWordCount: summaryWords,
    reductionPercentage,
  };
}
