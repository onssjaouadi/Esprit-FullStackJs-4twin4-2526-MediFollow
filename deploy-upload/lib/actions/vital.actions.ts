/**
 * MediFollow - Vital Records Actions
 * Server actions for vital signs management
 */

"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { VitalRecordSchema } from "@/lib/validation";
import {
  classifyVitalStatus,
  createVitalAlert,
  validateVitalData,
  getVitalViolations,
  DEFAULT_VITAL_THRESHOLDS,
} from "@/lib/utils/vitalValidation";

import { checkVitalThresholds } from "./alert.actions";
import { analyzePatientRisk, calculateFallbackRiskScore } from "@/lib/ai/riskAnalysis";

export async function createVitalRecord(
  patientId: string,
  formData: FormData,
  enteredBy?: string,
  enteredByRole?: string
) {
  try {
    const rawData = {
      systolicBP: formData.get("systolicBP") as string,
      diastolicBP: formData.get("diastolicBP") as string,
      heartRate: formData.get("heartRate") as string,
      temperature: formData.get("temperature") as string,
      oxygenSaturation: formData.get("oxygenSaturation") as string,
      weight: formData.get("weight") as string,
      notes: formData.get("notes") as string,
      recordedAt: formData.get("recordedAt") as string | null,
    };

    // Convert null to undefined for optional fields so Zod treats them as missing
    const cleanedData = Object.fromEntries(
      Object.entries(rawData).map(([key, value]) => [
        key,
        value === null ? undefined : value,
      ])
    );

    const validated = VitalRecordSchema.parse(cleanedData);

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

    // Auto-classify vital status and get violations
    const status = await classifyVitalStatus(
      {
        systolicBP: vitalData.systolicBP,
        diastolicBP: vitalData.diastolicBP,
        heartRate: vitalData.heartRate,
        temperature: vitalData.temperature,
        oxygenSaturation: vitalData.oxygenSaturation,
        weight: vitalData.weight,
      },
      patientId
    );

    vitalData.status = status;

    // Get patient thresholds for violations
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });
    const thresholds = patient?.vitalThresholds || DEFAULT_VITAL_THRESHOLDS;
    const violations = getVitalViolations(vitalData, thresholds);

    if (violations.critical.length > 0 || violations.abnormal.length > 0) {
      vitalData.triggeredRules = violations.triggeredRules;
    }

    // Add entry tracking if provided
    if (enteredBy) {
      vitalData.enteredBy = enteredBy;
    }
    if (enteredByRole) {
      vitalData.enteredByRole = enteredByRole;
    }

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

    // Create alert if status is not NORMAL
    if (status !== "NORMAL") {
      await createVitalAlert(vitalRecord.id, patientId, status, violations);
    }

    // Also run legacy thresholds check for compatibility
    await checkVitalThresholds(vitalRecord);

    // AI Risk Analysis (async, don't block response)
    runAIAnalysis(vitalRecord.id, patientId, vitalData).catch((error: any) => {
      console.error("AI analysis error:", error);
    });

    revalidatePath("/dashboard/patient");
    revalidatePath("/dashboard/doctor");
    revalidatePath("/dashboard/doctor/vitals");
    revalidatePath("/dashboard/nurse");

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
    revalidatePath("/dashboard/doctor/vitals");

    return { success: true, message: "Enregistrement supprimé" };
  } catch (error) {
    console.error("Delete vital record error:", error);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

export async function updateVitalRecord(id: string, formData: FormData) {
  try {
    const rawData = {
      systolicBP: formData.get("systolicBP") as string,
      diastolicBP: formData.get("diastolicBP") as string,
      heartRate: formData.get("heartRate") as string,
      temperature: formData.get("temperature") as string,
      oxygenSaturation: formData.get("oxygenSaturation") as string,
      weight: formData.get("weight") as string,
      notes: formData.get("notes") as string,
    };

    // Convert null to undefined for optional fields so Zod treats them as missing
    const cleanedData = Object.fromEntries(
      Object.entries(rawData).map(([key, value]) => [
        key,
        value === null ? undefined : value,
      ])
    );

    const validated = VitalRecordSchema.parse(cleanedData);

    // Convert string values to numbers
    const vitalData: any = {};

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
    if (validated.notes !== undefined) vitalData.notes = validated.notes;

    // Update vital record
    const vitalRecord = await prisma.vitalRecord.update({
      where: { id },
      data: vitalData,
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
    });

    // Re-check thresholds
    await checkVitalThresholds(vitalRecord);

    revalidatePath("/dashboard/patient");
    revalidatePath("/dashboard/doctor");
    revalidatePath("/dashboard/doctor/vitals");

    return {
      success: true,
      message: "Constantes vitales modifiées",
      vitalRecord,
    };
  } catch (error: any) {
    console.error("Update vital record error:", error);
    return { success: false, error: "Erreur lors de la modification" };
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

/**
 * DOCTOR REVIEW FUNCTIONS
 */

/**
 * Get vital records pending doctor review
 */
export async function getVitalsToReview(doctorId?: string, patientId?: string) {
  try {
    const where: any = {
      reviewStatus: "PENDING",
    };

    if (patientId) {
      where.patientId = patientId;
    }

    const records = await prisma.vitalRecord.findMany({
      where,
      orderBy: {
        recordedAt: "desc",
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        alerts: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },
    });

    return { success: true, records };
  } catch (error: any) {
    console.error("Get vitals to review error:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération",
      records: [],
    };
  }
}

/**
 * Review vital record by doctor
 * Adds doctor notes and updates review status
 */
export async function reviewVitalRecord(
  recordId: string,
  doctorId: string,
  reviewNotes: string,
  newStatus?: "NORMAL" | "A_VERIFIER" | "CRITIQUE"
) {
  try {
    // Get current record
    const currentRecord = await prisma.vitalRecord.findUnique({
      where: { id: recordId },
      include: { patient: true },
    });

    if (!currentRecord) {
      return { success: false, error: "Enregistrement non trouvé" };
    }

    // Update with review info
    const updated = await prisma.vitalRecord.update({
      where: { id: recordId },
      data: {
        reviewStatus: "REVIEWED",
        reviewedById: doctorId,
        reviewedAt: new Date(),
        reviewNotes,
        // Optionally update status based on doctor's review
        ...(newStatus && { status: newStatus }),
      },
      include: {
        patient: { include: { user: true } },
        reviewedBy: true,
        alerts: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: doctorId,
        action: "REVIEW_VITAL",
        entityType: "VitalRecord",
        entityId: recordId,
        changes: {
          reviewStatus: "REVIEWED",
          reviewNotes,
          statusChanged: newStatus ? currentRecord.status !== newStatus : false,
          newStatus,
        },
        timestamp: new Date(),
      },
    });

    revalidatePath("/dashboard/doctor/vitals-review");
    revalidatePath(`/dashboard/patient/${currentRecord.patientId}/vitals`);

    return {
      success: true,
      message: "Revision enregistrée",
      record: updated,
    };
  } catch (error: any) {
    console.error("Review vital record error:", error);
    return { success: false, error: "Erreur lors de la révision" };
  }
}

/**
 * Get vital review history for a record
 */
export async function getVitalReviewHistory(recordId: string) {
  try {
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        entityType: "VitalRecord",
        entityId: recordId,
        action: "REVIEW_VITAL",
      },
      include: {
        user: true,
      },
      orderBy: { timestamp: "desc" },
    });

    return { success: true, history: auditLogs };
  } catch (error: any) {
    console.error("Get vital review history error:", error);
    return { success: false, error: "Erreur", history: [] };
  }
}

/**
 * AI Analysis for vital records (runs async in background)
 */
async function runAIAnalysis(
  vitalRecordId: string,
  patientId: string,
  vitalData: any
) {
  try {
    // Get patient details
    const patient: any = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: true,
      },
    });

    if (!patient) return;

    // Get vital history for trend analysis
    const vitalHistory = await prisma.vitalRecord.findMany({
      where: { patientId },
      orderBy: { recordedAt: "desc" },
      take: 7,
      select: {
        recordedAt: true,
        systolicBP: true,
        diastolicBP: true,
        heartRate: true,
        temperature: true,
        oxygenSaturation: true,
        weight: true,
      },
    });

    // Calculate age
    const age = Math.floor(
      (new Date().getTime() - new Date(patient.dateOfBirth).getTime()) /
        (365.25 * 24 * 60 * 60 * 1000)
    );

    // Get baseline (average of recent normal vitals)
    const baseline = {
      systolicBP: 120,
      diastolicBP: 80,
      heartRate: 70,
      temperature: 37,
      oxygenSaturation: 98,
    };

    // Run AI risk analysis
    const riskAnalysis = await analyzePatientRisk({
      patientName: `${patient.user.firstName} ${patient.user.lastName}`,
      age,
      conditions: [],
      baseline,
      vitalHistory: vitalHistory.map((v) => ({
        recordedAt: v.recordedAt,
        systolicBP: v.systolicBP || undefined,
        diastolicBP: v.diastolicBP || undefined,
        heartRate: v.heartRate || undefined,
        temperature: v.temperature || undefined,
        oxygenSaturation: v.oxygenSaturation || undefined,
        weight: v.weight || undefined,
      })),
      latestVitals: {
        systolicBP: vitalData.systolicBP,
        diastolicBP: vitalData.diastolicBP,
        heartRate: vitalData.heartRate,
        temperature: vitalData.temperature,
        oxygenSaturation: vitalData.oxygenSaturation,
        weight: vitalData.weight,
      },
    });

    if (riskAnalysis.success && riskAnalysis.analysis) {
      // Update vital record with AI analysis
      await (prisma.vitalRecord as any).update({
        where: { id: vitalRecordId },
        data: {
          aiAnalysis: riskAnalysis.analysis,
          riskScore: riskAnalysis.analysis.riskScore,
          trendIndicator: riskAnalysis.analysis.trendIndicator,
          aiRecommendations: riskAnalysis.analysis.recommendations.join("; "),
        },
      });
    } else {
      // Fallback to rule-based risk score
      const fallbackScore = calculateFallbackRiskScore(vitalData);
      await (prisma.vitalRecord as any).update({
        where: { id: vitalRecordId },
        data: {
          riskScore: fallbackScore,
          trendIndicator: "stable",
        },
      });
    }
  } catch (error) {
    console.error("AI analysis error:", error);
  }
}

export async function reclassifyAllVitals() {
  try {
    const vitals = await prisma.vitalRecord.findMany({
      select: {
        id: true,
      },
    });

    return {
      success: true,
      total: vitals.length,
      updated: 0,
      message: "Reclassification routine available but no records were modified.",
    };
  } catch (error) {
    console.error("Reclassify all vitals error:", error);
    return {
      success: false,
      error: "Erreur lors de la reclassification des constantes vitales",
    };
  }
}
