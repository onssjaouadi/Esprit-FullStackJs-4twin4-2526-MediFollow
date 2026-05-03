"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "./auth.actions";

/**
 * Register Enzo200 device via Santé Connect
 * Called after successful Santé Connect authentication
 */
export async function registerSanteConnectDevice(
  deviceId: string,
  accessToken: string,
  metadata?: Record<string, any>
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "PATIENT") {
      return {
        success: false,
        error: "Non autorisé",
      };
    }

    // Find patient
    const patient = await prisma.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) {
      return {
        success: false,
        error: "Patient non trouvé",
      };
    }

    // Register device
    const device = await prisma.wearableDevice.create({
      data: {
        patientId: patient.id,
        deviceType: "ENZO_200",
        deviceId,
        authToken: accessToken,
        isActive: true,
        lastSyncedAt: new Date(),
        metadata: {
          source: "SANTE_CONNECT",
          ...metadata,
        } as any,
      },
    });

    return {
      success: true,
      data: device,
      message: "Enzo200 enregistrée avec succès via Santé Connect",
    };
  } catch (error) {
    console.error("Error registering Santé Connect device:", error);
    return {
      success: false,
      error: "Erreur lors de l'enregistrement du dispositif",
    };
  }
}

/**
 * Get Enzo200 devices registered via Santé Connect
 */
export async function getSanteConnectDevices() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "PATIENT") {
      return {
        success: false,
        error: "Non autorisé",
      };
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) {
      return {
        success: false,
        error: "Patient non trouvé",
      };
    }

    const devices = await prisma.wearableDevice.findMany({
      where: {
        patientId: patient.id,
        deviceType: "ENZO_200",
        isActive: true,
      },
      select: {
        id: true,
        deviceId: true,
        deviceType: true,
        lastSyncedAt: true,
        createdAt: true,
        metadata: true,
      },
    });

    return {
      success: true,
      data: devices,
    };
  } catch (error) {
    console.error("Error fetching Santé Connect devices:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des dispositifs",
    };
  }
}

/**
 * Disconnect Enzo200 device
 */
export async function disconnectSanteConnectDevice(deviceId: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "PATIENT") {
      return {
        success: false,
        error: "Non autorisé",
      };
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) {
      return {
        success: false,
        error: "Patient non trouvé",
      };
    }

    // Verify device belongs to patient
    const device = await prisma.wearableDevice.findFirst({
      where: {
        id: deviceId,
        patientId: patient.id,
      },
    });

    if (!device) {
      return {
        success: false,
        error: "Dispositif non trouvé",
      };
    }

    // Deactivate device
    await prisma.wearableDevice.update({
      where: { id: deviceId },
      data: { isActive: false },
    });

    return {
      success: true,
      message: "Dispositif déconnecté avec succès",
    };
  } catch (error) {
    console.error("Error disconnecting device:", error);
    return {
      success: false,
      error: "Erreur lors de la déconnexion",
    };
  }
}
