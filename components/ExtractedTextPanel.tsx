"use client";

import React, { useState } from "react";
import {
  FileText,
  Copy,
  Check,
  Edit3,
  BookOpen,
  Clock,
  Layers,
  Sparkles,
  AlertTriangle,
  Info,
  ScanText,
  ShieldCheck,
} from "lucide-react";
import { ExtractionResult, UploadedDocument } from "@/lib/types";

interface ExtractedTextPanelProps {
  document: UploadedDocument;
  extraction: ExtractionResult;
  onTextChange: (newText: string) => void;
}

export function ExtractedTextPanel({
  document,
  extraction,
  onTextChange,
}: ExtractedTextPanelProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleCopy = async () => {
    if (!extraction.text) return;
    try {
      await navigator.clipboard.writeText(extraction.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Document Stats Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <Layers className="h-3.5 w-3.5 text-indigo-600" />
            <span>Pages / Views</span>
          </div>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {extraction.pageCount || 1}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <FileText className="h-3.5 w-3.5 text-indigo-600" />
            <span>Words</span>
          </div>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {extraction.wordCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
            <span>Characters</span>
          </div>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {extraction.characterCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <Clock className="h-3.5 w-3.5 text-indigo-600" />
            <span>Read Time</span>
          </div>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {extraction.readingTimeMinutes} min
          </p>
        </div>
      </div>

      {/* OCR Confidence Badge (If extracted via OCR) */}
      {extraction.ocrConfidence !== undefined && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-2.5 text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <ScanText className="h-4 w-4 text-emerald-700 flex-shrink-0" />
            <span className="font-medium">
              Extracted via <strong>Tesseract OCR</strong> Engine
            </span>
          </div>
          <span className="inline-flex items-center rounded-full bg-emerald-200/70 px-2.5 py-0.5 font-bold text-emerald-950">
            {extraction.ocrConfidence}% Confidence
          </span>
        </div>
      )}

      {/* Scanned Document Alert (If empty PDF with no OCR) */}
      {extraction.isScanned && extraction.ocrConfidence === undefined && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-950">Scanned Document Notice</p>
            <p className="mt-0.5 text-amber-800">
              {extraction.message ||
                "No selectable text found in this PDF."}
            </p>
          </div>
        </div>
      )}

      {/* Extracted Text Box */}
      <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 p-4 flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {extraction.extractionMethod === "ocr"
                ? "OCR Recognized Text"
                : "Extracted Document Text"}
            </span>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-800">
              {extraction.extractionMethod === "ocr" ? "Tesseract OCR" : "Preserved Layout"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5 text-slate-500" />
              <span>{isEditing ? "Done Editing" : "Edit Text"}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!extraction.text}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm disabled:opacity-50 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>
        </div>

        {isEditing ? (
          <textarea
            value={extraction.text}
            onChange={(e) => onTextChange(e.target.value)}
            className="flex-1 w-full min-h-[220px] rounded-lg border border-indigo-300 p-3 text-xs font-mono text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 bg-white"
            placeholder="Recognized text will appear here..."
          />
        ) : (
          <div className="flex-1 min-h-[220px] max-h-[360px] overflow-y-auto rounded-lg border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-800 whitespace-pre-wrap font-sans select-text">
            {extraction.text ? (
              extraction.text
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center py-8">
                <Info className="h-6 w-6 mb-2 text-slate-300" />
                <p className="font-medium">No text content recognized.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summarization Readiness Notice */}
      <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-xs text-indigo-900">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-600 flex-shrink-0" />
          <span className="font-medium">
            Text verified & ready for AI / Extractive Summarization (Phase 5).
          </span>
        </div>
      </div>
    </div>
  );
}
