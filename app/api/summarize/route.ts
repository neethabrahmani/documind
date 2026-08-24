import { NextRequest, NextResponse } from "next/server";
import { generateSummary } from "@/lib/summarizers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, length = "medium" } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Document text is required for summarization.",
        },
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const validLengths = ["short", "medium", "long"];
    const targetLength = validLengths.includes(length) ? length : "medium";

    const result = await generateSummary(text.trim(), targetLength);

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("API /api/summarize error:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Summarization failed: ${
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
