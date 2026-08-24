# DocuMind — Document Summary Assistant

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![OCR Engine](https://img.shields.io/badge/OCR-Tesseract.js-563D7C?style=flat-square)](https://tesseract.projectnaptha.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

> A modern, privacy-first web application that ingests PDF documents and scanned image files (PNG/JPG), extracts text flawlessly via server-side parsing and OCR, and generates structured executive summaries with key takeaways across customizable length targets. Works 100% offline with a built-in extractive algorithm and supports optional Google Gemini AI acceleration.

---

##  Table of Contents
1. [Approach / Technical Write-up (Under 200 Words)](#-approach--technical-write-up)
2. [Key Features](#-key-features)
3. [Architecture & Technology Stack](#-architecture--technology-stack)
4. [Document Processing Pipeline](#-document-processing-pipeline)
   - [PDF Text Extraction](#1-pdf-text-extraction)
   - [Tesseract Optical Character Recognition (OCR)](#2-tesseract-optical-character-recognition-ocr)
   - [Dual-Engine Summarization](#3-dual-engine-summarization-offline-first--optional-gemini)
5. [Summary Length Modes](#-summary-length-modes)
6. [Multi-Format Export Engine](#-multi-format-export-engine)
7. [Error Handling & Edge Cases](#-error-handling--edge-cases)
8. [Local Installation & Setup](#-local-installation--setup)
9. [Environment Variables](#-environment-variables)
10. [Deployment Guide (Vercel)](#-deployment-guide-vercel)
11. [Testing & Verification](#-testing--verification)

---

##  Approach / Technical Write-up

DocuMind is engineered as a privacy-centric, hybrid document intelligence system that converts unstructured PDFs and image scans into structured executive summaries without mandating third-party AI keys.

Our architecture implements a two-stage pipeline: ingestion and summarization. During ingestion, native digital PDFs are parsed server-side via `pdf-parse` with whitespace normalization and line reassembly, while image documents (PNG/JPG) are processed through `tesseract.js` OCR to extract text alongside recognition confidence scores.

For summarization, DocuMind uses an adaptive dual-engine design. By default, it operates completely offline using a graph-based extractive algorithm with TF-ISF term scoring, entity weighting, and Maximal Marginal Relevance (MMR) de-duplication to generate coherent, non-redundant summaries across Short (~100w), Medium (~250w), and Long (~500w) presets. When a `GEMINI_API_KEY` is provided, the system seamlessly routes requests to Google Gemini Flash for generative abstractive synthesis.

Client-side utilities enable multi-format reporting, exporting structured digests directly to Clipboard, TXT, Markdown, and styled PDF reports via `jspdf`. Built on Next.js 14 App Router and Tailwind CSS, the application delivers resilient error handling, responsive mobile usability, and zero-configuration serverless deployment.

---

##  Key Features

-  **Universal Document Ingestion**: Seamless drag-and-drop zone and native file picker supporting `.pdf`, `.png`, `.jpg`, `.jpeg`, and `.webp`.
-  **Zero-Dependency Offline Operation**: Runs completely out of the box with zero external API key requirements using local extractive NLP.
-  **Optional Gemini AI Flash**: Optional environment variable integration (`GEMINI_API_KEY`) for hybrid generative AI abstractive summaries.
-  **Server-Side Tesseract OCR**: Converts scanned documents, receipts, and invoice images into readable text with real-time recognition confidence scoring.
-  **Target Length Control**:
  - **Short Preset** (~50–100 words): High-level executive brief.
  - **Medium Preset** (~150–250 words): Balanced conceptual breakdown with core metrics.
  - **Long Preset** (~400–600 words): In-depth comprehensive analysis capturing all thematic sections.
-  **Automated Key Takeaways**: Extracts 3–5 distinct, non-overlapping bullet points highlighting core definitions, figures, and conclusions.
-  **Multi-Format Export Suite**:
  - **Copy to Clipboard** with animated visual feedback.
  - **Download Plain Text (`.txt`)** structured report.
  - **Download Markdown (`.md`)** with GitHub tables and blockquotes.
  - **Download Formatted PDF (`.pdf`)** with brand banners, metadata badges, and callout cards.
-  **Fully Responsive UI**: Mobile-first layout crafted with Tailwind CSS and Lucide icons.

---

##  Architecture & Technology Stack

```
DocuMind Technical Architecture
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer (Next.js 14)              │
│   • DocumentDropzone (Validation & Drag-and-Drop)           │
│   • ExtractedTextPanel (Stats, Live Editing & Inspection)   │
│   • SummaryResultPanel (Narrative, Key Points & Exports)    │
│   • Export Suite (Clipboard, TXT, Markdown, jsPDF)          │
└──────────────────────────────┬──────────────────────────────┘
                               │ Multipart / JSON API
┌──────────────────────────────▼──────────────────────────────┐
│                    Server-Side API Routes                   │
│   • /api/extract   -> PDF Parser & Tesseract OCR Workers    │
│   • /api/summarize -> Dual-Engine Summarization Router      │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│  Extractive Offline Engine   │ │   Optional Gemini Flash AI   │
│  • Sentence Tokenizer        │ │  • process.env.GEMINI_API_KEY |
│  • TF-ISF Salience Scoring   │ │   • Abstractive Synthesis    │
│  • MMR De-Duplication        │ │   • JSON Structured Output   │
└──────────────────────────────┘ └──────────────────────────────┘
```

| Layer | Technologies & Dependencies | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router), React 18, TypeScript | Full-stack serverless rendering and API routes |
| **Styling** | Tailwind CSS, Lucide React, clsx, tailwind-merge | Modern, responsive design system |
| **PDF Extraction** | `pdf-parse`, `pdfjs-dist` | Server-side text parsing with paragraph preservation |
| **OCR Engine** | `tesseract.js` (v7) | Optical character recognition for scanned images |
| **PDF Export** | `jspdf` | Client-side multi-page PDF generation |
| **Optional AI** | `@google/generative-ai` / REST API | Optional LLM abstractive summarization |

---

##  Document Processing Pipeline

### 1. PDF Text Extraction
- Server-side parsing in [`lib/extractors/pdf-extractor.ts`](lib/extractors/pdf-extractor.ts) converts binary PDF streams into normalized strings.
- Strips document header/footer artifacts, joins wrapped line breaks, and computes metadata: page count, word count, character count, and estimated reading time.

### 2. Tesseract Optical Character Recognition (OCR)
- Image recognition in [`lib/extractors/ocr-extractor.ts`](lib/extractors/ocr-extractor.ts) analyzes PNG/JPG/JPEG/WEBP documents server-side.
- Computes mean word confidence percentage (`ocrConfidence`) and formats clean multi-line text for downstream summarization.

### 3. Dual-Engine Summarization (Offline-First + Optional Gemini)
- **Extractive Engine** ([`lib/summarizers/extractive-summarizer.ts`](lib/summarizers/extractive-summarizer.ts)):
  - **Tokenization & Stop Words**: Filters common linguistic stopwords while preserving technical entities, financial figures, and percentages.
  - **TF-ISF Term Scoring**: Evaluates term frequencies across sentence boundaries normalized by length.
  - **Maximal Marginal Relevance (MMR)**: Penalizes candidate sentences with $>0.55$ token similarity to prevent near-duplicate sentences.
  - **Opening Phrase Diversity**: Limits repetitive sentence prefixes, ensuring diverse thematic coverage.
- **Gemini AI Summarizer** ([`lib/summarizers/gemini-summarizer.ts`](lib/summarizers/gemini-summarizer.ts)):
  - If `process.env.GEMINI_API_KEY` is present, queries Gemini 1.5 Flash for abstractive synthesis.
  - Automatically falls back to the extractive summarizer if the key is missing or quota limits are encountered.

---

##  Summary Length Modes

| Preset | Target Word Count | Typical Compression | Description |
| :--- | :--- | :--- | :--- |
| **Short** | **50 – 100 words** | 80% – 95% | Core executive briefing covering main concept and primary conclusion. |
| **Medium** | **150 – 250 words** | 50% – 75% | Structured multi-paragraph digest with definitions, key operations, and metrics. |
| **Long** | **400 – 600 words** | 20% – 50% | Comprehensive analysis capturing all thematic sections across large documents. |

---

##  Multi-Format Export Engine

Exports include document title, preset mode, word counts, executive narrative, and numbered key points:
- **Copy to Clipboard**: Formatted ASCII report copied directly to system clipboard.
- **Download TXT (`.txt`)**: UTF-8 plain text file.
- **Download Markdown (`.md`)**: GitHub Flavored Markdown with metadata tables and blockquotes.
- **Download PDF (`.pdf`)**: Vector-styled PDF rendered via `jspdf` with brand banners, metadata cards, and callout containers.

---

##  Error Handling & Edge Cases

| Edge Case | Handling Mechanism | User Feedback |
| :--- | :--- | :--- |
| **File > 10MB** | Client & server validation against `MAX_FILE_SIZE_BYTES` | Toast alert: *"`filename` exceeds 10MB limit."* |
| **Unsupported Type** | MIME & extension filter (`.pdf`, `.png`, `.jpg`, `.jpeg`, `.webp`) | Error badge: *"Unsupported file format."* |
| **Empty File (0B)** | Zero-byte buffer check | Rejection alert: *"File is empty (0 bytes)."* |
| **Low-Text Image** | OCR confidence and word count threshold (< 3 words) | Helpful guidance: *"No readable text detected. Please upload a clearer scan."* |
| **Missing API Key** | Auto-fallback router in `lib/summarizers/index.ts` | Silently switches to Extractive Offline Engine with green badge. |

---

##  Local Installation & Setup

### Prerequisites
- **Node.js**: v18.17.0 or higher
- **npm** or **yarn** / **pnpm**

### Step-by-Step Installation

```bash
# 1. Clone the repository
git clone https://github.com/neethabrahmani/documind.git

# 2. Navigate to project root
cd documind

# 3. Install dependencies
npm install

# 4. (Optional) Configure environment variables
cp .env.example .env.local

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

##  Environment Variables

Create `.env.local` in the project root:

```env
# Optional: Google Gemini API Key
# If omitted or left empty, DocuMind uses the offline Extractive engine automatically.
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Security Note**: Never prefix `GEMINI_API_KEY` with `NEXT_PUBLIC_`. All AI calls execute server-side in App Router API handlers.

---

##  Deployment Guide (Vercel)

DocuMind is optimized for 1-click deployment to **Vercel**:

1. Push your repository to GitHub.
2. Import the project into [Vercel Dashboard](https://vercel.com/new).
3. **Framework Preset**: `Next.js`
4. **Build Command**: `npm run build`
5. **Output Directory**: `.next`
6. *(Optional)* Add Environment Variable: `GEMINI_API_KEY` in Project Settings $\rightarrow$ Environment Variables.
7. Click **Deploy**.

---

##  Testing & Verification

Run automated test suites and production build:

```bash
# Run production build and type checks
npm run build

# Start production server locally
npm start
```

### Pre-loaded Test Documents
DocuMind includes sample documents in `public/samples/` for 1-click testing:
- **Arrays (PDF)** (`Arrays-Questions.pdf`): 2,510-word technical curriculum.
- **Java (PDF)** (`Java-Grooming.pdf`): 460-word interview questions.
- **Report (PDF)** (`sample-report.pdf`): Corporate quarterly report.
- **Invoice (PNG)** (`sample-invoice.png`): High-resolution commercial scan.

---

##  License
MIT License. Created for the Technical Assessment Project.
