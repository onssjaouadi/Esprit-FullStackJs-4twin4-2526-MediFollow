import { NextRequest, NextResponse } from "next/server";
import { BlobServiceClient } from "@azure/storage-blob";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/actions/auth.actions";

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get patient ID
    let patientId: string;
    if (user.role === "PATIENT") {
      const patient = await prisma.patient.findUnique({
        where: { userId: user.id },
      });
      if (!patient) {
        return NextResponse.json(
          { error: "Patient not found" },
          { status: 404 }
        );
      }
      patientId = patient.id;
    } else {
      return NextResponse.json(
        { error: "Only patients can upload documents" },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Get Azure Storage configuration
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "uploads";

    if (!connectionString) {
      return NextResponse.json(
        { error: "Azure Storage configuration missing" },
        { status: 500 }
      );
    }

    // Create unique blob name
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const blobName = `medical-documents/${patientId}/${timestamp}-${sanitizedFileName}`;

    // Create BlobServiceClient
    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Ensure container exists (private by default)
    await containerClient.createIfNotExists();

    // Get blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload file
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: file.type,
      },
    });

    // Parse connection string to get account name
    const accountName = connectionString
      .split(";")
      .find((p) => p.startsWith("AccountName="))
      ?.split("=")[1];

    // Get blob URL (without SAS - will be generated on demand)
    const blobUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`;

    // Save document metadata to database
    const document = await prisma.medicalDocument.create({
      data: {
        patientId,
        fileName: sanitizedFileName,
        originalName: file.name,
        fileType: file.type,
        fileSize: file.size,
        category: category || "OTHER",
        description: description || null,
        azureBlobUrl: blobUrl,
        azureContainerName: containerName,
        azureBlobName: blobName,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: document.id,
        fileName: document.fileName,
        fileUrl: blobUrl,
        fileSize: document.fileSize,
        uploadedAt: document.uploadedAt,
      },
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}
