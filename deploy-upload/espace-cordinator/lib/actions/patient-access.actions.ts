"use server";

import prisma from "@/lib/prisma";
import {
  grantDoctorAccess,
  revokeDoctorAccess,
} from "@/lib/actions/blockchain-access.actions";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DoctorWithAccess {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  blockchainAddress: string | null;
  specialty: string | null;
  profileImage: string | null;
  hasWallet: boolean;
  accessGrant: {
    isActive: boolean;
    grantedAt: Date;
    expiresAt: Date | null;
    txHashGrant: string | null;
  } | null;
}

// ─── Get all doctors with access status for a patient ───────────────────────

export async function getDoctorsWithAccessStatus(
  patientUserId: string
): Promise<{ success: boolean; doctors?: DoctorWithAccess[]; error?: string }> {
  try {
    const [doctors, grants] = await Promise.all([
      prisma.user.findMany({
        where: { role: "DOCTOR", isActive: true },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          doctorProfile: { select: { specialty: true, profileImage: true } },
        },
      }),
      (prisma as any).accessGrant.findMany({
        where: { patientId: patientUserId },
      }),
    ]);

    // Get blockchain addresses for doctors
    const doctorIds = doctors.map((d: any) => d.id);
    const usersWithWallets = await (prisma as any).user.findMany({
      where: { id: { in: doctorIds } },
      select: { id: true, blockchainAddress: true },
    });
    const walletMap: Record<string, string | null> = {};
    for (const u of usersWithWallets) {
      walletMap[u.id] = u.blockchainAddress ?? null;
    }

    const grantMap: Record<string, any> = {};
    for (const g of grants) {
      grantMap[g.doctorId] = g;
    }

    const result: DoctorWithAccess[] = doctors.map((d: any) => ({
      id: d.id,
      firstName: d.firstName,
      lastName: d.lastName,
      email: d.email,
      blockchainAddress: walletMap[d.id] ?? null,
      specialty: d.doctorProfile?.specialty ?? null,
      profileImage: d.doctorProfile?.profileImage ?? null,
      hasWallet: !!walletMap[d.id],
      accessGrant: grantMap[d.id]
        ? {
            isActive: grantMap[d.id].isActive,
            grantedAt: grantMap[d.id].grantedAt,
            expiresAt: grantMap[d.id].expiresAt ?? null,
            txHashGrant: grantMap[d.id].txHashGrant ?? null,
          }
        : null,
    }));

    return { success: true, doctors: result };
  } catch (error) {
    console.error("getDoctorsWithAccessStatus error:", error);
    return { success: false, error: "Impossible de charger les médecins" };
  }
}

// ─── Grant access to a doctor ────────────────────────────────────────────────

export async function grantAccessToDoctor(
  patientUserId: string,
  patientId: string, // Patient model id (for blockchain)
  doctorId: string,
  durationDays: number = 365
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const doctor = await (prisma as any).user.findUnique({
      where: { id: doctorId },
      select: { blockchainAddress: true, firstName: true, lastName: true },
    });

    if (!doctor?.blockchainAddress) {
      return {
        success: false,
        error: "Ce médecin n'a pas encore de wallet blockchain",
      };
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    // Call blockchain
    const blockchainResult = await grantDoctorAccess(
      doctor.blockchainAddress,
      patientId,
      durationDays
    );

    // Save/update DB record
    await (prisma as any).accessGrant.upsert({
      where: { patientId_doctorId: { patientId: patientUserId, doctorId } },
      create: {
        patientId: patientUserId,
        doctorId,
        durationDays,
        expiresAt,
        isActive: true,
        txHashGrant: blockchainResult.transactionHash ?? null,
      },
      update: {
        isActive: true,
        durationDays,
        grantedAt: new Date(),
        expiresAt,
        revokedAt: null,
        txHashGrant: blockchainResult.transactionHash ?? null,
      },
    });

    return {
      success: true,
      txHash: blockchainResult.transactionHash,
    };
  } catch (error) {
    console.error("grantAccessToDoctor error:", error);
    return { success: false, error: "Erreur lors de l'attribution d'accès" };
  }
}

// ─── Revoke access from a doctor ─────────────────────────────────────────────

export async function revokeAccessFromDoctor(
  patientUserId: string,
  patientId: string,
  doctorId: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const doctor = await (prisma as any).user.findUnique({
      where: { id: doctorId },
      select: { blockchainAddress: true },
    });

    if (!doctor?.blockchainAddress) {
      return { success: false, error: "Médecin sans wallet blockchain" };
    }

    const blockchainResult = await revokeDoctorAccess(
      doctor.blockchainAddress,
      patientId
    );

    await (prisma as any).accessGrant.update({
      where: { patientId_doctorId: { patientId: patientUserId, doctorId } },
      data: {
        isActive: false,
        revokedAt: new Date(),
        txHashRevoke: blockchainResult.transactionHash ?? null,
      },
    });

    return {
      success: true,
      txHash: blockchainResult.transactionHash,
    };
  } catch (error) {
    console.error("revokeAccessFromDoctor error:", error);
    return { success: false, error: "Erreur lors de la révocation d'accès" };
  }
}
