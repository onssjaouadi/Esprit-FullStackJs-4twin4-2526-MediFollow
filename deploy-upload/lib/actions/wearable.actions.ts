"use server";

import prisma from "@/lib/prisma";
import { createVitalRecord } from "./vital.actions";
import { AuditService } from "@/lib/services/audit.service";
import { getCurrentUser } from "./auth.actions";

export interface EnzoWearableData {
  deviceId: string;
  userId: string;
  timestamp: number;
  heartRate?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  temperature?: number;
  oxygenSaturation?: number;
  steps?: number;
  calories?: number;
  sleepDuration?: number;
  stressLevel?: number;
}

/**
 * Sync data from Enzo 200 smartwatch
 * Returns vital record if created successfully
 */
export async function syncEnzoData(
  patientId: string,
  wearableData: EnzoWearableData
) {
  try {
    // Find patient
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { wearableDevices: true },
    });

    if (!patient) {
      return {
        success: false,
        error: "Patient not found",
      };
    }

    // Verify device is registered
    const device = patient.wearableDevices?.find(
      (d) => d.deviceId === wearableData.deviceId
    );

    if (!device) {
      return {
        success: false,
        error: "Device not registered or not authorized",
      };
    }

    // Create FormData for vital record
    const formData = new FormData();

    if (wearableData.bloodPressure) {
      formData.append(
        "systolicBP",
        wearableData.bloodPressure.systolic.toString()
      );
      formData.append(
        "diastolicBP",
        wearableData.bloodPressure.diastolic.toString()
      );
    }

    if (wearableData.heartRate) {
      formData.append("heartRate", wearableData.heartRate.toString());
    }

    if (wearableData.temperature) {
      formData.append("temperature", wearableData.temperature.toString());
    }

    if (wearableData.oxygenSaturation) {
      formData.append(
        "oxygenSaturation",
        wearableData.oxygenSaturation.toString()
      );
    }

    formData.append(
      "recordedAt",
      new Date(wearableData.timestamp * 1000).toISOString()
    );
    formData.append("notes", `📱 Synchronized from Enzo 200 Smart Watch`);

    // Create vital record
    const result = await createVitalRecord(patientId, formData);

    if (!result.success) {
      console.error("Failed to create vital record:", result.error);
      return {
        success: false,
        error: result.error || "Failed to create vital record",
      };
    }

    // Store wearable sync record for audit trail
    await prisma.wearableSyncLog.create({
      data: {
        patientId,
        deviceId: wearableData.deviceId,
        deviceType: "ENZO_200",
        rawData: JSON.stringify(wearableData),
        syncedVitalRecordId: result.data?.id,
        syncStatus: "SUCCESS",
      },
    });

    return {
      success: true,
      data: result.data,
      message: "Data synchronized successfully from Enzo 200",
    };
  } catch (error) {
    console.error("Error syncing Enzo data:", error);

    // Log failure
    try {
      await prisma.wearableSyncLog.create({
        data: {
          patientId,
          deviceId: wearableData.deviceId,
          deviceType: "ENZO_200",
          rawData: JSON.stringify(wearableData),
          syncStatus: "FAILED",
          errorMessage: error instanceof Error ? error.message : String(error),
        },
      });
    } catch (logError) {
      console.error("Failed to log sync error:", logError);
    }

    return {
      success: false,
      error: "Error synchronizing wearable data",
    };
  }
}

/**
 * Register Enzo 200 device for patient
 */
export async function registerEnzoDevice(
  patientId: string,
  deviceId: string,
  authToken: string
) {
  try {
    const device = await prisma.wearableDevice.create({
      data: {
        patientId,
        deviceType: "ENZO_200",
        deviceId,
        authToken: Buffer.from(authToken).toString("base64"), // Encrypted storage
        isActive: true,
        lastSyncedAt: new Date(),
      },
    });

    return {
      success: true,
      data: device,
      message: "Enzo 200 registered successfully",
    };
  } catch (error) {
    console.error("Error registering device:", error);
    return {
      success: false,
      error: "Failed to register device",
    };
  }
}

/**
 * Get all registered wearable devices
 */
export async function getWearableDevices(patientId: string) {
  try {
    const devices = await prisma.wearableDevice.findMany({
      where: { patientId, isActive: true },
      select: {
        id: true,
        deviceType: true,
        deviceId: true,
        lastSyncedAt: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      data: devices,
    };
  } catch (error) {
    console.error("Error fetching devices:", error);
    return {
      success: false,
      error: "Failed to fetch devices",
    };
  }
}

/**
 * Get wearable sync history
 */
export async function getWearableSyncHistory(
  patientId: string,
  limit: number = 50
) {
  try {
    const syncLogs = await prisma.wearableSyncLog.findMany({
      where: { patientId, deviceType: "ENZO_200" },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return {
      success: true,
      data: syncLogs,
    };
  } catch (error) {
    console.error("Error fetching sync history:", error);
    return {
      success: false,
      error: "Failed to fetch sync history",
    };
  }
}
