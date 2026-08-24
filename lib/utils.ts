import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { DocumentType, ValidationError } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const ACCEPTED_MIME_TYPES: Record<string, DocumentType> = {
  "application/pdf": "pdf",
  "image/png": "image",
  "image/jpeg": "image",
  "image/jpg": "image",
};

export const ACCEPTED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg"];

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function validateFile(file: File): { valid: boolean; error?: ValidationError; docType?: DocumentType } {
  // Check empty file
  if (file.size === 0) {
    return {
      valid: false,
      error: {
        type: "EMPTY_FILE",
        message: `"${file.name}" is empty (0 bytes). Please upload a valid document.`,
      },
    };
  }

  // Check file size (10MB limit)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: {
        type: "SIZE_ERROR",
        message: `"${file.name}" (${formatFileSize(file.size)}) exceeds the maximum allowed size of 10 MB.`,
      },
    };
  }

  // Check MIME type or filename extension fallback
  const mimeType = file.type.toLowerCase();
  const lowerName = file.name.toLowerCase();

  let docType: DocumentType | undefined = ACCEPTED_MIME_TYPES[mimeType];

  if (!docType) {
    if (lowerName.endsWith(".pdf")) {
      docType = "pdf";
    } else if (
      lowerName.endsWith(".png") ||
      lowerName.endsWith(".jpg") ||
      lowerName.endsWith(".jpeg")
    ) {
      docType = "image";
    }
  }

  if (!docType) {
    return {
      valid: false,
      error: {
        type: "FORMAT_ERROR",
        message: `Unsupported file type "${file.name}". Please upload a PDF or an image file (PNG, JPG, JPEG).`,
      },
    };
  }

  return { valid: true, docType };
}
