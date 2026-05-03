import { NextRequest, NextResponse } from "next/server";
import { BlobServiceClient } from "@azure/storage-blob";

/**
 * POST /api/documents/extract-text-blob
 * Returns blob as base64 data URL for client-side OCR processing
 * Avoids CORS issues by proxying the blob download through server
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

    // Check if file type is supported for OCR
    const imageExtensions = [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "bmp",
      "webp",
      "tiff",
      "tif",
    ];

    if (!imageExtensions.includes(ext)) {
      return NextResponse.json(
        {
          error: `Unsupported file format: ${ext}. Supported: JPEG, PNG, GIF, BMP, WebP, TIFF`,
        },
        { status: 400 }
      );
    }

    console.log("🔵 [Extract Text Blob] Processing:", { documentName, ext });

    // Extract blob path from Azure URL
    // URL format: https://container.blob.core.windows.net/uploads/path/to/file
    let blobPath: string;

    try {
      const url = new URL(documentUrl);
      const pathname = url.pathname;
      // Remove leading '/', then extract path after container name
      const pathParts = pathname.substring(1).split("/");
      if (pathParts.length < 2) {
        throw new Error("Invalid URL format");
      }
      blobPath = pathParts.slice(1).join("/");
      console.log("📍 Blob path extracted:", blobPath);
    } catch (error) {
      console.error("❌ Invalid document URL:", error);
      return NextResponse.json(
        { error: "Invalid document URL format" },
        { status: 400 }
      );
    }

    // Get Azure Storage connection string
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "uploads";

    if (!connectionString) {
      console.error(
        "❌ [Extract Text] Missing AZURE_STORAGE_CONNECTION_STRING"
      );
      return NextResponse.json(
        { error: "Server configuration error: Missing Azure connection" },
        { status: 500 }
      );
    }

    console.log("🔵 [Extract Text] Downloading blob from Azure Storage...");

    // Download blob from Azure
    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobPath);

    const downloadResponse = await blobClient.download();

    if (
      !downloadResponse.contentLength ||
      downloadResponse.contentLength === 0
    ) {
      console.error("❌ [Extract Text] Empty blob:", blobPath);
      return NextResponse.json(
        { error: "File is empty or not found" },
        { status: 404 }
      );
    }

    // Read the stream into buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of downloadResponse.readableStreamBody!) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    console.log(
      `✅ [Extract Text] Downloaded ${buffer.length} bytes from Azure`
    );

    // Convert buffer to base64
    const base64Data = buffer.toString("base64");

    // Determine MIME type
    let mimeType = "image/jpeg";
    if (ext === "png") mimeType = "image/png";
    else if (ext === "gif") mimeType = "image/gif";
    else if (ext === "bmp") mimeType = "image/bmp";
    else if (ext === "webp") mimeType = "image/webp";
    else if (ext === "tiff" || ext === "tif") mimeType = "image/tiff";

    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    console.log(
      `✅ [Extract Text] Converted to data URL (${dataUrl.length} chars, ~${(dataUrl.length / 1024 / 1024).toFixed(2)}MB)`
    );

    return NextResponse.json({
      success: true,
      dataUrl,
      fileName: documentName,
      fileSize: buffer.length,
      mimeType,
    });
  } catch (error) {
    console.error("❌ [Extract Text Blob] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process document",
      },
      { status: 500 }
    );
  }
}
