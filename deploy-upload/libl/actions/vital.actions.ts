/**
 * MediFollow - Vital Records Actions
 * Server actions for vital signs management
 */

"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { VitalRecordSchema } from "@/lib/validation";

import { checkVitalThresholds } from "./alert.actions";
import { createBlockchainProof } from "./blockchain.actions";
import { detectAndCreateEarlyWarningAlert } from "@/lib/ai/admin-intelligence";

export async function createVitalRecord(patientId: string, formData: FormData) {
  try {
    const rawData = {
      systolicBP: formData.get("systolicBP") as string,
      diastolicBP: formData.get("diastolicBP") as string,
      heartRate: formData.get("heartRate") as string,
      temperature: formData.get("temperature") as string,
      oxygenSaturation: formData.get("oxygenSaturation") as string,
      weight: formData.get("weight") as string,
      notes: formData.get("notes") as string,
      recordedAt: formData.get("recordedAt") as string,
    };

    const validated = VitalRecordSchema.parse(rawData);

    // Convert string values to numbers
    const vitalData: any = {
      patientId,
      recordedAt: validated.recordedAt
        ? new Date(validated.recordedAt)
        : new Date(),
    };

    if (validated.systolicBP)
      vitalData.systolicBP = parseFloat(validated.systolicBP);
    if (validated.diastolicBP)
      vitalData.diastolicBP = parseFloat(validated.diastolicBP);
    if (validated.heartRate)
      vitalData.heartRate = parseFloat(validated.heartRate);
    if (validated.temperature)
      vitalData.temperature = parseFloat(validated.temperature);
    if (validated.oxygenSaturation)
      vitalData.oxygenSaturation = parseFloat(validated.oxygenSaturation);
    if (validated.weight) vitalData.weight = parseFloat(validated.weight);
    if (validated.notes) vitalData.notes = validated.notes;

    // Create vital record
    const vitalRecord = await prisma.vitalRecord.create({
      data: vitalData,
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
    });

    // Check thresholds and create alerts if necessary
    await checkVitalThresholds(vitalRecord);

    // AI anomaly detection for early warning alerts
    await detectAndCreateEarlyWarningAlert(vitalRecord.patientId);

    // Create blockchain proof for data integrity
    await createBlockchainProof(vitalRecord.id, {
      patientId: vitalRecord.patientId,
      systolicBP: vitalRecord.systolicBP,
      diastolicBP: vitalRecord.diastolicBP,
      heartRate: vitalRecord.heartRate,
      temperature: vitalRecord.temperature,
      oxygenSaturation: vitalRecord.oxygenSaturation,
      weight: vitalRecord.weight,
      recordedAt: vitalRecord.recordedAt,
    });

    revalidatePath("/dashboard/patient");
    revalidatePath("/dashboard/doctor");

    return {
      success: true,
      message: "Constantes vitales enregistrées",
      vitalRecord,
    };
  } catch (error: any) {
    console.error("Create vital record error:", error);
    return { success: false, error: "Erreur lors de l'enregistrement" };
  }
}

export async function getVitalRecords(patientId: string, limit?: number) {
  try {
    const records = await prisma.vitalRecord.findMany({
      where: { patientId },
      orderBy: { recordedAt: "desc" },
      take: limit,
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
    });

    return { success: true, records };
  } catch (error) {
    console.error("Get vital records error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération",
      records: [],
    };
  }
}

export async function getLatestVitalRecord(patientId: string) {
  try {
    const record = await prisma.vitalRecord.findFirst({
      where: { patientId },
      orderBy: { recordedAt: "desc" },
    });

    return { success: true, record };
  } catch (error) {
    console.error("Get latest vital record error:", error);
    return { success: false, error: "Erreur", record: null };
  }
}

export async function getVitalRecordById(id: string) {
  try {
    const record = await prisma.vitalRecord.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
    });

    return { success: true, record };
  } catch (error) {
    console.error("Get vital record error:", error);
    return { success: false, error: "Erreur", record: null };
  }
}

export async function deleteVitalRecord(id: string) {
  try {
    await prisma.vitalRecord.delete({
      where: { id },
    });

    revalidatePath("/dashboard/patient");
    revalidatePath("/dashboard/doctor");

    return { success: true, message: "Enregistrement supprimé" };
  } catch (error) {
    console.error("Delete vital record error:", error);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

export async function getVitalStats(patientId: string, days: number = 7) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const records = await prisma.vitalRecord.findMany({
      where: {
        patientId,
        recordedAt: {
          gte: startDate,
        },
      },
      orderBy: { recordedAt: "asc" },
    });

    // Calculate averages
    const stats = {
      avgSystolicBP: 0,
      avgDiastolicBP: 0,
      avgHeartRate: 0,
      avgTemperature: 0,
      avgOxygenSaturation: 0,
      recordCount: records.length,
      records,
    };

    if (records.length > 0) {
      const systolic = records
        .filter((r: any) => r.systolicBP)
        .map((r: any) => r.systolicBP!);
      const diastolic = records
        .filter((r: any) => r.diastolicBP)
        .map((r: any) => r.diastolicBP!);
      const heartRate = records
        .filter((r: any) => r.heartRate)
        .map((r: any) => r.heartRate!);
      const temp = records
        .filter((r: any) => r.temperature)
        .map((r: any) => r.temperature!);
      const spo2 = records
        .filter((r: any) => r.oxygenSaturation)
        .map((r: any) => r.oxygenSaturation!);

      if (systolic.length)
        stats.avgSystolicBP =
          systolic.reduce((a: number, b: number) => a + b, 0) / systolic.length;
      if (diastolic.length)
        stats.avgDiastolicBP =
          diastolic.reduce((a: number, b: number) => a + b, 0) /
          diastolic.length;
      if (heartRate.length)
        stats.avgHeartRate =
          heartRate.reduce((a: number, b: number) => a + b, 0) /
          heartRate.length;
      if (temp.length)
        stats.avgTemperature =
          temp.reduce((a: number, b: number) => a + b, 0) / temp.length;
      if (spo2.length)
        stats.avgOxygenSaturation =
          spo2.reduce((a: number, b: number) => a + b, 0) / spo2.length;
    }

    return { success: true, stats };
  } catch (error) {
    console.error("Get vital stats error:", error);
    return { success: false, error: "Erreur", stats: null };
  }
}
