import React from "react";
import { FileText, Sparkles, ShieldCheck } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-md shadow-indigo-200">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                DocuMind
              </span>
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Document Summary Assistant • PDF & OCR Intelligence
            </p>
          </div>
        </div>

        {/* Status / Feature Badges */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Zero-Config Fallback Enabled</span>
          </div>
          
          <div className="flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Engine:</span>
            <span className="font-semibold text-slate-900">Dual AI + Extractive</span>
          </div>
        </div>
      </div>
    </header>
  );
}
