import { createWorker } from "tesseract.js";
import fs from "fs";
import path from "path";
import os from "os";

export interface OcrExtractionResult {
  success: boolean;
  text: string;
  pageCount: number;
  wordCount: number;
  characterCount: number;
  readingTimeMinutes: number;
  ocrConfidence?: number;
  isScanned: boolean;
  requiresOcr: boolean;
  message: string;
}

/**
 * Normalizes text extracted via OCR by stripping noise and formatting paragraphs
 */
export function cleanOcrText(rawText: string): string {
  if (!rawText) return "";

  return rawText
    // Standardize line endings
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    // Replace non-breaking spaces with standard spaces
    .replace(/\u00A0/g, " ")
    // Clean up isolated noise characters often produced by OCR on borders
    .replace(/^[|~`_—\-–]{1,3}$/gm, "")
    // Replace 3+ consecutive newlines with 2 newlines (clean paragraphs)
    .replace(/\n{3,}/g, "\n\n")
    // Trim each line
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}

/**
 * Executes OCR on an image buffer (PNG/JPG/JPEG/WEBP) server-side
 * Uses pre-bundled local traineddata cache for sub-second execution on Vercel Serverless
 */
export async function extractOcr(buffer: Buffer): Promise<OcrExtractionResult> {
  let worker: any = null;
  try {
    const tmpDir = os.tmpdir();
    const tmpTrainedData = path.join(tmpDir, "eng.traineddata");

    // Copy bundled traineddata to /tmp cache if not yet present
    if (!fs.existsSync(tmpTrainedData)) {
      const candidates = [
        path.join(process.cwd(), "eng.traineddata"),
        path.join(process.cwd(), "public", "eng.traineddata"),
      ];
      for (const cand of candidates) {
        if (fs.existsSync(cand)) {
          try {
            fs.copyFileSync(cand, tmpTrainedData);
            break;
          } catch {
            // Ignore copy failure
          }
        }
      }
    }

    worker = await createWorker("eng", 1, {
      cachePath: tmpDir,
      gzip: false,
      logger: () => {},
    });

    const ret = await worker.recognize(buffer);
    const rawText = ret?.data?.text || "";
    const confidence =
      typeof ret?.data?.confidence === "number"
        ? Math.round(ret.data.confidence)
        : undefined;

    const cleanedText = cleanOcrText(rawText);
    const words = cleanedText ? cleanedText.split(/\s+/).filter(Boolean) : [];
    const wordCount = words.length;
    const characterCount = cleanedText.length;
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

    // Handle images with no readable text
    if (wordCount < 3) {
      return {
        success: false,
        text: "",
        pageCount: 1,
        wordCount: 0,
        characterCount: 0,
        readingTimeMinutes: 0,
        ocrConfidence: confidence,
        isScanned: true,
        requiresOcr: true,
        message:
          "No readable text detected in this image. Please ensure the document is clear, well-lit, and in focus.",
      };
    }

    return {
      success: true,
      text: cleanedText,
      pageCount: 1,
      wordCount,
      characterCount,
      readingTimeMinutes,
      ocrConfidence: confidence,
      isScanned: true,
      requiresOcr: false,
      message: `Successfully recognized ${wordCount} words via OCR with ${
        confidence !== undefined ? confidence + "%" : "high"
      } recognition confidence.`,
    };
  } catch (error: any) {
    const errorMsg = error?.message || "Unknown OCR engine error";
    return {
      success: false,
      text: "",
      pageCount: 1,
      wordCount: 0,
      characterCount: 0,
      readingTimeMinutes: 0,
      isScanned: true,
      requiresOcr: true,
      message: `OCR text recognition failed: ${errorMsg}. Please verify the image format.`,
    };
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch {
        // Ignore worker cleanup error
      }
    }
  }
}
