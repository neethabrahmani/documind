"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import {
  UploadCloud,
  FileText,
  ImageIcon,
  AlertCircle,
  X,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  FileCode,
} from "lucide-react";
import { UploadedDocument } from "@/lib/types";
import { validateFile, formatFileSize } from "@/lib/utils";

interface DocumentDropzoneProps {
  onDocumentSelected: (doc: UploadedDocument | null) => void;
  currentDocument: UploadedDocument | null;
}

export function DocumentDropzone({
  onDocumentSelected,
  currentDocument,
}: DocumentDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(100);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Process a selected or dropped file
  const handleFile = (file: File) => {
    setErrorMessage(null);

    const validation = validateFile(file);
    if (!validation.valid || !validation.docType) {
      setErrorMessage(validation.error?.message || "Invalid file selected.");
      return;
    }

    // Start upload simulation
    setIsUploading(true);
    setUploadProgress(0);

    const previewUrl =
      validation.docType === "image" ? URL.createObjectURL(file) : undefined;

    const newDoc: UploadedDocument = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      type: validation.docType,
      mimeType: file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "image/jpeg"),
      previewUrl,
      uploadProgress: 0,
      uploadedAt: new Date(),
    };

    // Smooth progress simulation for realistic feedback
    let progress = 15;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 25) + 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadProgress(100);
        setIsUploading(false);
        newDoc.uploadProgress = 100;
        onDocumentSelected(newDoc);
      } else {
        setUploadProgress(progress);
      }
    }, 80);
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
      // Reset input value so re-selecting same file works
      e.target.value = "";
    }
  };

  const handleRemove = () => {
    if (currentDocument?.previewUrl) {
      URL.revokeObjectURL(currentDocument.previewUrl);
    }
    setErrorMessage(null);
    setIsUploading(false);
    setUploadProgress(0);
    onDocumentSelected(null);
  };

  const handleLoadSample = async (samplePath: string, filename: string, type: "pdf" | "image") => {
    try {
      setErrorMessage(null);
      const res = await fetch(samplePath);
      const blob = await res.blob();
      const file = new File([blob], filename, {
        type: type === "pdf" ? "application/pdf" : "image/png",
      });
      handleFile(file);
    } catch {
      setErrorMessage("Could not load sample document. Please try browsing a local file.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
        onChange={handleInputChange}
        className="hidden"
        id="document-file-input"
        aria-label="Upload document"
      />

      {/* Error Alert Banner */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start justify-between rounded-xl border border-red-200 bg-red-50/90 p-3.5 text-xs text-red-800 shadow-sm animate-in fade-in slide-in-from-top-1"
        >
          <div className="flex items-start space-x-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900">Validation Error</p>
              <p className="mt-0.5 text-red-700">{errorMessage}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="rounded-md p-1 text-red-500 hover:bg-red-100 hover:text-red-700"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload Drop Area or Selected File Card */}
      {!currentDocument && !isUploading ? (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
            isDragging
              ? "border-indigo-600 bg-indigo-50/70 scale-[1.01] shadow-md shadow-indigo-100"
              : "border-slate-300 bg-slate-50/60 hover:border-indigo-400 hover:bg-indigo-50/20"
          }`}
        >
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-200 ${
              isDragging
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-300"
                : "bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white"
            }`}
          >
            <UploadCloud className="h-8 w-8" />
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-800">
            {isDragging ? "Drop your file right here" : "Drag and drop document here"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            or <span className="font-semibold text-indigo-600 underline underline-offset-2">browse from your device</span>
          </p>

          <div className="mt-5 flex items-center gap-2 text-[11px] font-medium text-slate-400">
            <span className="rounded-md bg-white px-2 py-0.5 shadow-sm border border-slate-200">
              PDF
            </span>
            <span className="rounded-md bg-white px-2 py-0.5 shadow-sm border border-slate-200">
              PNG
            </span>
            <span className="rounded-md bg-white px-2 py-0.5 shadow-sm border border-slate-200">
              JPG / JPEG
            </span>
            <span className="text-slate-400">• Max 10MB</span>
          </div>
        </div>
      ) : isUploading ? (
        /* Uploading State */
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-6">
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-900">
            <span className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
              Validating and uploading document...
            </span>
            <span>{uploadProgress}%</span>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-indigo-100">
            <div
              className="h-full bg-indigo-600 transition-all duration-150 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      ) : (
        /* Active Selected Document Card */
        currentDocument && (
          <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/60 to-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3.5">
                {/* Document Type Icon Badge */}
                <div
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${
                    currentDocument.type === "pdf"
                      ? "bg-rose-500 shadow-rose-200"
                      : "bg-blue-600 shadow-blue-200"
                  }`}
                >
                  {currentDocument.type === "pdf" ? (
                    <FileText className="h-6 w-6" />
                  ) : (
                    <ImageIcon className="h-6 w-6" />
                  )}
                </div>

                {/* Document Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3
                      className="truncate text-sm font-bold text-slate-900"
                      title={currentDocument.name}
                    >
                      {currentDocument.name}
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Validated
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium uppercase text-slate-600">
                      {currentDocument.type === "pdf" ? "PDF Document" : "Image / Scan"}
                    </span>
                    <span>•</span>
                    <span>{formatFileSize(currentDocument.size)}</span>
                    <span>•</span>
                    <span>{currentDocument.mimeType}</span>
                  </div>
                </div>
              </div>

              {/* Remove / Clear Button */}
              <button
                type="button"
                onClick={handleRemove}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                title="Remove document"
                aria-label="Remove document"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Action Row: Replace file */}
            <div className="mt-4 flex items-center justify-between border-t border-indigo-100/60 pt-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Replace with different file
              </button>
              <span className="text-[11px] text-slate-400">
                Ready for Phase 3 Extraction
              </span>
            </div>
          </div>
        )
      )}

      {/* Quick Test Sample Documents */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
          Quick Test with Sample Documents:
        </p>
        <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() =>
              handleLoadSample(
                "/samples/arrays-questions.pdf",
                "Arrays-Questions.pdf",
                "pdf"
              )
            }
            className="flex items-center justify-between rounded-lg border border-purple-200 bg-purple-50/60 px-2.5 py-2 text-left text-xs font-semibold text-purple-900 hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <span className="flex items-center gap-1.5 truncate">
              <FileCode className="h-3.5 w-3.5 text-purple-600" />
              <span className="truncate">Arrays (PDF)</span>
            </span>
            <ArrowRight className="h-3 w-3 text-purple-400" />
          </button>

          <button
            type="button"
            onClick={() =>
              handleLoadSample(
                "/samples/java-grooming.pdf",
                "Java-Grooming.pdf",
                "pdf"
              )
            }
            className="flex items-center justify-between rounded-lg border border-indigo-100 bg-indigo-50/50 px-2.5 py-2 text-left text-xs font-semibold text-indigo-900 hover:border-indigo-300 hover:bg-indigo-50/80 transition-colors"
          >
            <span className="flex items-center gap-1.5 truncate">
              <FileCode className="h-3.5 w-3.5 text-indigo-600" />
              <span className="truncate">Java (PDF)</span>
            </span>
            <ArrowRight className="h-3 w-3 text-indigo-400" />
          </button>

          <button
            type="button"
            onClick={() =>
              handleLoadSample(
                "/samples/sample-report.pdf",
                "sample-business-report.pdf",
                "pdf"
              )
            }
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-2 text-left text-xs font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors"
          >
            <span className="flex items-center gap-1.5 truncate">
              <FileCode className="h-3.5 w-3.5 text-rose-500" />
              <span className="truncate">Report (PDF)</span>
            </span>
            <ArrowRight className="h-3 w-3 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() =>
              handleLoadSample(
                "/samples/sample-invoice.png",
                "sample-invoice.png",
                "image"
              )
            }
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-2 text-left text-xs font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors"
          >
            <span className="flex items-center gap-1.5 truncate">
              <ImageIcon className="h-3.5 w-3.5 text-blue-500" />
              <span className="truncate">Invoice (PNG)</span>
            </span>
            <ArrowRight className="h-3 w-3 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
