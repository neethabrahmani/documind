"use client";

import React, { useState } from "react";
import {
  FileText,
  Sparkles,
  Sliders,
  CheckCircle2,
  Zap,
  ShieldCheck,
  FileType,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  FileSearch,
  ScanText,
  BookOpen,
} from "lucide-react";
import { DocumentDropzone } from "@/components/DocumentDropzone";
import { ExtractedTextPanel } from "@/components/ExtractedTextPanel";
import { SummaryResultPanel } from "@/components/SummaryResultPanel";
import { UploadedDocument, ExtractionResult, ProcessingStage } from "@/lib/types";
import { SummaryOutput } from "@/lib/summarizers";

type SummaryLength = "short" | "medium" | "long";
type ActiveTab = "summary" | "extracted";

export default function HomePage() {
  const [currentDocument, setCurrentDocument] = useState<UploadedDocument | null>(null);
  const [summaryLength, setSummaryLength] = useState<SummaryLength>("medium");
  const [stage, setStage] = useState<ProcessingStage>("idle");
  const [activeTab, setActiveTab] = useState<ActiveTab>("extracted");

  const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  const [summaryData, setSummaryData] = useState<SummaryOutput | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);

  // Server-side text extraction (PDF / OCR)
  const handleExtractDocument = async (doc: UploadedDocument) => {
    setStage("extracting");
    setExtractionError(null);
    setSummaryData(null);
    setSummaryError(null);

    try {
      const formData = new FormData();
      formData.append("file", doc.file);

      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      const data: ExtractionResult = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to extract text from document.");
      }

      setExtraction(data);
      setStage("extracted");
      setActiveTab("extracted");
    } catch (err: any) {
      setExtractionError(err?.message || "An unexpected error occurred during extraction.");
      setStage("error");
    }
  };

  // Summarization generator with explicit length override handling
  const handleGenerateSummary = async (lengthOverride?: SummaryLength) => {
    if (!extraction?.text) return;

    const targetLength = lengthOverride || summaryLength;
    setSummaryLength(targetLength);

    setIsSummarizing(true);
    setSummaryError(null);

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: extraction.text,
          length: targetLength,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to generate document summary.");
      }

      setSummaryData(data);
      setActiveTab("summary");
      setStage("completed");
    } catch (err: any) {
      setSummaryError(err?.message || "An unexpected error occurred during summarization.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleDocumentSelected = (doc: UploadedDocument | null) => {
    setCurrentDocument(doc);
    setExtraction(null);
    setExtractionError(null);
    setSummaryData(null);
    setSummaryError(null);

    if (doc) {
      handleExtractDocument(doc);
    } else {
      setStage("idle");
    }
  };

  const handleTextChange = (newText: string) => {
    if (!extraction) return;
    const words = newText ? newText.split(/\s+/).filter(Boolean) : [];
    setExtraction({
      ...extraction,
      text: newText,
      wordCount: words.length,
      characterCount: newText.length,
      readingTimeMinutes: Math.max(1, Math.ceil(words.length / 200)),
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-3.5 py-1 text-xs font-semibold text-indigo-700 shadow-sm backdrop-blur-sm">
          <Zap className="h-3.5 w-3.5 text-indigo-600" />
          <span>Next-Gen Document Intelligence</span>
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Transform Documents into{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
            Smart Summaries
          </span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600 sm:text-lg">
          Upload any PDF report or scanned document image (JPG/PNG). Extract text
          flawlessly with OCR and generate concise, structured summaries with key takeaways.
        </p>
      </div>

      {/* Main App Workspace Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Upload & Controls (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Upload Card */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center space-x-2">
                <FileType className="h-5 w-5 text-indigo-600" />
                <h2 className="text-base font-semibold text-slate-900">
                  Document Ingestion
                </h2>
              </div>
              <span className="text-xs font-medium text-slate-500">PDF & Images</span>
            </div>

            {/* Interactive Document Dropzone */}
            <DocumentDropzone
              currentDocument={currentDocument}
              onDocumentSelected={handleDocumentSelected}
            />

            {/* Format Badges */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                <FileType className="h-3 w-3" /> PDF Documents
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                <FileType className="h-3 w-3" /> PNG / JPG Scans
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                <ShieldCheck className="h-3 w-3 text-emerald-600" /> Auto-Validation
              </span>
            </div>
          </div>

          {/* Configuration Settings & Summarize CTA */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
              <Sliders className="h-5 w-5 text-indigo-600" />
              <h2 className="text-base font-semibold text-slate-900">
                Summary Preferences
              </h2>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">
                  Target Length
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["short", "medium", "long"] as const).map((len) => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => {
                        setSummaryLength(len);
                        if (summaryData) {
                          handleGenerateSummary(len);
                        }
                      }}
                      className={`rounded-lg p-2.5 text-center text-xs transition-all capitalize ${
                        summaryLength === len
                          ? "border-2 border-indigo-600 bg-indigo-50/70 font-bold text-indigo-900 shadow-sm"
                          : "border border-slate-200 bg-slate-50 font-medium text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {len}
                      <span className="block text-[10px] font-normal text-slate-500">
                        {len === "short"
                          ? "~100 words"
                          : len === "medium"
                          ? "~250 words"
                          : "~500 words"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Summary CTA Button */}
              <button
                type="button"
                onClick={() => handleGenerateSummary()}
                disabled={!extraction?.text || isSummarizing}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-3 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSummarizing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Generating Smart Summary...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Smart Summary</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Output & Preview (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Main Results Container */}
          <div className="min-h-[540px] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              {/* Header with View Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center rounded-xl bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab("summary")}
                      disabled={!summaryData}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                        activeTab === "summary"
                          ? "bg-white text-indigo-700 shadow-sm"
                          : "text-slate-600 hover:text-slate-900 disabled:opacity-40"
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Summary & Insights</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("extracted")}
                      disabled={!extraction}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                        activeTab === "extracted"
                          ? "bg-white text-indigo-700 shadow-sm"
                          : "text-slate-600 hover:text-slate-900 disabled:opacity-40"
                      }`}
                    >
                      <FileSearch className="h-3.5 w-3.5 text-slate-500" />
                      <span>Extracted Text</span>
                    </button>
                  </div>
                </div>

                <span
                  className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${
                    isSummarizing
                      ? "bg-indigo-100 text-indigo-800 animate-pulse"
                      : summaryData
                      ? "bg-emerald-100 text-emerald-800"
                      : stage === "extracted"
                      ? "bg-indigo-100 text-indigo-800"
                      : stage === "extracting"
                      ? "bg-amber-100 text-amber-800 animate-pulse"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {isSummarizing
                    ? "Summarizing..."
                    : summaryData
                    ? "Summary Ready"
                    : stage === "extracted"
                    ? "Extracted (Ready to Summarize)"
                    : stage === "extracting"
                    ? "Extracting..."
                    : "Awaiting Document"}
                </span>
              </div>

              {/* State Content */}
              {!currentDocument ? (
                /* Empty / Placeholder State */
                <div className="mt-16 flex flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <FileText className="h-8 w-8" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-slate-800">
                    No Document Loaded Yet
                  </h3>
                  <p className="mt-1 max-w-sm text-sm text-slate-500">
                    Upload a PDF document or scanned image on the left to extract text and
                    generate smart summaries with key takeaways.
                  </p>
                </div>
              ) : stage === "extracting" ? (
                /* Extraction Loading State */
                <div className="mt-20 flex flex-col items-center justify-center text-center py-10">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                    <FileText className="h-6 w-6 text-indigo-600 absolute inset-0 m-auto" />
                  </div>
                  <h3 className="mt-5 text-base font-bold text-slate-800">
                    {currentDocument?.type === "image"
                      ? "OCR Processing Document"
                      : "Extracting Document Text"}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 max-w-xs">
                    {currentDocument?.type === "image"
                      ? "Running Tesseract OCR engine, recognizing characters and formatting layout..."
                      : "Parsing server-side PDF structure, normalizing line breaks, and preserving paragraphs..."}
                  </p>
                </div>
              ) : stage === "error" || extractionError ? (
                /* Error State */
                <div className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                  <AlertCircle className="mx-auto h-10 w-10 text-red-600 mb-3" />
                  <h3 className="text-sm font-bold text-red-900">
                    Extraction Error
                  </h3>
                  <p className="mt-1 text-xs text-red-700 max-w-md mx-auto">
                    {extractionError}
                  </p>
                  <button
                    type="button"
                    onClick={() => currentDocument && handleExtractDocument(currentDocument)}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors shadow-sm"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Retry Extraction
                  </button>
                </div>
              ) : isSummarizing ? (
                /* Summarization Loading State */
                <div className="mt-20 flex flex-col items-center justify-center text-center py-10">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                    <Sparkles className="h-6 w-6 text-indigo-600 absolute inset-0 m-auto" />
                  </div>
                  <h3 className="mt-5 text-base font-bold text-slate-800">
                    Synthesizing Smart Summary
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 max-w-xs">
                    Ranking core concepts, scoring key sentences, and extracting action points...
                  </p>
                </div>
              ) : summaryError ? (
                /* Summarization Error */
                <div className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                  <AlertCircle className="mx-auto h-10 w-10 text-red-600 mb-3" />
                  <h3 className="text-sm font-bold text-red-900">
                    Summarization Error
                  </h3>
                  <p className="mt-1 text-xs text-red-700 max-w-md mx-auto">
                    {summaryError}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleGenerateSummary()}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors shadow-sm"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Retry Summary
                  </button>
                </div>
              ) : activeTab === "summary" && summaryData ? (
                /* Summary Result View */
                <div className="mt-4">
                  <SummaryResultPanel
                    documentName={currentDocument?.name || "document.pdf"}
                    summaryData={summaryData}
                    onLengthChange={(len) => handleGenerateSummary(len)}
                    isLoading={isSummarizing}
                  />
                </div>
              ) : extraction ? (
                /* Extracted Text View */
                <div className="mt-4">
                  <ExtractedTextPanel
                    document={currentDocument}
                    extraction={extraction}
                    onTextChange={handleTextChange}
                  />
                </div>
              ) : null}
            </div>

            {/* Quick Assurance Bar */}
            <div className="mt-6 border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>Short, Medium, Long options</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>Extractive fallback active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>Key takeaways & metrics</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
