/**
 * Vital Validation & Classification Utilities
 * Auto-classifies VitalRecord status based on thresholds
 * Handles alert generation for abnormal values
 */

import prisma from "@/lib/prisma";
import NotificationService from "@/lib/services/notification.service";

export interface VitalData {
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  weight?: number;
}

export interface VitalRange {
  min: number;
  max: number;
}

export interface VitalThresholds {
  systolicBP?: VitalRange;
  diastolicBP?: VitalRange;
  heartRate?: VitalRange;
  temperature?: VitalRange;
  oxygenSaturation?: VitalRange;
  weight?: VitalRange;
}

/**
 * Default thresholds if patient doesn't have custom ones
 */
export const DEFAULT_VITAL_THRESHOLDS: VitalThresholds = {
  systolicBP: { min: 90, max: 140 },
  diastolicBP: { min: 60, max: 90 },
  heartRate: { min: 60, max: 100 },
  temperature: { min: 36.1, max: 37.2 },
  oxygenSaturation: { min: 95, max: 100 },
  weight: { min: 40, max: 150 }, // Generic range
};

/**
 * Critical values that require immediate intervention
 */
export const CRITICAL_THRESHOLDS: Record<
  string,
  { min?: number; max?: number }
> = {
  systolicBP: { min: 80, max: 180 },
  diastolicBP: { min: 50, max: 120 },
  heartRate: { min: 40, max: 140 },
  temperature: { min: 35, max: 39 },
  oxygenSaturation: { min: 88, max: 100 },
  weight: { min: 25, max: 200 },
};

export type VitalStatus = "NORMAL" | "A_VERIFIER" | "CRITIQUE";

/**
 * Classify vital record status based on values and thresholds
 */
export async function classifyVitalStatus(
  vitalData: VitalData,
  patientId: string
): Promise<VitalStatus> {
  // Get patient thresholds
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
  });

  if (!patient) {
    throw new Error(`Patient not found: ${patientId}`);
  }

  const thresholds = patient.vitalThresholds || DEFAULT_VITAL_THRESHOLDS;

  // Check each vital against thresholds
  const violations = getVitalViolations(vitalData, thresholds);

  if (violations.critical.length > 0) {
    return "CRITIQUE";
  } else if (violations.abnormal.length > 0) {
    return "A_VERIFIER";
  } else {
    return "NORMAL";
  }
}

/**
 * Get violations (abnormal and critical values)
 */
export function getVitalViolations(
  vitalData: VitalData,
  thresholds: VitalThresholds
): {
  abnormal: string[];
  critical: string[];
  triggeredRules: Array<{
    field: string;
    value: number;
    range: VitalRange;
    severity: string;
  }>;
} {
  const abnormal: string[] = [];
  const critical: string[] = [];
  const triggeredRules: Array<{
    field: string;
    value: number;
    range: VitalRange;
    severity: string;
  }> = [];

  // Ensure thresholds are merged with defaults
  const mergedThresholds: VitalThresholds = {
    ...DEFAULT_VITAL_THRESHOLDS,
    ...thresholds,
  };

  // Check each vital
  const checks = [
    {
      key: "systolicBP",
      value: vitalData.systolicBP,
      threshold: mergedThresholds.systolicBP,
      criticalRange: CRITICAL_THRESHOLDS.systolicBP,
    },
    {
      key: "diastolicBP",
      value: vitalData.diastolicBP,
      threshold: mergedThresholds.diastolicBP,
      criticalRange: CRITICAL_THRESHOLDS.diastolicBP,
    },
    {
      key: "heartRate",
      value: vitalData.heartRate,
      threshold: mergedThresholds.heartRate,
      criticalRange: CRITICAL_THRESHOLDS.heartRate,
    },
    {
      key: "temperature",
      value: vitalData.temperature,
      threshold: mergedThresholds.temperature,
      criticalRange: CRITICAL_THRESHOLDS.temperature,
    },
    {
      key: "oxygenSaturation",
      value: vitalData.oxygenSaturation,
      threshold: mergedThresholds.oxygenSaturation,
      criticalRange: CRITICAL_THRESHOLDS.oxygenSaturation,
    },
    {
      key: "weight",
      value: vitalData.weight,
      threshold: mergedThresholds.weight,
      criticalRange: CRITICAL_THRESHOLDS.weight,
    },
  ];

  for (const check of checks) {
    if (check.value === undefined || check.value === null) continue;

    const threshold = check.threshold;
    const criticalRange = check.criticalRange;

    // Check critical first (higher priority)
    if (
      criticalRange &&
      ((criticalRange.min && check.value < criticalRange.min) ||
        (criticalRange.max && check.value > criticalRange.max))
    ) {
      critical.push(check.key);
      triggeredRules.push({
        field: check.key,
        value: check.value,
        range: criticalRange,
        severity: "CRITICAL",
      });
    }
    // Then check abnormal
    else if (
      threshold &&
      ((threshold.min && check.value < threshold.min) ||
        (threshold.max && check.value > threshold.max))
    ) {
      abnormal.push(check.key);
      triggeredRules.push({
        field: check.key,
        value: check.value,
        range: threshold,
        severity: "ABNORMAL",
      });
    }
  }

  return { abnormal, critical, triggeredRules };
}

/**
 * Generate alert message based on violated rules
 */
export function generateAlertMessage(violations: {
  abnormal: string[];
  critical: string[];
  triggeredRules: Array<{
    field: string;
    value: number;
    range: VitalRange;
    severity: string;
  }>;
}): string {
  if (violations.critical.length > 0) {
    const fields = violations.critical.join(", ");
    return `Valeur(s) critique détectée: ${fields}. Intervention médicale requise immédiatement.`;
  } else if (violations.abnormal.length > 0) {
    const fields = violations.abnormal.join(", ");
    return `Valeur(s) anormale détectée: ${fields}. Vérification médicale nécessaire.`;
  }
  return "Mesure vitale anormale détectée.";
}

/**
 * Validate vital data (type checking, range validation)
 */
export function validateVitalData(data: any): VitalData {
  const validated: VitalData = {};

  if (data.systolicBP !== undefined) {
    const val = parseFloat(data.systolicBP);
    if (isNaN(val) || val < 0 || val > 300)
      throw new Error("systolicBP must be between 0-300");
    validated.systolicBP = val;
  }

  if (data.diastolicBP !== undefined) {
    const val = parseFloat(data.diastolicBP);
    if (isNaN(val) || val < 0 || val > 200)
      throw new Error("diastolicBP must be between 0-200");
    validated.diastolicBP = val;
  }

  if (data.heartRate !== undefined) {
    const val = parseFloat(data.heartRate);
    if (isNaN(val) || val < 0 || val > 300)
      throw new Error("heartRate must be between 0-300");
    validated.heartRate = val;
  }

  if (data.temperature !== undefined) {
    const val = parseFloat(data.temperature);
    if (isNaN(val) || val < 30 || val > 45)
      throw new Error("temperature must be between 30-45°C");
    validated.temperature = val;
  }

  if (data.oxygenSaturation !== undefined) {
    const val = parseFloat(data.oxygenSaturation);
    if (isNaN(val) || val < 0 || val > 100)
      throw new Error("oxygenSaturation must be between 0-100%");
    validated.oxygenSaturation = val;
  }

  if (data.weight !== undefined) {
    const val = parseFloat(data.weight);
    if (isNaN(val) || val < 0 || val > 500)
      throw new Error("weight must be between 0-500 kg");
    validated.weight = val;
  }

  return validated;
}

/**
 * Create alert for abnormal vitals (called during vital record creation)
 */
export async function createVitalAlert(
  vitalRecordId: string,
  patientId: string,
  status: VitalStatus,
  violations: {
    abnormal: string[];
    critical: string[];
    triggeredRules: Array<{
      field: string;
      value: number;
      range: VitalRange;
      severity: string;
    }>;
  }
): Promise<string | null> {
  if (status === "NORMAL") return null; // No alert needed

  const severity = status === "CRITIQUE" ? "CRITICAL" : "MEDIUM";
  const message = generateAlertMessage(violations);

  const alert = await prisma.alert.create({
    data: {
      patientId,
      vitalRecordId,
      alertType: "VITAL",
      severity: severity as any,
      message,
      status: "OPEN",
      data: {
        violations,
        vitalRecordId,
      },
    },
  });

  // Send notification to patient
  try {
    await NotificationService.notifyAlert(alert.id);
  } catch (error) {
    console.error("❌ Failed to send alert notification:", error);
    // Don't fail the vital creation if notification fails
  }

  return alert.id;
}

/**
 * Get vital statistics for patient (last 7 days)
 */
export async function getVitalStatistics(patientId: string) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const records = await prisma.vitalRecord.findMany({
    where: {
      patientId,
      recordedAt: { gte: sevenDaysAgo },
    },
    orderBy: { recordedAt: "desc" },
  });

  if (records.length === 0) {
    return null;
  }

  const stats: Record<string, any> = {};

  const vitalFields = [
    "systolicBP",
    "diastolicBP",
    "heartRate",
    "temperature",
    "oxygenSaturation",
    "weight",
  ];

  for (const field of vitalFields) {
    const values = records
      .map((r: any) => r[field])
      .filter((v) => v !== null && v !== undefined);

    if (values.length > 0) {
      stats[field] = {
        min: Math.min(...values),
        max: Math.max(...values),
        avg:
          Math.round(
            (values.reduce((a: number, b: number) => a + b) / values.length) *
              10
          ) / 10,
        count: values.length,
        trend:
          values[0] > values[values.length - 1] ? "decreasing" : "increasing",
      };
    }
  }

  return stats;
}
