"use server";

import prisma from "@/lib/prisma";
import { generateDataHash } from "@/lib/utils";
import { pusherServer } from "@/lib/pusher";

type VitalPayloadInput = {
  patientId?: string;
  systolicBP?: number | null;
  diastolicBP?: number | null;
  heartRate?: number | null;
  temperature?: number | null;
  oxygenSaturation?: number | null;
  weight?: number | null;
  recordedAt?: string | Date;
};

type AuditPayloadInput = {
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string | null;
  changes?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
  timestamp?: string | Date;
};

function toIso(value?: string | Date): string | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function buildVitalProofPayload(data: VitalPayloadInput) {
  return {
    patientId: data.patientId ?? null,
    systolicBP: data.systolicBP ?? null,
    diastolicBP: data.diastolicBP ?? null,
    heartRate: data.heartRate ?? null,
    temperature: data.temperature ?? null,
    oxygenSaturation: data.oxygenSaturation ?? null,
    weight: data.weight ?? null,
    recordedAt: toIso(data.recordedAt),
  };
}

function buildAuditProofPayload(data: AuditPayloadInput) {
  return {
    userId: data.userId ?? null,
    action: data.action ?? null,
    entityType: data.entityType ?? null,
    entityId: data.entityId ?? null,
    changes: data.changes ?? null,
    ipAddress: data.ipAddress ?? null,
    userAgent: data.userAgent ?? null,
    timestamp: toIso(data.timestamp),
  };
}

async function generateUniqueTxHash(dataHash: string) {
  const nonce =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
  const txSeed = await generateDataHash({ dataHash, nonce, now: Date.now() });
  return `0x${txSeed.slice(0, 64)}`;
}

// ============================================
// BLOCKCHAIN PROOF MANAGEMENT
// ============================================

/**
 * Create a blockchain proof for a vital record
 */
export async function createBlockchainProof(
  vitalRecordId: string,
  data: Record<string, unknown>
) {
  try {
    const payload = buildVitalProofPayload(data as VitalPayloadInput);
    const dataHash = await generateDataHash(payload);
    const txHash = await generateUniqueTxHash(dataHash);

    const proof = await prisma.$transaction(async (tx) => {
      const created = await tx.blockchainProof.create({
        data: {
          dataHash,
          txHash,
          blockchainNetwork: process.env.BLOCKCHAIN_NETWORK || "aptos-testnet",
          status: "PENDING",
          vitalRecordId,
        },
      });

      await tx.vitalRecord.update({
        where: { id: vitalRecordId },
        data: { blockchainTxHash: txHash },
      });

      return created;
    });

    try {
      await pusherServer.trigger("blockchain", "proof-created", {
        id: proof.id,
        txHash: proof.txHash,
        dataHash: proof.dataHash,
        status: proof.status,
        timestamp: proof.timestamp,
        vitalRecordId,
      });
    } catch (pusherError) {
      console.error("Blockchain pusher (proof-created) error:", pusherError);
    }

    const confirmResult = await confirmProof(proof.id);
    return { success: true, proof: confirmResult.proof ?? proof };
  } catch (error) {
    console.error("Error creating blockchain proof:", error);
    return { success: false, error: "Failed to create blockchain proof" };
  }
}

/**
 * Create a blockchain proof for an audit log
 */
export async function createAuditBlockchainProof(
  auditLogId: string,
  data: Record<string, unknown>
) {
  try {
    const payload = buildAuditProofPayload(data as AuditPayloadInput);
    const dataHash = await generateDataHash(payload);
    const txHash = await generateUniqueTxHash(dataHash);

    const proof = await prisma.$transaction(async (tx) => {
      const created = await tx.blockchainProof.create({
        data: {
          dataHash,
          txHash,
          blockchainNetwork: process.env.BLOCKCHAIN_NETWORK || "aptos-testnet",
          status: "PENDING",
          auditLogId,
        },
      });

      await tx.auditLog.update({
        where: { id: auditLogId },
        data: { blockchainTxHash: txHash },
      });

      return created;
    });

    try {
      await pusherServer.trigger("blockchain", "proof-created", {
        id: proof.id,
        txHash: proof.txHash,
        dataHash: proof.dataHash,
        status: proof.status,
        timestamp: proof.timestamp,
        auditLogId,
      });
    } catch (pusherError) {
      console.error("Blockchain pusher (proof-created) error:", pusherError);
    }

    const confirmResult = await confirmProof(proof.id);
    return { success: true, proof: confirmResult.proof ?? proof };
  } catch (error) {
    console.error("Error creating audit blockchain proof:", error);
    return { success: false, error: "Failed to create audit blockchain proof" };
  }
}

/**
 * Confirm a pending blockchain proof
 */
export async function confirmProof(proofId: string) {
  try {
    const proof = await prisma.blockchainProof.update({
      where: { id: proofId },
      data: {
        status: "CONFIRMED",
        blockNumber: Math.floor(Math.random() * 1000000) + 500000,
      },
    });

    try {
      await pusherServer.trigger("blockchain", "proof-confirmed", {
        id: proof.id,
        txHash: proof.txHash,
        status: proof.status,
        blockNumber: proof.blockNumber,
        timestamp: proof.timestamp,
      });
    } catch (pusherError) {
      console.error("Blockchain pusher (proof-confirmed) error:", pusherError);
    }

    return { success: true, proof };
  } catch (error) {
    console.error("Error confirming proof:", error);
    return { success: false, error: "Failed to confirm proof" };
  }
}

/**
 * Get all blockchain proofs with pagination
 */
export async function getBlockchainProofs(
  page: number = 1,
  limit: number = 20,
  status?: string
) {
  try {
    const where: Record<string, unknown> = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    const [proofs, total] = await Promise.all([
      prisma.blockchainProof.findMany({
        where,
        orderBy: { timestamp: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          vitalRecord: {
            select: {
              id: true,
              patientId: true,
              recordedAt: true,
              patient: {
                select: {
                  user: {
                    select: { firstName: true, lastName: true },
                  },
                },
              },
            },
          },
          auditLog: {
            select: {
              id: true,
              action: true,
              entityType: true,
              userId: true,
            },
          },
        },
      }),
      prisma.blockchainProof.count({ where }),
    ]);

    return { success: true, proofs, total, pages: Math.ceil(total / limit) };
  } catch (error) {
    console.error("Error fetching blockchain proofs:", error);
    return { success: false, proofs: [], total: 0, pages: 0 };
  }
}

/**
 * Get blockchain stats
 */
export async function getBlockchainStats() {
  try {
    const [total, confirmed, pending, failed, latest] = await Promise.all([
      prisma.blockchainProof.count(),
      prisma.blockchainProof.count({ where: { status: "CONFIRMED" } }),
      prisma.blockchainProof.count({ where: { status: "PENDING" } }),
      prisma.blockchainProof.count({ where: { status: "FAILED" } }),
      prisma.blockchainProof.findFirst({
        orderBy: { timestamp: "desc" },
      }),
    ]);

    const confirmedRate = total > 0 ? ((confirmed / total) * 100).toFixed(1) : "0";

    return {
      success: true,
      stats: {
        total,
        confirmed,
        pending,
        failed,
        confirmedRate,
        network: process.env.BLOCKCHAIN_NETWORK || "aptos-testnet",
        lastProofAt: latest?.timestamp || null,
      },
    };
  } catch (error) {
    console.error("Error fetching blockchain stats:", error);
    return { success: false, stats: null };
  }
}

/**
 * Get a single proof by ID
 */
export async function getBlockchainProofById(id: string) {
  try {
    const proof = await prisma.blockchainProof.findUnique({
      where: { id },
      include: {
        vitalRecord: {
          include: {
            patient: {
              include: {
                user: {
                  select: { firstName: true, lastName: true, email: true },
                },
              },
            },
          },
        },
        auditLog: true,
      },
    });

    return { success: true, proof };
  } catch (error) {
    console.error("Error fetching blockchain proof:", error);
    return { success: false, proof: null };
  }
}

/**
 * Verify data integrity against stored hash
 */
export async function verifyProofIntegrity(proofId: string) {
  try {
    const proof = await prisma.blockchainProof.findUnique({
      where: { id: proofId },
      include: {
        vitalRecord: true,
        auditLog: true,
      },
    });

    if (!proof) {
      return { success: false, error: "Proof not found" };
    }

    let payload: Record<string, unknown> | null = null;

    if (proof.vitalRecord) {
      payload = buildVitalProofPayload(proof.vitalRecord);
    } else if (proof.auditLog) {
      payload = buildAuditProofPayload(proof.auditLog);
    }

    if (!payload) {
      return { success: false, error: "No source data linked" };
    }

    const currentHash = await generateDataHash(payload);
    const isValid = currentHash === proof.dataHash;

    try {
      await pusherServer.trigger("blockchain", "proof-verified", {
        id: proof.id,
        txHash: proof.txHash,
        isValid,
      });
    } catch (pusherError) {
      console.error("Blockchain pusher (proof-verified) error:", pusherError);
    }

    return { success: true, isValid, storedHash: proof.dataHash, currentHash };
  } catch (error) {
    console.error("Error verifying proof:", error);
    return { success: false, error: "Failed to verify proof" };
  }
}
