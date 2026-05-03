"use server";

import {
  BlobServiceClient,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import { prisma } from "@/lib/prisma";
import {
  verifyDoctorAccess,
  logDataAccess,
} from "@/lib/actions/blockchain-access.actions";

/**
 * Parse Azure Storage connection string to get account name and key
 */
function parseConnectionString(connectionString: string) {
  const parts = connectionString.split(";");
  const accountName = parts
    .find((p) => p.startsWith("AccountName="))
    ?.split("=")[1];
  const accountKey = parts
    .find((p) => p.startsWith("AccountKey="))
    ?.split("=")[1];
  return { accountName, accountKey };
}

/**
 * Generate SAS URL for a blob with 1 hour expiration
 */
function generateSasUrl(
  accountName: string,
  accountKey: string,
  containerName: string,
  blobName: string
): string {
  const sharedKeyCredential = new StorageSharedKeyCredential(
    accountName,
    accountKey
  );

  const sasOptions = {
    containerName,
    blobName,
    permissions: BlobSASPermissions.parse("r"), // Read only
    startsOn: new Date(),
    expiresOn: new Date(new Date().valueOf() + 3600 * 1000), // 1 hour
  };

  const sasToken = generateBlobSASQueryParameters(
    sasOptions,
    sharedKeyCredential
  ).toString();

  return `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
}

/**
 * Upload a file to Azure Blob Storage
 */
export async function uploadToAzureStorage(
  file: File,
  patientId: string,
  category: string,
  description?: string
) {
  try {
    // Validate file
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    // Get Azure Storage configuration
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "uploads";

    if (!connectionString) {
      return {
        success: false,
        error: "Azure Storage configuration missing",
      };
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

    // Get blob URL (without SAS - will be generated on demand)
    const blobUrl = `https://${parseConnectionString(connectionString).accountName}.blob.core.windows.net/${containerName}/${blobName}`;

    // Save document metadata to database
    const document = await prisma.medicalDocument.create({
      data: {
        patientId,
        fileName: sanitizedFileName,
        originalName: file.name,
        fileType: file.type,
        fileSize: file.size,
        category: category as any,
        description: description || null,
        azureBlobUrl: blobUrl,
        azureContainerName: containerName,
        azureBlobName: blobName,
      },
    });

    return {
      success: true,
      data: {
        id: document.id,
        fileName: document.fileName,
        fileUrl: blobUrl,
        fileSize: document.fileSize,
        uploadedAt: document.uploadedAt,
      },
    };
  } catch (error) {
    console.error("Error uploading to Azure Storage:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Get all medical documents for a patient
 */
export async function getPatientDocuments(patientId: string) {
  try {
    const documents = await prisma.medicalDocument.findMany({
      where: {
        patientId,
      },
      orderBy: {
        uploadedAt: "desc",
      },
    });

    return {
      success: true,
      data: documents,
    };
  } catch (error) {
    console.error("Error fetching patient documents:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch documents",
    };
  }
}

/**
 * Get all medical documents for the current user
 */
export async function getCurrentUserDocuments(userId: string) {
  try {
    // Get patient ID from user ID
    const patient = await prisma.patient.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!patient) {
      return {
        success: false,
        error: "Patient not found",
      };
    }

    // Get documents
    const documents = await prisma.medicalDocument.findMany({
      where: {
        patientId: patient.id,
      },
      orderBy: {
        uploadedAt: "desc",
      },
    });

    return {
      success: true,
      data: documents,
      patientId: patient.id,
    };
  } catch (error) {
    console.error("Error fetching current user documents:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch documents",
    };
  }
}

/**
 * Get medical documents for a specific patient (for doctors)
 * WITH BLOCKCHAIN ACCESS CONTROL
 */
export async function getDoctorPatientDocuments(
  patientId: string,
  doctorUserId: string
) {
  try {
    // 1. Verify the doctor user exists and has DOCTOR role
    const doctorUser = await (prisma as any).user.findUnique({
      where: { id: doctorUserId },
    });

    if (!doctorUser || doctorUser.role !== "DOCTOR") {
      return {
        success: false,
        error: "You don't have permission to view patient documents",
      };
    }

    // 2. Check if blockchain verification is enabled
    const blockchainConfigured = !!(
      process.env.APTOS_PRIVATE_KEY &&
      process.env.APTOS_ACCOUNT_ADDRESS &&
      doctorUser.blockchainAddress
    );

    let blockchainVerifiedStatus:
      | "active"
      | "disabled"
      | "denied"
      | "error"
      | "db_fallback" = "disabled";

    if (blockchainConfigured) {
      // 3. Verify access on blockchain
      console.log(
        `🔐 Verifying blockchain access for doctor ${doctorUser.blockchainAddress} to patient ${patientId}`
      );

      const accessCheck = await verifyDoctorAccess(
        doctorUser.blockchainAddress,
        patientId
      );

      if (accessCheck.hasAccess) {
        console.log(
          `✅ Blockchain access verified for doctor ${doctorUser.email}`
        );
        blockchainVerifiedStatus = "active";
      } else {
        // Blockchain denied or network error — check DB AccessGrant as fallback
        console.warn(
          `⚠️  Blockchain check failed/denied: ${accessCheck.error}`
        );

        const isNetworkError =
          accessCheck.error &&
          (accessCheck.error.includes("ECONNRESET") ||
            accessCheck.error.includes("timeout") ||
            accessCheck.error.includes("ETIMEDOUT") ||
            accessCheck.error.includes("fetch") ||
            accessCheck.error.includes("network") ||
            accessCheck.error.includes("Verification failed") ||
            accessCheck.error.includes("ENOTFOUND") ||
            accessCheck.error.includes("socket") ||
            accessCheck.error.includes("stream") ||
            accessCheck.error.includes("destroyed") ||
            accessCheck.error.includes("ERR_STREAM") ||
            accessCheck.error.includes("cancel") ||
            accessCheck.error.includes("settled") ||
            accessCheck.error.includes("RequestError"));

        // Check DB AccessGrant table as fallback
        const dbGrant = await (prisma as any).accessGrant
          .findUnique({
            where: {
              patientId_doctorId: {
                patientId: doctorUser.id,
                doctorId: doctorUserId,
              },
            },
          })
          .catch(() => null);

        // Also try with patientId as User.id (patient user) mapped from Patient model
        const patientRecord = await prisma.patient
          .findUnique({
            where: { id: patientId },
            select: { userId: true },
          })
          .catch(() => null);

        const dbGrantByUser = patientRecord
          ? await (prisma as any).accessGrant
              .findUnique({
                where: {
                  patientId_doctorId: {
                    patientId: patientRecord.userId,
                    doctorId: doctorUserId,
                  },
                },
              })
              .catch(() => null)
          : null;

        const activeGrant =
          (dbGrant?.isActive &&
            (!dbGrant.expiresAt || new Date(dbGrant.expiresAt) > new Date())) ||
          (dbGrantByUser?.isActive &&
            (!dbGrantByUser.expiresAt ||
              new Date(dbGrantByUser.expiresAt) > new Date()));

        if (activeGrant) {
          console.log(`✅ DB fallback: doctor has active access grant`);
          blockchainVerifiedStatus = isNetworkError
            ? "db_fallback"
            : "db_fallback";
        } else {
          blockchainVerifiedStatus = isNetworkError ? "error" : "denied";
          return {
            success: false,
            error: isNetworkError
              ? "Le réseau blockchain est temporairement indisponible et aucun accès DB trouvé."
              : "Accès refusé — le patient n'a pas encore accordé l'accès blockchain.",
            blockchainStatus: blockchainVerifiedStatus,
          };
        }
      }
    } else {
      console.warn(
        "⚠️  Blockchain verification disabled - using database-only check"
      );
    }

    // 4. Verify the patient exists and is active
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient || !patient.isActive) {
      return {
        success: false,
        error: "Patient not found",
      };
    }

    // 5. Fetch documents for the patient
    const documents = await prisma.medicalDocument.findMany({
      where: { patientId },
      orderBy: { uploadedAt: "desc" },
    });

    // 6. Log access on blockchain (audit trail)
    if (blockchainVerifiedStatus === "active" && doctorUser.blockchainAddress) {
      try {
        await logDataAccess(doctorUser.blockchainAddress, patientId);
        console.log(`📝 Access logged on blockchain`);
      } catch (logError) {
        // Logging is non-critical - don't fail the entire operation
        console.warn(
          "⚠️  Failed to log access on blockchain (non-blocking):",
          logError instanceof Error ? logError.message : logError
        );
      }
    }

    return {
      success: true,
      data: documents,
      blockchainVerified: blockchainVerifiedStatus === "active",
      blockchainStatus: blockchainVerifiedStatus,
    };
  } catch (error) {
    console.error("Error fetching patient documents:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch documents",
    };
  }
}

/**
 * Delete a medical document
 */
export async function deleteDocument(documentId: string) {
  try {
    // Get document info
    const document = await prisma.medicalDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return { success: false, error: "Document not found" };
    }

    // Get Azure Storage configuration
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

    if (!connectionString) {
      return {
        success: false,
        error: "Azure Storage configuration missing",
      };
    }

    // Delete from Azure Storage
    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(
      document.azureContainerName
    );
    const blockBlobClient = containerClient.getBlockBlobClient(
      document.azureBlobName
    );

    await blockBlobClient.deleteIfExists();

    // Delete from database
    await prisma.medicalDocument.delete({
      where: { id: documentId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting document:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}

/**
 * Update document metadata (filename, description)
 */
export async function updateDocumentMetadata(
  documentId: string,
  updates: {
    fileName?: string;
    description?: string;
  }
) {
  try {
    // Get document info
    const document = await prisma.medicalDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return { success: false, error: "Document not found" };
    }

    // Update database record
    const updatedDocument = await prisma.medicalDocument.update({
      where: { id: documentId },
      data: {
        fileName: updates.fileName || document.fileName,
        description: updates.description,
      },
    });

    return {
      success: true,
      data: updatedDocument,
    };
  } catch (error) {
    console.error("Error updating document:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Update failed",
    };
  }
}

/**
 * Get download URL for a document with SAS token for temporary secure access
 */
export async function getDocumentDownloadUrl(documentId: string) {
  try {
    const document = await prisma.medicalDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return { success: false, error: "Document not found" };
    }

    // Get Azure Storage configuration
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

    if (!connectionString) {
      return {
        success: false,
        error: "Azure Storage configuration missing",
      };
    }

    // Parse connection string
    const { accountName, accountKey } = parseConnectionString(connectionString);

    if (!accountName || !accountKey) {
      return {
        success: false,
        error: "Invalid Azure Storage connection string",
      };
    }

    // Generate SAS URL with 1 hour expiration
    const sasUrl = generateSasUrl(
      accountName,
      accountKey,
      document.azureContainerName,
      document.azureBlobName
    );

    return {
      success: true,
      data: {
        url: sasUrl,
        fileName: document.originalName,
        expiresIn: 3600, // 1 hour in seconds
      },
    };
  } catch (error) {
    console.error("Error getting download URL:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get download URL",
    };
  }
}
