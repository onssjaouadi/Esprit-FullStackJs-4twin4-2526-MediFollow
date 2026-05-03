"use server";

import prisma from "@/lib/prisma";

/**
 * Generate comprehensive reports for a doctor based on their specialty
 */

export async function getDoctorPatientsSummaryReport(doctorUserId: string) {
  try {
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorUserId },
      select: { specialty: true },
    });

    if (!doctorProfile?.specialty) {
      return { success: false, error: "Spécialité non définie" };
    }

    const patients = await prisma.patient.findMany({
      where: {
        diagnosis: { contains: doctorProfile.specialty, mode: "insensitive" },
        isActive: true,
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        vitalRecords: { orderBy: { recordedAt: "desc" }, take: 1 },
        alerts: { where: { status: "OPEN" } },
        symptoms: { orderBy: { occurredAt: "desc" }, take: 3 },
      },
    });

    return {
      success: true,
      report: {
        title: `Rapport Patients - ${doctorProfile.specialty}`,
        type: "PATIENTS",
        generatedAt: new Date(),
        specialty: doctorProfile.specialty,
        totalPatients: patients.length,
        activeAlerts: patients.reduce(
          (sum, p) => sum + (p.alerts?.length || 0),
          0
        ),
        data: patients,
      },
    };
  } catch (error) {
    console.error("Error generating patients report:", error);
    return { success: false, error: "Erreur lors de la génération du rapport" };
  }
}

export async function getDoctorAlertsReport(doctorUserId: string) {
  try {
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorUserId },
      select: { specialty: true },
    });

    if (!doctorProfile?.specialty) {
      return { success: false, error: "Spécialité non définie" };
    }

    const alerts = await prisma.alert.findMany({
      where: {
        patient: {
          diagnosis: { contains: doctorProfile.specialty, mode: "insensitive" },
        },
      },
      include: {
        patient: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalAlerts = alerts.length;
    const openAlerts = alerts.filter((a) => a.status === "OPEN").length;
    const criticalAlerts = alerts.filter(
      (a) => a.severity === "CRITICAL"
    ).length;
    const acknowledgedAlerts = alerts.filter(
      (a) => a.status === "ACKNOWLEDGED"
    ).length;
    const resolvedAlerts = alerts.filter((a) => a.status === "RESOLVED").length;

    const alertsByType: Record<string, number> = {};
    alerts.forEach((alert) => {
      alertsByType[alert.alertType] = (alertsByType[alert.alertType] || 0) + 1;
    });

    const alertsBySeverity = {
      CRITICAL: criticalAlerts,
      HIGH: alerts.filter((a) => a.severity === "HIGH").length,
      MEDIUM: alerts.filter((a) => a.severity === "MEDIUM").length,
      LOW: alerts.filter((a) => a.severity === "LOW").length,
    };

    return {
      success: true,
      report: {
        title: `Rapport Alertes - ${doctorProfile.specialty}`,
        type: "ALERTS",
        generatedAt: new Date(),
        specialty: doctorProfile.specialty,
        summary: {
          total: totalAlerts,
          open: openAlerts,
          critical: criticalAlerts,
          acknowledged: acknowledgedAlerts,
          resolved: resolvedAlerts,
        },
        alertsBySeverity,
        alertsByType,
        recentAlerts: alerts.slice(0, 20),
      },
    };
  } catch (error) {
    console.error("Error generating alerts report:", error);
    return { success: false, error: "Erreur lors de la génération du rapport" };
  }
}

export async function getDoctorAnalysesReport(doctorUserId: string) {
  try {
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorUserId },
      select: { specialty: true },
    });

    if (!doctorProfile?.specialty) {
      return { success: false, error: "Spécialité non définie" };
    }

    const analyses = await prisma.medicalAnalysis.findMany({
      where: {
        patient: {
          diagnosis: { contains: doctorProfile.specialty, mode: "insensitive" },
        },
      },
      include: {
        patient: { include: { user: true } },
      },
      orderBy: { analysisDate: "desc" },
    });

    const totalAnalyses = analyses.length;
    const normalAnalyses = analyses.filter((a) => !a.isAbnormal).length;
    const abnormalAnalyses = analyses.filter((a) => a.isAbnormal).length;
    const pendingAnalyses = analyses.filter(
      (a) => a.status === "PENDING"
    ).length;
    const completedAnalyses = analyses.filter(
      (a) => a.status === "COMPLETED"
    ).length;

    const analysesByType: Record<string, number> = {};
    analyses.forEach((analysis) => {
      analysesByType[analysis.analysisType] =
        (analysesByType[analysis.analysisType] || 0) + 1;
    });

    return {
      success: true,
      report: {
        title: `Rapport Analyses Médicales - ${doctorProfile.specialty}`,
        type: "ANALYSES",
        generatedAt: new Date(),
        specialty: doctorProfile.specialty,
        summary: {
          total: totalAnalyses,
          normal: normalAnalyses,
          abnormal: abnormalAnalyses,
          pending: pendingAnalyses,
          completed: completedAnalyses,
        },
        analysesByType,
        recentAnalyses: analyses.slice(0, 20),
      },
    };
  } catch (error) {
    console.error("Error generating analyses report:", error);
    return { success: false, error: "Erreur lors de la génération du rapport" };
  }
}

export async function getDoctorVitalsReport(doctorUserId: string) {
  try {
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorUserId },
      select: { specialty: true },
    });

    if (!doctorProfile?.specialty) {
      return { success: false, error: "Spécialité non définie" };
    }

    const vitals = await prisma.vitalRecord.findMany({
      where: {
        patient: {
          diagnosis: { contains: doctorProfile.specialty, mode: "insensitive" },
        },
      },
      include: {
        patient: { include: { user: true } },
      },
      orderBy: { recordedAt: "desc" },
    });

    const totalRecords = vitals.length;

    // Calculate averages
    const avgHeartRate =
      vitals
        .filter((v) => v.heartRate)
        .reduce((sum, v) => sum + v.heartRate!, 0) /
      Math.max(vitals.filter((v) => v.heartRate).length, 1);

    const avgSystolic =
      vitals
        .filter((v) => v.systolicBP)
        .reduce((sum, v) => sum + v.systolicBP!, 0) /
      Math.max(vitals.filter((v) => v.systolicBP).length, 1);

    const avgDiastolic =
      vitals
        .filter((v) => v.diastolicBP)
        .reduce((sum, v) => sum + v.diastolicBP!, 0) /
      Math.max(vitals.filter((v) => v.diastolicBP).length, 1);

    const avgTemperature =
      vitals
        .filter((v) => v.temperature)
        .reduce((sum, v) => sum + v.temperature!, 0) /
      Math.max(vitals.filter((v) => v.temperature).length, 1);

    const avgOxygenSaturation =
      vitals
        .filter((v) => v.oxygenSaturation)
        .reduce((sum, v) => sum + v.oxygenSaturation!, 0) /
      Math.max(vitals.filter((v) => v.oxygenSaturation).length, 1);

    return {
      success: true,
      report: {
        title: `Rapport Signes Vitaux - ${doctorProfile.specialty}`,
        type: "VITALS",
        generatedAt: new Date(),
        specialty: doctorProfile.specialty,
        summary: {
          totalRecords,
          measurements: {
            avgHeartRate: Math.round(avgHeartRate * 10) / 10,
            avgSystolic: Math.round(avgSystolic * 10) / 10,
            avgDiastolic: Math.round(avgDiastolic * 10) / 10,
            avgTemperature: Math.round(avgTemperature * 10) / 10,
            avgOxygenSaturation: Math.round(avgOxygenSaturation * 10) / 10,
          },
        },
        recentVitals: vitals.slice(0, 20),
      },
    };
  } catch (error) {
    console.error("Error generating vitals report:", error);
    return { success: false, error: "Erreur lors de la génération du rapport" };
  }
}

export async function getDoctorPracticeStatisticsReport(doctorUserId: string) {
  try {
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorUserId },
      select: { specialty: true },
    });

    if (!doctorProfile?.specialty) {
      return { success: false, error: "Spécialité non définie" };
    }

    // Count patients
    const totalPatients = await prisma.patient.count({
      where: {
        diagnosis: { contains: doctorProfile.specialty, mode: "insensitive" },
        isActive: true,
      },
    });

    // Count alerts
    const totalAlerts = await prisma.alert.count({
      where: {
        patient: {
          diagnosis: { contains: doctorProfile.specialty, mode: "insensitive" },
        },
      },
    });

    const openAlerts = await prisma.alert.count({
      where: {
        patient: {
          diagnosis: { contains: doctorProfile.specialty, mode: "insensitive" },
        },
        status: "OPEN",
      },
    });

    const resolvedAlerts = await prisma.alert.count({
      where: {
        patient: {
          diagnosis: { contains: doctorProfile.specialty, mode: "insensitive" },
        },
        status: "RESOLVED",
      },
    });

    // Count analyses
    const totalAnalyses = await prisma.medicalAnalysis.count({
      where: {
        patient: {
          diagnosis: { contains: doctorProfile.specialty, mode: "insensitive" },
        },
      },
    });

    const abnormalAnalyses = await prisma.medicalAnalysis.count({
      where: {
        patient: {
          diagnosis: { contains: doctorProfile.specialty, mode: "insensitive" },
        },
        isAbnormal: true,
      },
    });

    // Count vital records
    const totalVitalRecords = await prisma.vitalRecord.count({
      where: {
        patient: {
          diagnosis: { contains: doctorProfile.specialty, mode: "insensitive" },
        },
      },
    });

    // Count symptoms
    const totalSymptoms = await prisma.symptom.count({
      where: {
        patient: {
          diagnosis: { contains: doctorProfile.specialty, mode: "insensitive" },
        },
      },
    });

    return {
      success: true,
      report: {
        title: `Rapport Statistiques Pratique - ${doctorProfile.specialty}`,
        type: "PRACTICE_STATISTICS",
        generatedAt: new Date(),
        specialty: doctorProfile.specialty,
        statistics: {
          patients: {
            total: totalPatients,
          },
          alerts: {
            total: totalAlerts,
            open: openAlerts,
            resolved: resolvedAlerts,
            resolutionRate:
              totalAlerts > 0
                ? ((resolvedAlerts / totalAlerts) * 100).toFixed(1)
                : "0",
          },
          analyses: {
            total: totalAnalyses,
            abnormal: abnormalAnalyses,
            abnormalRate:
              totalAnalyses > 0
                ? ((abnormalAnalyses / totalAnalyses) * 100).toFixed(1)
                : "0",
          },
          monitoring: {
            vitalRecords: totalVitalRecords,
            symptoms: totalSymptoms,
          },
        },
      },
    };
  } catch (error) {
    console.error("Error generating practice statistics report:", error);
    return { success: false, error: "Erreur lors de la génération du rapport" };
  }
}
