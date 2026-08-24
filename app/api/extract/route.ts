import { NextRequest, NextResponse } from "next/server";
import { extractPdf } from "@/lib/extractors/pdf-extractor";
import { extractOcr } from "@/lib/extractors/ocr-extractor";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Timeout race helper to guarantee the API always responds with valid JSON
 * before Vercel's serverless gateway timeout closes the connection.
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutErrorMsg: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutErrorMsg)), timeoutMs)
    ),
  ]);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "No document file provided in request payload.",
        },
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const filename = (file.name || "document").toLowerCase();
    const mimeType = (file.type || "").toLowerCase();

    // Check if file is PDF
    const isPdf =
      mimeType === "application/pdf" ||
      filename.endsWith(".pdf");

    // Check if file is image (PNG/JPG/JPEG/WEBP)
    const isImage =
      mimeType.startsWith("image/") ||
      filename.endsWith(".png") ||
      filename.endsWith(".jpg") ||
      filename.endsWith(".jpeg") ||
      filename.endsWith(".webp");

    if (!isPdf && !isImage) {
      return NextResponse.json(
        {
          success: false,
          message: `Unsupported file format "${file.name}". Please upload a PDF or image file (PNG, JPG, JPEG, WEBP).`,
        },
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process PDF Extraction with 8.5s timeout guard
    if (isPdf) {
      const result = await withTimeout(
        extractPdf(buffer),
        8500,
        "PDF extraction timed out. The file may contain complex vector streams."
      );

      if (!result.success) {
        return NextResponse.json(result, {
          status: 422,
          headers: { "Content-Type": "application/json" },
        });
      }
      return NextResponse.json(
        { ...result, extractionMethod: "pdf-parser" },
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Process Image OCR Extraction with 8.5s timeout guard
    if (isImage) {
      try {
        const ocrResult = await withTimeout(
          extractOcr(buffer),
          8500,
          "Serverless OCR execution exceeded the 8s time budget."
        );

        if (!ocrResult.success) {
          return NextResponse.json(ocrResult, {
            status: 422,
            headers: { "Content-Type": "application/json" },
          });
        }
        return NextResponse.json(
          { ...ocrResult, extractionMethod: "ocr" },
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      } catch (ocrErr: any) {
        // Return structured JSON fallback instead of letting Vercel timeout
        return NextResponse.json(
          {
            success: false,
            message: `OCR processing took too long on the serverless instance: ${ocrErr?.message || "Timeout"}. Please upload a smaller/cropped image.`,
            isScanned: true,
            requiresOcr: true,
          },
          {
            status: 422,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to process the document format.",
      },
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("API /api/extract error:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Document extraction failed: ${
          error?.message || "Internal server error"
        }`,
      },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
