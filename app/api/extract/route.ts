import { NextRequest, NextResponse } from "next/server";
import { extractPdf } from "@/lib/extractors/pdf-extractor";
import { extractOcr } from "@/lib/extractors/ocr-extractor";

export const dynamic = "force-dynamic";

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
        { status: 400 }
      );
    }

    const filename = file.name.toLowerCase();
    const mimeType = file.type.toLowerCase();

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
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process PDF Extraction (Phase 3)
    if (isPdf) {
      const result = await extractPdf(buffer);
      if (!result.success) {
        return NextResponse.json(result, { status: 422 });
      }
      return NextResponse.json(
        { ...result, extractionMethod: "pdf-parser" },
        { status: 200 }
      );
    }

    // Process Image OCR Extraction (Phase 4)
    if (isImage) {
      const ocrResult = await extractOcr(buffer);
      if (!ocrResult.success) {
        return NextResponse.json(ocrResult, { status: 422 });
      }
      return NextResponse.json(
        { ...ocrResult, extractionMethod: "ocr" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to process the document.",
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("API /api/extract error:", error);
    return NextResponse.json(
      {
        success: false,
        message: `An error occurred during document extraction: ${
          error?.message || "Internal server error"
        }`,
      },
      { status: 500 }
    );
  }
}
