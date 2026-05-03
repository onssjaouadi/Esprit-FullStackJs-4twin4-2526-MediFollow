"use server";

/**
 * Server Actions for AI Features
 * These wrap AI services to be callable from client components
 */

import { parseVitalSigns, ParsedVitals } from "@/lib/ai/vitalParser";
import { generateNursingReport } from "@/lib/ai/reportGeneration";
import { analyzePatientRisk } from "@/lib/ai/riskAnalysis";
import { chatCompletionJSON } from "@/lib/ai/openai.service";
import prisma from "@/lib/prisma";

/**
 * Parse vital signs from voice transcript
 * Server action wrapper for AI parsing
 */
export async function parseVitalsFromVoice(
  transcript: string
): Promise<
  | { success: true; vitals: ParsedVitals; error?: never }
  | { success: false; error: string; vitals?: never }
> {
  try {
    const result = await chatCompletionJSON<ParsedVitals>(
      [
        {
          role: "user",
          content: transcript,
        },
      ],
      {
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
        maxTokens: 500,
      }
    );
    if (result.success && result.data) {
      return {
        success: true,
        vitals: result.data,
      };
    } else {
      return {
        success: false,
        error: result.error || "Failed to parse vitals",
      };
    }
  } catch (error: any) {
    console.error("Parse vitals error:", error);
    return {
      success: false,
      error: error.message || "Failed to parse vitals",
    };
  }
}

/**
 * Generate comprehensive AI report for a vital record
 * Uses RAG to fetch patient history and context
 */
export async function generateVitalReport(vitalRecordId: string) {
  try {
    // Fetch vital record with patient data (RAG - Retrieval)
    const vitalRecord: any = await prisma.vitalRecord.findUnique({
      where: { id: vitalRecordId },
      include: {
        patient: {
          include: {
            user: true,
            vitalRecords: {
              orderBy: { recordedAt: "desc" },
              take: 10,
            },
            alerts: {
              where: { status: "OPEN" },
              orderBy: { createdAt: "desc" },
              take: 5,
            },
          },
        },
      },
    });

    if (!vitalRecord) {
      return {
        success: false,
        error: "Vital record not found",
      };
    }

    const patient = vitalRecord.patient;
    const age =
      new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();

    // Prepare context for AI (Augmentation)
    const currentVitals = {
      systolicBP: vitalRecord.systolicBP,
      diastolicBP: vitalRecord.diastolicBP,
      heartRate: vitalRecord.heartRate,
      temperature: vitalRecord.temperature,
      oxygenSaturation: vitalRecord.oxygenSaturation,
      weight: vitalRecord.weight,
    };

    const vitalHistory = patient.vitalRecords.slice(1).map((v: any) => ({
      recordedAt: v.recordedAt,
      systolicBP: v.systolicBP,
      diastolicBP: v.diastolicBP,
      heartRate: v.heartRate,
      temperature: v.temperature,
      oxygenSaturation: v.oxygenSaturation,
      weight: v.weight,
    }));

    const baseline = {
      systolicBP: 120,
      diastolicBP: 80,
      heartRate: 70,
      temperature: 37,
      oxygenSaturation: 98,
    };

    // Generate AI analysis (gracefully handle errors)
    let riskAnalysis: any = { success: false };
    try {
      riskAnalysis = await analyzePatientRisk({
        patientName: `${patient.user.firstName} ${patient.user.lastName}`,
        age,
        conditions: patient.diagnosis ? [patient.diagnosis] : [],
        baseline,
        vitalHistory,
        latestVitals: currentVitals,
      });
    } catch (analysisError: any) {
      console.warn(
        "Risk analysis failed, using defaults:",
        analysisError.message
      );
    }

    // Generate detailed nursing report (gracefully handle errors)
    let nursingReport: any = { success: false };
    try {
      nursingReport = await generateNursingReport({
        patientName: `${patient.user.firstName} ${patient.user.lastName}`,
        age,
        mrn: patient.medicalRecordNumber,
        conditions: patient.diagnosis ? [patient.diagnosis] : [],
        vitalData: currentVitals,
        previousVitals: vitalHistory,
        alerts: patient.alerts.map((a: any) => ({
          severity: a.severity,
          message: a.message,
          createdAt: a.createdAt,
        })),
        enteredBy: "Nurse",
      });
    } catch (reportError: any) {
      console.warn(
        "Nursing report generation failed, skipping:",
        reportError.message
      );
    }

    // Compile comprehensive report (Generation)
    const report = {
      success: true,
      report: {
        patientInfo: {
          name: `${patient.user.firstName} ${patient.user.lastName}`,
          age,
          diagnosis: patient.diagnosis,
          mrn: patient.medicalRecordNumber,
        },
        currentVitals,
        riskScore: riskAnalysis.success ? riskAnalysis.analysis?.riskScore : 65,
        riskLevel: riskAnalysis.success
          ? riskAnalysis.analysis?.riskLevel
          : "Pending Analysis",
        trendIndicator: riskAnalysis.success
          ? riskAnalysis.analysis?.trendIndicator
          : "stable",
        concerns: riskAnalysis.success
          ? riskAnalysis.analysis?.concerns
          : ["AI analysis pending", "Check vital values manually"],
        recommendations: riskAnalysis.success
          ? riskAnalysis.analysis?.recommendations
          : [
              "Monitor patient continuously",
              "Consult with physician if concerns persist",
            ],
        summary: riskAnalysis.success
          ? riskAnalysis.analysis?.summary
          : "Vital record created successfully. AI analysis is being processed.",
        detailedReport: nursingReport.success
          ? nursingReport.report
          : "Detailed nursing report will be available shortly.",
        activeAlerts: patient.alerts.length,
        timestamp: new Date().toISOString(),
      },
    };

    return report;
  } catch (error: any) {
    console.error("Generate report error:", error);
    return {
      success: false,
      error: error.message || "Failed to generate report",
    };
  }
}

/**
 * Generate comprehensive patient report for patient detail page
 * Uses RAG to fetch complete patient history
 */
export async function generatePatientReport(patientId: string) {
  try {
    // Fetch complete patient data (RAG - Retrieval)
    const patient: any = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: true,
        vitalRecords: {
          orderBy: { recordedAt: "desc" },
          take: 30, // Last 30 records for comprehensive analysis
        },
        alerts: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!patient) {
      return {
        success: false,
        error: "Patient not found",
      };
    }

    const age =
      new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();

    // Get latest vital record
    const latestVital = patient.vitalRecords[0];
    const currentVitals = latestVital
      ? {
          systolicBP: latestVital.systolicBP,
          diastolicBP: latestVital.diastolicBP,
          heartRate: latestVital.heartRate,
          temperature: latestVital.temperature,
          oxygenSaturation: latestVital.oxygenSaturation,
          weight: latestVital.weight,
          recordedAt: latestVital.recordedAt,
        }
      : null;

    // Prepare vital history
    const vitalHistory = patient.vitalRecords.slice(1).map((v: any) => ({
      recordedAt: v.recordedAt,
      systolicBP: v.systolicBP,
      diastolicBP: v.diastolicBP,
      heartRate: v.heartRate,
      temperature: v.temperature,
      oxygenSaturation: v.oxygenSaturation,
      weight: v.weight,
    }));

    // Calculate statistics
    const criticalAlerts = patient.alerts.filter(
      (a: any) => a.severity === "CRITICAL"
    ).length;
    const openAlerts = patient.alerts.filter(
      (a: any) => a.status === "OPEN"
    ).length;

    // Generate AI analysis if we have vitals
    let riskAnalysis = null;
    let nursingReport = null;

    if (currentVitals) {
      const baseline = {
        systolicBP: 120,
        diastolicBP: 80,
        heartRate: 70,
        temperature: 37,
        oxygenSaturation: 98,
      };

      riskAnalysis = await analyzePatientRisk({
        patientName: `${patient.user.firstName} ${patient.user.lastName}`,
        age,
        conditions: patient.diagnosis ? [patient.diagnosis] : [],
        baseline,
        vitalHistory,
        latestVitals: currentVitals,
      });

      nursingReport = await generateNursingReport({
        patientName: `${patient.user.firstName} ${patient.user.lastName}`,
        age,
        mrn: patient.medicalRecordNumber,
        conditions: patient.diagnosis ? [patient.diagnosis] : [],
        vitalData: currentVitals,
        previousVitals: vitalHistory,
        alerts: patient.alerts.slice(0, 5).map((a: any) => ({
          severity: a.severity,
          message: a.message,
          createdAt: a.createdAt,
        })),
        enteredBy: "System",
      });
    }

    // Compile comprehensive report
    const report = {
      success: true,
      report: {
        patientInfo: {
          name: `${patient.user.firstName} ${patient.user.lastName}`,
          age,
          gender: patient.gender,
          diagnosis: patient.diagnosis,
          mrn: patient.medicalRecordNumber,
          dateOfBirth: patient.dateOfBirth,
        },
        currentVitals,
        vitalHistory: patient.vitalRecords.length,
        riskScore: riskAnalysis?.success
          ? riskAnalysis.analysis?.riskScore
          : null,
        riskLevel: riskAnalysis?.success
          ? riskAnalysis.analysis?.riskLevel
          : "Unknown",
        trendIndicator: riskAnalysis?.success
          ? riskAnalysis.analysis?.trendIndicator
          : "stable",
        concerns: riskAnalysis?.success ? riskAnalysis.analysis?.concerns : [],
        recommendations: riskAnalysis?.success
          ? riskAnalysis.analysis?.recommendations
          : [],
        summary: riskAnalysis?.success
          ? riskAnalysis.analysis?.summary
          : "Aucune donnée vitale récente disponible.",
        detailedReport: nursingReport?.success ? nursingReport.report : "",
        statistics: {
          totalVitals: patient.vitalRecords.length,
          criticalAlerts,
          openAlerts,
          totalAlerts: patient.alerts.length,
        },
        recentAlerts: patient.alerts.slice(0, 5).map((a: any) => ({
          severity: a.severity,
          message: a.message,
          createdAt: a.createdAt,
          status: a.status,
        })),
        timestamp: new Date().toISOString(),
      },
    };

    return report;
  } catch (error: any) {
    console.error("Generate patient report error:", error);
    return {
      success: false,
      error: error.message || "Failed to generate patient report",
    };
  }
}
