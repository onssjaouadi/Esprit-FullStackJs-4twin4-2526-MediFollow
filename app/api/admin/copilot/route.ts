import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  getGlobalHospitalRisk,
  getAllPredictiveAlerts,
  getAllAIRecommendations,
  detectAnomalies,
} from "@/lib/actions/admin.actions";

interface AdminCopilotResult {
  success: boolean;
  result?: {
    answer: string;
    navigationPath?: string;
    suggestions?: string[];
  };
  error?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const query = typeof body?.query === "string" ? body.query : "";

    if (!query.trim()) {
      return NextResponse.json(
        { success: false, error: "Query is required" },
        { status: 400 }
      );
    }

    const [
      totalUsers,
      totalDoctors,
      totalPatients,
      pendingPatients,
      totalServices,
      activeServices,
      totalAlerts,
      criticalAlerts,
      openAlerts,
      resolvedAlerts,
      services,
      riskData,
      predictiveData,
      recommendationsData,
      anomaliesData,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "DOCTOR" } }),
      prisma.user.count({ where: { role: "PATIENT" } }),
      prisma.patient.count({ where: { isActive: false } }),
      prisma.service.count(),
      prisma.service.count({ where: { isActive: true } }),
      prisma.alert.count(),
      prisma.alert.count({ where: { severity: "CRITICAL" } }),
      prisma.alert.count({ where: { status: "OPEN" } }),
      prisma.alert.count({ where: { status: "RESOLVED" } }),
      prisma.service.findMany({
        select: {
          serviceName: true,
          isActive: true,
          patientIds: true,
          teamIds: true,
        },
        orderBy: { serviceName: "asc" },
      }),
      getGlobalHospitalRisk(),
      getAllPredictiveAlerts(),
      getAllAIRecommendations(),
      detectAnomalies(),
    ]);

    const assignedPatientIds = new Set(
      services.flatMap((service) => service.patientIds || [])
    );
    const assignedDoctorIds = new Set(
      services.flatMap((service) => service.teamIds || [])
    );
    const unassignedPatients = Math.max(totalPatients - assignedPatientIds.size, 0);
    const unassignedDoctors = Math.max(totalDoctors - assignedDoctorIds.size, 0);

    const lowerQuery = query.toLowerCase();
    const answer = (() => {
      // AI Risk Intelligence queries
      if (
        lowerQuery.includes("risk") &&
        (lowerQuery.includes("score") || lowerQuery.includes("average") || lowerQuery.includes("global"))
      ) {
        if (riskData.success) {
          const data = riskData.data;
          return `Hospital risk overview: Average risk score is ${data.averageRiskScore}/100, with ${data.criticalPatients} critical risk patients, ${data.highRiskPatients} high risk patients, and ${data.mediumRiskPatients} medium risk patients.`;
        }
        return "Unable to fetch risk data at this time.";
      }

      if (lowerQuery.includes("critical risk") || lowerQuery.includes("high risk patient")) {
        if (riskData.success) {
          const critical = riskData.data.criticalPatients;
          const high = riskData.data.highRiskPatients;
          return `There are ${critical} patients with critical risk and ${high} with high risk that need immediate attention.`;
        }
        return "Unable to fetch risk assessment data.";
      }

      // Predictive Alerts queries
      if (
        lowerQuery.includes("prediction") ||
        lowerQuery.includes("predict") ||
        (lowerQuery.includes("alert") && lowerQuery.includes("future"))
      ) {
        if (predictiveData.success) {
          const data = predictiveData.data;
          const highProb = data.highProbabilityPredictions.length;
          return `AI has generated ${data.totalPredictions} predictions, with ${highProb} high-probability alerts that may occur soon.`;
        }
        return "Unable to fetch predictive data.";
      }

      // AI Recommendations queries
      if (
        lowerQuery.includes("recommendation") ||
        lowerQuery.includes("action") ||
        lowerQuery.includes("urgent")
      ) {
        if (recommendationsData.success) {
          const data = recommendationsData.data;
          const urgent = data.urgentRecommendations.length;
          return `AI recommends ${data.totalPatientsWithRecommendations} patients need attention, with ${urgent} requiring urgent actions.`;
        }
        return "Unable to fetch recommendation data.";
      }

      // Anomaly Detection queries
      if (
        lowerQuery.includes("anomaly") ||
        lowerQuery.includes("suspicious") ||
        lowerQuery.includes("unusual")
      ) {
        if (anomaliesData.success) {
          const data = anomaliesData.data;
          return `Anomaly detection found ${data.totalAnomalies} suspicious activities, including ${data.anomalies.filter(a => a.severity === "HIGH").length} high-severity issues.`;
        }
        return "Unable to fetch anomaly data.";
      }

      // Critical patients query
      if (
        lowerQuery.includes("critical patient") ||
        lowerQuery.includes("most dangerous") ||
        lowerQuery.includes("highest risk")
      ) {
        if (riskData.success && riskData.data.topRiskPatients.length > 0) {
          const topPatients = riskData.data.topRiskPatients.slice(0, 3);
          const names = topPatients.map(p => p.patientName).join(", ");
          return `The highest risk patients are: ${names}. These patients have risk scores above 70 and need immediate monitoring.`;
        }
        return "Unable to identify critical patients at this time.";
      }

      // Existing queries...
      if (
        lowerQuery.includes("pending patient") ||
        lowerQuery.includes("patient pending") ||
        lowerQuery.includes("waiting approval") ||
        lowerQuery.includes("approval")
      ) {
        return `There are ${pendingPatients} pending patient${pendingPatients === 1 ? "" : "s"} waiting for approval.`;
      }
      if (
        lowerQuery.includes("doctor") &&
        (lowerQuery.includes("how many") ||
          lowerQuery.includes("count") ||
          lowerQuery.includes("total") ||
          lowerQuery.includes("number"))
      ) {
        return `There are ${totalDoctors} doctor${totalDoctors === 1 ? "" : "s"} in the system, with ${unassignedDoctors} not currently linked to a service.`;
      }
      if (
        lowerQuery.includes("service") &&
        (lowerQuery.includes("how many") ||
          lowerQuery.includes("count") ||
          lowerQuery.includes("total") ||
          lowerQuery.includes("number"))
      ) {
        return `There are ${totalServices} service${totalServices === 1 ? "" : "s"}, and ${activeServices} are active.`;
      }
      if (lowerQuery.includes("alert") || lowerQuery.includes("incident")) {
        return `There are ${totalAlerts} total alerts, ${openAlerts} open, ${criticalAlerts} critical, and ${resolvedAlerts} resolved.`;
      }
      if (
        lowerQuery.includes("patient") &&
        (lowerQuery.includes("unassigned") ||
          lowerQuery.includes("not linked") ||
          lowerQuery.includes("without service"))
      ) {
        return `${unassignedPatients} patient${unassignedPatients === 1 ? "" : "s"} are not linked to a service.`;
      }
      if (
        lowerQuery.includes("doctor") &&
        (lowerQuery.includes("unassigned") ||
          lowerQuery.includes("not linked") ||
          lowerQuery.includes("without service"))
      ) {
        return `${unassignedDoctors} doctor${unassignedDoctors === 1 ? "" : "s"} are not linked to a service.`;
      }
      if (
        lowerQuery.includes("user") &&
        (lowerQuery.includes("how many") ||
          lowerQuery.includes("count") ||
          lowerQuery.includes("total") ||
          lowerQuery.includes("number"))
      ) {
        return `There are ${totalUsers} users: ${totalPatients} patients and ${totalDoctors} doctors.`;
      }

      // AI-enhanced summary
      const aiSummary = [];
      if (riskData.success && riskData.data.averageRiskScore > 50) {
        aiSummary.push(`${riskData.data.criticalPatients} critical risk patients`);
      }
      if (predictiveData.success && predictiveData.data.highProbabilityPredictions.length > 0) {
        aiSummary.push(`${predictiveData.data.highProbabilityPredictions.length} high-probability predictions`);
      }
      if (recommendationsData.success && recommendationsData.data.urgentRecommendations.length > 0) {
        aiSummary.push(`${recommendationsData.data.urgentRecommendations.length} urgent recommendations`);
      }

      const aiPart = aiSummary.length > 0 ? ` AI insights: ${aiSummary.join(", ")}.` : "";

      return `Here is the current admin summary: ${pendingPatients} pending patients, ${totalPatients} total patients, ${totalDoctors} doctors, ${activeServices} active services, ${openAlerts} open alerts, and ${criticalAlerts} critical alerts.${aiPart}`;
    })();

    const result: AdminCopilotResult = {
      success: true,
      result: {
        answer,
        suggestions: [
          ...(riskData.success && riskData.data.criticalPatients > 0
            ? [`${riskData.data.criticalPatients} critical risk patient${riskData.data.criticalPatients === 1 ? "" : "s"} need immediate attention`]
            : []),
          ...(predictiveData.success && predictiveData.data.highProbabilityPredictions.length > 0
            ? [`${predictiveData.data.highProbabilityPredictions.length} high-probability prediction${predictiveData.data.highProbabilityPredictions.length === 1 ? "" : "s"} to review`]
            : []),
          ...(recommendationsData.success && recommendationsData.data.urgentRecommendations.length > 0
            ? [`${recommendationsData.data.urgentRecommendations.length} urgent recommendation${recommendationsData.data.urgentRecommendations.length === 1 ? "" : "s"} to implement`]
            : []),
          `${pendingPatients} pending patient${pendingPatients === 1 ? "" : "s"} need review`,
          `${unassignedPatients} patient${unassignedPatients === 1 ? "" : "s"} are not linked to a service`,
          `${openAlerts} open alert${openAlerts === 1 ? "" : "s"} need monitoring`,
        ].slice(0, 6), // Limit to 6 suggestions
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Copilot route failed",
      },
      { status: 500 }
    );
  }
}
