"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Zap,
  CheckCircle2,
  FileText,
  TrendingDown,
  ShieldCheck,
  Copy,
  Check,
  Download,
  FileCode,
  FileType,
  Share2,
} from "lucide-react";
import { SummaryOutput } from "@/lib/summarizers";
import {
  copySummaryToClipboard,
  downloadTxtSummary,
  downloadMarkdownSummary,
  downloadPdfSummary,
} from "@/lib/export-utils";

interface SummaryResultPanelProps {
  documentName?: string;
  summaryData: SummaryOutput;
  onLengthChange: (length: "short" | "medium" | "long") => void;
  isLoading: boolean;
}

export function SummaryResultPanel({
  documentName = "document.pdf",
  summaryData,
  onLengthChange,
  isLoading,
}: SummaryResultPanelProps) {
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleCopy = async () => {
    const success = await copySummaryToClipboard({ documentName, summaryData });
    if (success) {
      setCopied(true);
      showToast("Summary copied to clipboard successfully!");
      setTimeout(() => setCopied(false), 2500);
    } else {
      showToast("Failed to copy to clipboard.");
    }
  };

  const handleDownloadTxt = () => {
    downloadTxtSummary({ documentName, summaryData });
    showToast("Downloaded summary as TXT file (.txt)!");
  };

  const handleDownloadMarkdown = () => {
    downloadMarkdownSummary({ documentName, summaryData });
    showToast("Downloaded summary as Markdown file (.md)!");
  };

  const handleDownloadPdf = () => {
    downloadPdfSummary({ documentName, summaryData });
    showToast("Generated and downloaded formatted PDF report (.pdf)!");
  };

  return (
    <div className="flex flex-col h-full space-y-5 relative">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-900 shadow-lg shadow-emerald-900/10 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Metadata Badges & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-3.5">
        {/* Engine Badge & Preset */}
        <div className="flex items-center gap-2">
          {summaryData.engine === "gemini" ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white shadow-sm shadow-indigo-200">
              <Sparkles className="h-3.5 w-3.5" />
              Gemini AI Flash
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1 text-xs font-bold text-white shadow-sm shadow-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Extractive Offline Engine
            </span>
          )}

          <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200 shadow-sm capitalize">
            {summaryData.length} Preset
          </span>
        </div>

        {/* Compression & Word Count Stats */}
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5 text-indigo-600" />
            <span>
              <strong>{summaryData.summaryWordCount}</strong> words
            </span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1 text-emerald-700 font-semibold">
            <TrendingDown className="h-3.5 w-3.5" />
            <span>{summaryData.reductionPercentage}% Reduction</span>
          </div>
        </div>
      </div>

      {/* Action Bar: Export & Copy Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Share2 className="h-3.5 w-3.5 text-indigo-600" />
          <span>Export Options:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors shadow-xs"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-500" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* TXT Download Button */}
          <button
            type="button"
            onClick={handleDownloadTxt}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors shadow-xs"
          >
            <FileType className="h-3.5 w-3.5 text-amber-600" />
            <span>TXT</span>
          </button>

          {/* Markdown Download Button */}
          <button
            type="button"
            onClick={handleDownloadMarkdown}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors shadow-xs"
          >
            <FileCode className="h-3.5 w-3.5 text-indigo-600" />
            <span>Markdown</span>
          </button>

          {/* PDF Download Button */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>PDF Report</span>
          </button>
        </div>
      </div>

      {/* Main Narrative Executive Summary Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Executive Summary
            </h3>
          </div>
          <span className="text-[11px] font-medium text-slate-400">
            {summaryData.originalWordCount} &rarr; {summaryData.summaryWordCount} words
          </span>
        </div>

        <div className="text-xs leading-relaxed text-slate-700 space-y-3 font-sans whitespace-pre-wrap">
          {summaryData.summary}
        </div>
      </div>

      {/* Key Takeaways & Highlights */}
      {summaryData.keyTakeaways && summaryData.keyTakeaways.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-3.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Key Points & Main Ideas
            </h3>
          </div>

          <ul className="space-y-2.5">
            {summaryData.keyTakeaways.map((point, index) => (
              <li
                key={index}
                className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-white p-3 text-xs leading-relaxed text-slate-800 shadow-sm hover:border-indigo-200 transition-colors"
              >
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[11px] font-bold text-indigo-700 mt-0.5">
                  {index + 1}
                </div>
                <span className="flex-1 font-medium">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Fast Preset Target Switcher */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-slate-600 font-medium">Switch length target:</span>
        <div className="flex items-center gap-1.5">
          {(["short", "medium", "long"] as const).map((len) => (
            <button
              key={len}
              type="button"
              disabled={isLoading}
              onClick={() => onLengthChange(len)}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-all capitalize ${
                summaryData.length === len
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
              } disabled:opacity-50`}
            >
              {len}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
