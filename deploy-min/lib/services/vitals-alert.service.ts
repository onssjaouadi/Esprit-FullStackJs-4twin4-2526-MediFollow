import { prisma } from "@/lib/prisma";
import { createVitalAlert } from "../utils/vitalValidation";

export interface VitalData {
  temperature?: number;
  heartRate?: number;
  oxygenSaturation?: number;
  systolicBP?: number;
  diastolicBP?: number;
  respiratoryRate?: number;
}

export interface GeneralSymptoms {
  fatigue?: number;
  fever?: boolean;
  lossOfAppetite?: number;
}

export interface SpecialtySymptoms {
  chestPain?: number;
  palpitations?: boolean;
  shortness?: number;
  cough?: boolean;
  expectoration?: boolean;
  nausea?: number;
  vomiting?: boolean;
  diarrhea?: boolean;
  dizziness?: boolean;
  confusion?: boolean;
}

export interface SymptomData {
  general?: GeneralSymptoms;
  specialty?: SpecialtySymptoms;
  advanced?: Record<string, any>;
}

export interface AnomalyResult {
  criticalAnomalies: string[];
  moderateAnomalies: string[];
  totalAnomalies: number;
}

/**
 * Evaluate vitals and symptoms against multi-level alert rules
 */
export function evaluateVitals(
  vitals: VitalData,
  symptoms: SymptomData
): AnomalyResult {
  const criticalAnomalies: string[] = [];
  const moderateAnomalies: string[] = [];

  console.log("[evaluateVitals] Input vitals:", vitals);
  console.log("[evaluateVitals] Input symptoms:", symptoms);

  // Temperature ≥ 38.5
  if (vitals.temperature && vitals.temperature >= 38.5) {
    console.log(
      "[evaluateVitals] ✓ CRITICAL: High fever detected -",
      vitals.temperature,
      "°C"
    );
    criticalAnomalies.push(`High fever (${vitals.temperature}°C)`);
  } else {
    console.log(
      "[evaluateVitals] ✗ NO high fever: temperature =",
      vitals.temperature
    );
  }

  // Heart rate > 120
  if (vitals.heartRate && vitals.heartRate > 120) {
    console.log(
      "[evaluateVitals] ✓ CRITICAL: Tachycardia detected -",
      vitals.heartRate,
      "bpm"
    );
    criticalAnomalies.push(`Tachycardia (${vitals.heartRate} bpm)`);
  } else {
    console.log(
      "[evaluateVitals] ✗ NO tachycardia: heartRate =",
      vitals.heartRate
    );
  }

  // SpO2 < 90
  if (vitals.oxygenSaturation && vitals.oxygenSaturation < 90) {
    console.log(
      "[evaluateVitals] ✓ CRITICAL: Low O2 detected -",
      vitals.oxygenSaturation,
      "%"
    );
    criticalAnomalies.push(`Critical hypoxemia (${vitals.oxygenSaturation}%)`);
  } else {
    console.log(
      "[evaluateVitals] ✗ NO critical hypoxemia: SpO2 =",
      vitals.oxygenSaturation
    );
  }

  // High chest pain magnitude
  if (symptoms.specialty?.chestPain && symptoms.specialty.chestPain >= 7) {
    console.log(
      "[evaluateVitals] ✓ CRITICAL: Severe chest pain detected -",
      symptoms.specialty.chestPain,
      "/10"
    );
    criticalAnomalies.push(
      `Severe chest pain (${symptoms.specialty.chestPain}/10)`
    );
  } else {
    console.log(
      "[evaluateVitals] ✗ NO severe chest pain: value =",
      symptoms.specialty?.chestPain
    );
  }

  // Confusion
  if (symptoms.specialty?.confusion) {
    console.log("[evaluateVitals] ✓ CRITICAL: Confusion detected");
    criticalAnomalies.push("Confusion/altered mental status");
  } else {
    console.log("[evaluateVitals] ✗ NO confusion reported");
  }

  // MODERATE ANOMALIES - require attention

  // Temperature 38-38.4
  if (
    vitals.temperature &&
    vitals.temperature >= 38 &&
    vitals.temperature < 38.5
  ) {
    console.log(
      "[evaluateVitals] ✓ MODERATE: Moderate fever detected -",
      vitals.temperature,
      "°C"
    );
    moderateAnomalies.push(`Moderate fever (${vitals.temperature}°C)`);
  } else {
    console.log(
      "[evaluateVitals] ✗ NO moderate fever: temperature =",
      vitals.temperature
    );
  }

  // Heart rate 100-120
  if (vitals.heartRate && vitals.heartRate > 100 && vitals.heartRate <= 120) {
    console.log(
      "[evaluateVitals] ✓ MODERATE: Elevated HR detected -",
      vitals.heartRate,
      "bpm"
    );
    moderateAnomalies.push(`Elevated HR (${vitals.heartRate} bpm)`);
  } else {
    console.log(
      "[evaluateVitals] ✗ NO elevated HR: heartRate =",
      vitals.heartRate
    );
  }

  // Bradycardia < 60
  if (vitals.heartRate && vitals.heartRate < 60) {
    console.log(
      "[evaluateVitals] ✓ MODERATE: Bradycardia detected -",
      vitals.heartRate,
      "bpm"
    );
    moderateAnomalies.push(`Bradycardia (${vitals.heartRate} bpm)`);
  } else {
    console.log(
      "[evaluateVitals] ✗ NO bradycardia: heartRate =",
      vitals.heartRate
    );
  }
  if (vitals.heartRate && vitals.heartRate < 60) {
    moderateAnomalies.push(`Bradycardia (${vitals.heartRate} bpm)`);
  }

  // SpO2 90-94
  if (
    vitals.oxygenSaturation &&
    vitals.oxygenSaturation >= 90 &&
    vitals.oxygenSaturation < 95
  ) {
    moderateAnomalies.push(`Low O2 saturation (${vitals.oxygenSaturation}%)`);
  }

  // Hypertension
  if (vitals.systolicBP && vitals.systolicBP > 140) {
    moderateAnomalies.push(
      `Hypertension (${vitals.systolicBP}/${vitals.diastolicBP})`
    );
  }

  // Hypotension
  if (vitals.systolicBP && vitals.systolicBP < 90) {
    moderateAnomalies.push(`Hypotension (${vitals.systolicBP} mmHg)`);
  }

  // Elevated diastolic BP
  if (vitals.diastolicBP && vitals.diastolicBP > 90) {
    moderateAnomalies.push(
      `Elevated diastolic BP (${vitals.diastolicBP} mmHg)`
    );
  }

  // Tachypnea
  if (vitals.respiratoryRate && vitals.respiratoryRate > 20) {
    moderateAnomalies.push(
      `Fast breathing (${vitals.respiratoryRate} resp/min)`
    );
  }

  // Bradypnea
  if (vitals.respiratoryRate && vitals.respiratoryRate < 12) {
    moderateAnomalies.push(
      `Slow breathing (${vitals.respiratoryRate} resp/min)`
    );
  }

  // Moderate chest pain
  if (
    symptoms.specialty?.chestPain &&
    symptoms.specialty.chestPain >= 5 &&
    symptoms.specialty.chestPain < 7
  ) {
    moderateAnomalies.push(
      `Moderate chest pain (${symptoms.specialty.chestPain}/10)`
    );
  }

  // Palpitations
  if (symptoms.specialty?.palpitations) {
    moderateAnomalies.push("Heart palpitations");
  }

  // Shortness of breath
  if (symptoms.specialty?.shortness && symptoms.specialty.shortness >= 3) {
    moderateAnomalies.push(`Dyspnea (${symptoms.specialty.shortness}/5)`);
  }

  // Persistent cough
  if (symptoms.specialty?.cough) {
    moderateAnomalies.push("Persistent cough");
  }

  // Nausea
  if (symptoms.specialty?.nausea && symptoms.specialty.nausea >= 3) {
    moderateAnomalies.push(`Nausea (${symptoms.specialty.nausea}/5)`);
  }

  // Vomiting
  if (symptoms.specialty?.vomiting) {
    moderateAnomalies.push("Vomiting");
  }

  // Diarrhea
  if (symptoms.specialty?.diarrhea) {
    moderateAnomalies.push("Diarrhea");
  }

  // Dizziness
  if (symptoms.specialty?.dizziness) {
    moderateAnomalies.push("Dizziness");
  }

  // High fatigue
  if (symptoms.general?.fatigue && symptoms.general.fatigue >= 4) {
    moderateAnomalies.push(`Severe fatigue (${symptoms.general.fatigue}/5)`);
  }

  return {
    criticalAnomalies,
    moderateAnomalies,
    totalAnomalies: criticalAnomalies.length + moderateAnomalies.length,
  };
}

/**
 * Determine alert severity based on multi-level rules
 * - 1 critical anomaly → CRITICAL
 * - ≥ 3 total anomalies → WARNING
 * - ≥ 2 moderate anomalies → WARNING
 */
export function determineAlertSeverity(
  evaluation: AnomalyResult
): "CRITICAL" | "WARNING" | null {
  console.log("[determineAlertSeverity] Evaluation:", evaluation);

  // Smart rule 1: If 1 critical anomaly → CRITICAL
  if (evaluation.criticalAnomalies.length >= 1) {
    console.log("[determineAlertSeverity] → CRITICAL (1+ critical anomalies)");
    return "CRITICAL";
  }

  // Smart rule 2: If ≥ 3 total anomalies → WARNING
  if (evaluation.totalAnomalies >= 3) {
    console.log("[determineAlertSeverity] → WARNING (3+ total anomalies)");
    return "WARNING";
  }

  // Multiple moderate anomalies or combined symptoms → WARNING
  if (evaluation.moderateAnomalies.length >= 2) {
    console.log("[determineAlertSeverity] → WARNING (2+ moderate anomalies)");
    return "WARNING";
  }

  console.log("[determineAlertSeverity] → null (no anomalies found)");
  return null;
}

/**
 * Evaluate vitals and create alert if needed
 */
export async function evaluateAndCreateAlert(
  patientId: string,
  vitals: VitalData,
  symptoms: SymptomData,
  vitalRecordId?: string
) {
  console.log("[evaluateAndCreateAlert] Starting for patient:", patientId);
  console.log("[evaluateAndCreateAlert] Vitals received:", vitals);
  console.log("[evaluateAndCreateAlert] Symptoms received:", symptoms);

  try {
    // Evaluate vitals against rules
    const evaluation = evaluateVitals(vitals, symptoms);
    console.log("[evaluateAndCreateAlert] Evaluation result:", evaluation);

    // Determine severity
    const severity = determineAlertSeverity(evaluation);
    console.log("[evaluateAndCreateAlert] Severity determined:", severity);

    // Create alert if severity detected
    let alert = null;
    if (severity && vitalRecordId) {
      const anomalies = [
        ...evaluation.criticalAnomalies,
        ...evaluation.moderateAnomalies,
      ];

      // Map severity to VitalStatus for createVitalAlert
      const vitalStatus = severity === "CRITICAL" ? "CRITIQUE" : "A_VERIFIER";

      // Create violations object for createVitalAlert function
      const violations = {
        critical: evaluation.criticalAnomalies,
        abnormal: evaluation.moderateAnomalies,
        triggeredRules: [],
      };

      console.log(
        "[evaluateAndCreateAlert] Creating alert with status:",
        vitalStatus
      );
      console.log("[evaluateAndCreateAlert] Violations:", violations);

      try {
        alert = await createVitalAlert(
          vitalRecordId,
          patientId,
          vitalStatus,
          violations
        );
        console.log(
          `[Alert-${severity}] Patient ${patientId}: Alert created with ID ${alert}`
        );
      } catch (createError) {
        console.error(
          "[evaluateAndCreateAlert] Failed to create alert:",
          createError
        );
        // Don't fail if alert creation fails
      }
    } else {
      console.log(
        "[evaluateAndCreateAlert] No alert created (severity is null or no vitalRecordId)"
      );
    }

    return {
      severity,
      evaluation,
      alert: alert ? { id: alert } : null, // Return compatible object for API response
    };
  } catch (error) {
    console.error("Error in evaluateAndCreateAlert:", error);
    throw error;
  }
}
