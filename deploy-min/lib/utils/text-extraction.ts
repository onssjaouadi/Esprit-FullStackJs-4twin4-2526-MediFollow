import Tesseract from "tesseract.js";

export interface ExtractionResult {
  success: boolean;
  text: string;
  confidence: number;
  fileName: string;
  extractedAt: string;
}

/**
 * Downloads blob from Azure URL via server endpoint and converts to base64
 * For processing with Tesseract (avoids CORS issues)
 */
export async function blobToBase64(
  blobUrl: string,
  fileName: string
): Promise<string> {
  try {
    console.log("🔵 Requesting blob data from server...");

    // Use server endpoint to get blob as base64 data URL
    const response = await fetch("/api/documents/extract-text-blob", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documentUrl: blobUrl,
        documentName: fileName,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to download blob: ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.dataUrl) {
      throw new Error("No data URL returned from server");
    }

    console.log(`✅ Received base64 data from server (${data.fileSize} bytes)`);
    return data.dataUrl;
  } catch (error) {
    console.error("❌ Error converting blob to base64:", error);

    if (error instanceof Error) {
      if (error.message.includes("Failed to fetch")) {
        throw new Error("Erreur réseau: Impossible de télécharger le document");
      }
      throw error;
    }

    throw new Error("Failed to process blob");
  }
}

/**
 * Extracts text from an image using Tesseract OCR
 * Supports: JPEG, PNG, GIF, BMP, WebP, TIFF
 */
export async function extractTextFromImage(
  imageUrl: string,
  fileName: string,
  onProgress?: (progress: number) => void
): Promise<ExtractionResult> {
  try {
    // Convert Azure blob URL to base64 via server endpoint
    let imageData = imageUrl;
    if (imageUrl.includes("blob.core.windows.net")) {
      console.log("📥 Downloading image from Azure via server endpoint...");
      imageData = await blobToBase64(imageUrl, fileName);
    }

    console.log("🎯 Starting Tesseract.js OCR extraction...");

    const result = await Tesseract.recognize(imageData, "fra+eng", {
      logger: (m) => {
        // Log progress updates (0-1)
        if (m.progress && onProgress) {
          onProgress(m.progress);
        }
        console.log(`OCR Progress: ${(m.progress * 100).toFixed(1)}%`);
      },
    });

    const extractedText = result.data.text.trim();

    if (!extractedText) {
      throw new Error("Aucun texte détecté dans l'image");
    }

    return {
      success: true,
      text: extractedText,
      confidence: result.data.confidence || 0,
      fileName,
      extractedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Text extraction error:", error);
    throw error;
  }
}

/**
 * Validates if a file type supports text extraction
 */
export function isExtractableFileType(fileName: string): boolean {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  const extractableExtensions = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "bmp",
    "webp",
    "tiff",
    "tif",
  ];
  return extractableExtensions.includes(ext);
}

/**
 * Extracts text from document URL (image or PDF-like)
 * Returns the extracted text for display
 */
export async function extractTextFromDocument(
  documentUrl: string,
  fileName: string,
  onProgress?: (progress: number) => void
): Promise<ExtractionResult> {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  // For images
  if (
    ["jpg", "jpeg", "png", "gif", "bmp", "webp", "tiff", "tif"].includes(ext)
  ) {
    return extractTextFromImage(documentUrl, fileName, onProgress);
  }

  // For other formats, throw unsupported error
  throw new Error(
    `Unsupported file format for text extraction: ${ext}. Supported formats: JPEG, PNG, GIF, BMP, WebP, TIFF`
  );
}
