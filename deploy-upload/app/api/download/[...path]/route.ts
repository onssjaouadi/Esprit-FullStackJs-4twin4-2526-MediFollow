import { NextRequest, NextResponse } from "next/server";
import { BlobServiceClient } from "@azure/storage-blob";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("fileName") || "download";

    // Extract the blob path from the URL
    // URL format: /api/download/uploads/medical-documents/...
    const pathname = new URL(request.url).pathname;
    const blobPath = pathname.replace("/api/download/", "");

    console.log("🔵 [Download API] Request:", { pathname, blobPath, fileName });

    if (!blobPath) {
      console.error("❌ [Download API] Missing blob path");
      return NextResponse.json({ error: "Missing blob path" }, { status: 400 });
    }

    // Get Azure Storage connection string
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "uploads";

    console.log("🔵 [Download API] Azure config:", {
      connectionString: connectionString ? "***" : "NOT SET",
      containerName,
    });

    if (!connectionString) {
      console.error(
        "❌ [Download API] Missing AZURE_STORAGE_CONNECTION_STRING"
      );
      return NextResponse.json(
        { error: "Server configuration error: Missing Azure connection" },
        { status: 500 }
      );
    }

    // Use Azure SDK to download
    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobPath);

    console.log("🔵 [Download API] Downloading blob:", blobPath);

    // Download the blob
    const downloadBlockBlobResponse = await blobClient.download();

    if (
      !downloadBlockBlobResponse.contentLength ||
      downloadBlockBlobResponse.contentLength === 0
    ) {
      console.error("❌ [Download API] Empty blob:", blobPath);
      return NextResponse.json(
        { error: "File is empty or not found" },
        { status: 404 }
      );
    }

    // Read the stream
    const chunks: Uint8Array[] = [];
    for await (const chunk of downloadBlockBlobResponse.readableStreamBody!) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    console.log(`✅ [Download API] Downloaded ${buffer.length} bytes`);

    // Determine content type based on file extension
    let contentType = "application/octet-stream";
    if (fileName.endsWith(".pdf")) contentType = "application/pdf";
    else if (fileName.endsWith(".png")) contentType = "image/png";
    else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg"))
      contentType = "image/jpeg";
    else if (fileName.endsWith(".doc")) contentType = "application/msword";
    else if (fileName.endsWith(".docx"))
      contentType =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    // Return the file as a download
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("❌ [Download API] Error:", error);

    if (error instanceof Error) {
      if (error.message.includes("NotFound") || error.message.includes("404")) {
        return NextResponse.json(
          { error: "File not found in storage" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        error: `Failed to download file: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}
