import React from "react";
import { Sparkles, FileSearch, Layers } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-6 text-slate-500">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4 text-xs">
          <span className="flex items-center gap-1">
            <FileSearch className="h-3.5 w-3.5 text-indigo-500" />
            PDF & Tesseract OCR
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            Smart Multi-Length Summaries
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Layers className="h-3.5 w-3.5 text-indigo-500" />
            Vercel Ready
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Document Summary Assistant • Assessment Project
        </p>
      </div>
    </footer>
  );
}
