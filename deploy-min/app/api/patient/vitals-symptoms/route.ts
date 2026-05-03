import { getCurrentUserFromRequest } from "@/lib/auth-api";
import prisma from "@/lib/prisma";
import { evaluateAndCreateAlert } from "@/lib/services/vitals-alert.service";
import { classifyVitalsWithAI } from "@/lib/services/vitals-ai-status.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(req);
    console.log("[Vitals-Symptoms API] User:", user?.id || null);

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (user.role !== "PATIENT") {
      return NextResponse.json(
        { error: `Invalid role: ${user.role}` },
        { status: 403 }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("[Vitals-Symptoms] JSON parse error:", parseError);
      return NextResponse.json(
        {
          error: "Invalid JSON format",
          details: "Failed to parse request body",
        },
        { status: 400 }
      );
    }

    const { vitals, symptoms } = body;

    // Validate vitals data
    if (!vitals) {
      console.error("[Vitals-Symptoms] Missing vitals data");
      return NextResponse.json(
        { error: "Missing vitals data in request" },
        { status: 400 }
      );
    }

    // Find patient by user ID
    const patient = await prisma.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) {
      console.error("[Vitals-Symptoms] Patient not found for user:", user.id);
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    console.log(
      "[Vitals-Symptoms] Creating vital record for patient:",
      patient.id
    );
    console.log("[Vitals-Symptoms] Vitals data:", vitals);

    // Create vital record with symptoms data
    let vitalRecord;
    try {
      vitalRecord = await prisma.vitalRecord.create({
        data: {
          patientId: patient.id,
          temperature: vitals.temperature
            ? parseFloat(vitals.temperature)
            : null,
          heartRate: vitals.heartRate ? parseFloat(vitals.heartRate) : null,
          systolicBP: vitals.systolicBP ? parseFloat(vitals.systolicBP) : null,
          diastolicBP: vitals.diastolicBP
            ? parseFloat(vitals.diastolicBP)
            : null,
          oxygenSaturation: vitals.oxygenSaturation
            ? parseFloat(vitals.oxygenSaturation)
            : null,
          weight: vitals.weight ? parseFloat(vitals.weight) : null,
          // Store all symptoms (including respiratoryRate) in JSON field
          symptoms: {
            respiratoryRate: vitals.respiratoryRate
              ? parseFloat(vitals.respiratoryRate)
              : null,
            general: symptoms?.general || {},
            specialty: symptoms?.specialty || {},
            advanced: symptoms?.advanced || {},
          },
          status: "A_VERIFIER", // Will be updated with AI classification
          recordedAt: new Date(),
        },
      });
      console.log(
        "[Vitals-Symptoms] Successfully saved vital record:",
        vitalRecord.id
      );
    } catch (dbError) {
      console.error(
        "[Vitals-Symptoms] Database error creating vital record:",
        dbError
      );
      return NextResponse.json(
        {
          error: "Erreur lors de la sauvegarde des constantes",
          details:
            dbError instanceof Error ? dbError.message : "Database error",
        },
        { status: 500 }
      );
    }

    // Get AI health status classification
    let healthStatus;
    try {
      // Get full patient info for AI context
      const fullPatient = await prisma.patient.findUnique({
        where: { id: patient.id },
        include: {
          currentMedications: {
            select: { medication: true },
          },
        },
      });

      const age = patient.dateOfBirth
        ? Math.floor(
            (Date.now() - new Date(patient.dateOfBirth).getTime()) /
              (365.25 * 24 * 60 * 60 * 1000)
          )
        : undefined;

      healthStatus = await classifyVitalsWithAI(vitals, symptoms || {}, {
        age,
        specialty: patient.specialty || "GENERAL_MEDICINE",
        medicalHistory: patient.medicalBackground
          ? Object.entries(patient.medicalBackground as any)
              .filter(([_, value]) => value === true)
              .map(([key]) => key)
          : [],
        currentMedications:
          fullPatient?.currentMedications?.map((m) => m.medication) || [],
      });

      console.log("[Vitals-Symptoms] AI Health Status:", healthStatus.severity);

      // Map AI severity to VitalStatus enum
      const statusMapping: {
        [key: string]: "NORMAL" | "A_VERIFIER" | "CRITIQUE";
      } = {
        EXCELLENT: "NORMAL",
        GOOD: "NORMAL",
        FAIR: "A_VERIFIER",
        POOR: "A_VERIFIER",
        CRITICAL: "CRITIQUE",
      };

      const vitalStatus = statusMapping[healthStatus.severity] || "A_VERIFIER";

      // Update vital record with AI classification
      await prisma.vitalRecord.update({
        where: { id: vitalRecord.id },
        data: {
          status: vitalStatus,
          triggeredRules: JSON.parse(JSON.stringify(healthStatus)),
        },
      });
    } catch (aiError) {
      console.error("[Vitals-Symptoms] AI classification error:", aiError);
      // Update with default status if AI fails
      await prisma.vitalRecord.update({
        where: { id: vitalRecord.id },
        data: { status: "NORMAL" },
      });
      healthStatus = {
        severity: "GOOD",
        classification: "Status Unavailable",
        insights: "AI analysis unavailable, vitals recorded successfully.",
        recommendations: [],
        riskFactors: [],
        correlations: [],
      };
    }

    // Evaluate vitals and create alert if needed
    let alertResult;
    try {
      console.log("[Vitals-Symptoms] About to evaluate vitals...");
      console.log("[Vitals-Symptoms] Vitals object:", vitals);
      console.log("[Vitals-Symptoms] Symptoms object:", symptoms);

      alertResult = await evaluateAndCreateAlert(
        patient.id,
        vitals,
        symptoms || {},
        vitalRecord.id
      );
      console.log(
        "[Vitals-Symptoms] Alert evaluation completed. Severity:",
        alertResult.severity
      );
      console.log("[Vitals-Symptoms] Full alert result:", alertResult);
    } catch (alertError) {
      console.error("[Vitals-Symptoms] Alert creation error:", alertError);
      // Don't fail the entire request if alert creation fails
      alertResult = {
        severity: null,
        evaluation: {
          criticalAnomalies: [],
          moderateAnomalies: [],
          totalAnomalies: 0,
        },
        alert: null,
      };
    }

    return NextResponse.json({
      success: true,
      message: "Constantes et symptômes enregistrés avec succès",
      vitalRecordId: vitalRecord.id,
      healthStatus: healthStatus,
      alert: alertResult.alert
        ? {
            id: alertResult.alert.id,
            severity: alertResult.severity,
          }
        : null,
      evaluation: {
        severity: alertResult.severity,
        criticalAnomalies: alertResult.evaluation.criticalAnomalies,
        moderateAnomalies: alertResult.evaluation.moderateAnomalies,
        totalAnomalies: alertResult.evaluation.totalAnomalies,
      },
    });
  } catch (error) {
    console.error("[Vitals-Symptoms] Unexpected error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Erreur lors de la sauvegarde des constantes",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
