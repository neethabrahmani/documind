export type DocumentType = 'pdf' | 'image';

export type ProcessingStage = 
  | 'idle'
  | 'uploading'
  | 'uploaded'
  | 'extracting'
  | 'extracted'
  | 'summarizing'
  | 'completed'
  | 'error';

export interface UploadedDocument {
  id: string;
  file: File;
  name: string;
  size: number;
  type: DocumentType;
  mimeType: string;
  previewUrl?: string;
  uploadProgress: number;
  uploadedAt: Date;
}

export interface ExtractionResult {
  success: boolean;
  text: string;
  pageCount: number;
  wordCount: number;
  characterCount: number;
  readingTimeMinutes: number;
  ocrConfidence?: number;
  extractionMethod?: 'pdf-parser' | 'ocr';
  metadata?: {
    title?: string;
    author?: string;
    creationDate?: string;
    producer?: string;
  };
  isScanned: boolean;
  requiresOcr: boolean;
  message: string;
}

export interface ValidationError {
  type: 'FORMAT_ERROR' | 'SIZE_ERROR' | 'EMPTY_FILE';
  message: string;
}

