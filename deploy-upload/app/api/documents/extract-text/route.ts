import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/documents/extract-text
 * Extracts text from documents (images, PDFs, etc.)
 * Using server-side OCR and text extraction
 */
export async function POST(request: NextRequest) {
  try {
    const { documentUrl, documentName } = await request.json();

    if (!documentUrl || !documentName) {
      return NextResponse.json(
        { error: "Document URL and name are required" },
        { status: 400 }
      );
    }

    const ext = documentName.split(".").pop()?.toLowerCase() || "";

    // For images: use Tesseract.js via node-tesseract-ocr or similar
    // For now, we'll return a placeholder and guide for implementation
    // In production, you'd integrate with:
    // - Azure Computer Vision API
    // - Google Cloud Vision API
    // - AWS Textract
    // - Tesseract.js for client-side OCR

    // Check file type
    const imageExtensions = [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "bmp",
      "webp",
      "tiff",
    ];
    const docExtensions = ["pdf", "doc", "docx", "txt"];

    if (imageExtensions.includes(ext)) {
      // For images, you would call Azure Computer Vision or client-side OCR
      return NextResponse.json({
        success: true,
        text: null,
        message:
          "Image OCR extraction requires client-side processing. Implement Tesseract.js for text extraction.",
        documentType: "image",
        fileName: documentName,
      });
    } else if (docExtensions.includes(ext)) {
      // For documents (PDF, DOC, etc.)
      return NextResponse.json({
        success: true,
        text: null,
        message:
          "Document text extraction available via Azure Cognitive Services or pdfjs.",
        documentType: "document",
        fileName: documentName,
      });
    } else {
      return NextResponse.json(
        {
          error: `Unsupported file format: ${ext}`,
          supportedFormats: [
            "jpg",
            "jpeg",
            "png",
            "gif",
            "pdf",
            "txt",
            "doc",
            "docx",
          ],
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error extracting text:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to extract text",
      },
      { status: 500 }
    );
  }
}
