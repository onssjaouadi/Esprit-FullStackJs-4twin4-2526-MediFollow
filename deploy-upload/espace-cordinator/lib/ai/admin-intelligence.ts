import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { AlertSeverity, AlertStatus, AlertType } from "@/types/medifollow.types";
import { notifyAlert, sendAdminAlertSMS } from "@/lib/actions/notification.actions";

type NextBestAction = {
  title: string;
  rationale: string;
  confidence: number;
};

type CopilotResponse = {
  answer: string;
  navigationPath?: string;
  suggestions?: string[];
  data?: Record<string, unknown>;
};

const AI_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview";

const NON_DUMMY_ALERT_WHERE = {
  NOT: {
    AND: [
      { alertType: AlertType.SYSTEM },
      { severity: AlertSeverity.LOW },
      { message: { contains: "collection 'alerts'", mode: "insensitive" as const } },
    ],
  },
} as const;

function clampConfidence(value: number): number {
  return Math.max(0.35, Math.min(0.98, Number(value.toFixed(2))));
}

async function askAzureJson(systemPrompt: string, userPrompt: string, maxTokens = 1200): Promise<any | null> {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

  if (!apiKey || !endpoint || !deployment) return null;

  const url = `${endpoint.replace(/\/$/, "")}/openai/deployments/${deployment}/chat/completions?api-version=${AI_API_VERSION}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.15,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) return null;

  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function buildFallbackActions(alert: any): NextBestAction[] {
  const severity = String(alert?.severity || "MEDIUM");
  const status = String(alert?.status || "OPEN");
  const message = String(alert?.message || "").toLowerCase();

  const actions: NextBestAction[] = [];

  if (status === "OPEN") {
    actions.push({
      title: "Acknowledge alert and assign owner",
      rationale: "Immediate ownership shortens response time and prevents alert drift.",
      confidence: severity === "CRITICAL" ? 0.95 : 0.88,
    });
  } else {
    actions.push({
      title: "Review latest clinical context",
      rationale: "Status changed, but a quick clinical review confirms no hidden deterioration.",
      confidence: 0.81,
    });
  }

  if (message.includes("oxygen") || message.includes("saturation") || message.includes("spo2")) {
    actions.push({
      title: "Request immediate pulse-ox recheck",
      rationale: "Oxygen fluctuations can escalate quickly and should be confirmed within minutes.",
      confidence: 0.9,
    });
  } else if (message.includes("cardiaque") || message.includes("heart") || message.includes("bpm")) {
    actions.push({
      title: "Repeat heart rate in 10 minutes",
      rationale: "Short-interval retest helps separate transient spikes from sustained tachycardia.",
      confidence: 0.86,
    });
  } else if (message.includes("pression") || message.includes("bp") || message.includes("systolic")) {
    actions.push({
      title: "Schedule blood pressure triage",
      rationale: "Blood pressure anomalies require trend confirmation before escalation decisions.",
      confidence: 0.87,
    });
  } else {
    actions.push({
      title: "Contact responsible care team",
      rationale: "Shared awareness across care staff reduces missed interventions.",
      confidence: 0.8,
    });
  }

  actions.push({
    title: "Set follow-up check in 30 minutes",
    rationale: "A scheduled follow-up creates closure and reduces unresolved critical queues.",
    confidence: severity === "CRITICAL" ? 0.92 : 0.78,
  });

  return actions.slice(0, 3).map((a) => ({ ...a, confidence: clampConfidence(a.confidence) }));
}

export async function getNextBestActionsForAlert(alertId: string): Promise<{
  success: boolean;
  actions?: NextBestAction[];
  summary?: string;
  error?: string;
}> {
  try {
    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
      include: {
        patient: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });

    if (!alert) return { success: false, error: "Alert not found" };

    const recentVitals = await prisma.vitalRecord.findMany({
      where: { patientId: alert.patientId },
      orderBy: { recordedAt: "desc" },
      take: 5,
      select: {
        recordedAt: true,
        systolicBP: true,
        diastolicBP: true,
        heartRate: true,
        oxygenSaturation: true,
        temperature: true,
      },
    });

    const fallback = buildFallbackActions(alert);

    const aiPayload = await askAzureJson(
      "You are a clinical triage copilot. Return exactly 3 practical next actions for an alert with confidence between 0 and 1.",
      `Alert:\n${JSON.stringify(
        {
          id: alert.id,
          alertType: alert.alertType,
          severity: alert.severity,
          status: alert.status,
          message: alert.message,
          patientName: `${alert.patient.user.firstName} ${alert.patient.user.lastName}`.trim(),
          data: alert.data,
        },
        null,
        2
      )}\n\nRecent vitals:\n${JSON.stringify(recentVitals, null, 2)}\n\nRespond with JSON: { "summary": string, "actions": [{"title": string, "rationale": string, "confidence": number}] }`
    );

    if (!aiPayload || !Array.isArray(aiPayload.actions)) {
      return {
        success: true,
        actions: fallback,
        summary: "Fallback recommendations generated from alert severity, status, and vital context.",
      };
    }

    const actions = aiPayload.actions
      .map((item: any) => ({
        title: String(item?.title || "Suggested action"),
        rationale: String(item?.rationale || "No rationale provided."),
        confidence: clampConfidence(Number(item?.confidence ?? 0.7)),
      }))
      .slice(0, 3);

    if (actions.length === 0) {
      return { success: true, actions: fallback, summary: "Fallback recommendations generated." };
    }

    while (actions.length < 3) {
      actions.push(fallback[actions.length]);
    }

    return {
      success: true,
      actions,
      summary: String(aiPayload.summary || "AI recommendations generated based on current alert context."),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate next best actions",
    };
  }
}

export async function runAdminCopilot(query: string): Promise<{ success: boolean; result?: CopilotResponse; error?: string }> {
  try {
    const q = query.trim().toLowerCase();
    if (!q) return { success: false, error: "Empty query" };

    if (
      q.includes("user management") ||
      q.includes("manage users") ||
      q.includes("users overview") ||
      q.includes("gestion des utilisateurs") ||
      q === "users" ||
      q === "user"
    ) {
      const users = await prisma.user.findMany({
        select: { role: true, isActive: true },
      });

      const totalUsers = users.length;
      const activeUsers = users.filter((u) => u.isActive).length;
      const inactiveUsers = totalUsers - activeUsers;
      const roleCounts = users.reduce<Record<string, number>>((acc, u) => {
        const role = String(u.role || "UNKNOWN");
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {});

      const roleSummary = Object.entries(roleCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([role, count]) => `${role}: ${count}`);

      return {
        success: true,
        result: {
          answer: `User management summary: ${totalUsers} users total, ${activeUsers} active, ${inactiveUsers} inactive.`,
          navigationPath: "/dashboard/admin/users",
          suggestions: roleSummary.length
            ? roleSummary
            : ["Open the users page", "Filter by role", "Check inactive accounts"],
          data: { totalUsers, activeUsers, inactiveUsers, roleCounts },
        },
      };
    }

    if (
      q.includes("search user") ||
      q.includes("find user") ||
      q.includes("user details") ||
      q.includes("specific user") ||
      q.includes("lookup user")
    ) {
      const searchTerm =
        (query.match(/"([^"]+)"/)?.[1] ||
          query.match(/'([^']+)'/)?.[1] ||
          query
            .replace(/.*(?:search|find|lookup)\s+(?:for\s+)?(?:specific\s+)?(?:user\s+details\s+for\s+|user\s+)?/i, "")
            .trim()) ?? "";

      if (!searchTerm) {
        return {
          success: true,
          result: {
            answer: "Please provide a user name or email to search, for example: search user \"john\".",
            navigationPath: "/dashboard/admin/users",
            suggestions: ["search user \"john\"", "find user jane@hospital.com", "user details for Marie"],
          },
        };
      }

      const matches = await prisma.user.findMany({
        where: {
          OR: [
            { firstName: { contains: searchTerm, mode: "insensitive" } },
            { lastName: { contains: searchTerm, mode: "insensitive" } },
            { email: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        select: { id: true, firstName: true, lastName: true, email: true, role: true, isActive: true },
        take: 5,
        orderBy: { createdAt: "desc" },
      });

      if (!matches.length) {
        return {
          success: true,
          result: {
            answer: `No users found for \"${searchTerm}\".`,
            navigationPath: "/dashboard/admin/users",
            suggestions: ["Try a shorter keyword", "Search by email", "Open user management"],
            data: { searchTerm, matches: [] },
          },
        };
      }

      const suggestions = matches.map(
        (u) => `${u.firstName} ${u.lastName} (${u.role}, ${u.isActive ? "active" : "inactive"})`
      );

      return {
        success: true,
        result: {
          answer: `Found ${matches.length} user(s) for \"${searchTerm}\".`,
          navigationPath: "/dashboard/admin/users",
          suggestions,
          data: {
            searchTerm,
            matches: matches.map((u) => ({
              id: u.id,
              name: `${u.firstName} ${u.lastName}`.trim(),
              email: u.email,
              role: u.role,
              isActive: u.isActive,
            })),
          },
        },
      };
    }

    if (
      q.includes("access permissions") ||
      q.includes("user permissions") ||
      q.includes("review permissions") ||
      q.includes("roles and permissions") ||
      (q.includes("permissions") && q.includes("user"))
    ) {
      const users = await prisma.user.findMany({
        select: { role: true, isActive: true },
      });

      const roleCounts = users.reduce<Record<string, number>>((acc, u) => {
        const role = String(u.role || "UNKNOWN");
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {});

      const byRole = Object.entries(roleCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([role, count]) => `${role}: ${count}`);

      return {
        success: true,
        result: {
          answer:
            "Access review summary generated. Check role distribution and validate least-privilege access for ADMIN, COORDINATOR, DOCTOR, NURSE, and PATIENT accounts.",
          navigationPath: "/dashboard/admin/settings",
          suggestions: byRole.length ? byRole.slice(0, 5) : ["Open settings", "Review role assignments", "Audit inactive accounts"],
          data: { roleCounts, totalUsers: users.length },
        },
      };
    }

    if (
      q.includes("unresolved alerts") ||
      q.includes("open alerts") ||
      q.includes("unrealized alerts") ||
      q.includes("alerts unresolved")
    ) {
      const [openAlerts, criticalOpen, activePatients] = await Promise.all([
        prisma.alert.count({ where: { ...NON_DUMMY_ALERT_WHERE, status: AlertStatus.OPEN } }),
        prisma.alert.count({ where: { ...NON_DUMMY_ALERT_WHERE, severity: AlertSeverity.CRITICAL, status: AlertStatus.OPEN } }),
        prisma.patient.count({ where: { isActive: true } }),
      ]);

      return {
        success: true,
        result: {
          answer: `There are ${openAlerts} open alerts, including ${criticalOpen} critical ones, for ${activePatients} active patients. Immediate attention is recommended for critical alerts.`,
          navigationPath: "/dashboard/admin/alerts",
          suggestions: [
            "Review critical alerts first.",
            "Ensure patient safety protocols are followed.",
            "Assign staff to address open alerts.",
          ],
          data: {
            openAlerts,
            criticalOpenAlerts: criticalOpen,
            activePatients,
          },
        },
      };
    }

    if (q.includes("open alerts") || q.includes("go to alerts") || q.includes("alerts page")) {
      return {
        success: true,
        result: {
          answer: "Opening alerts supervision.",
          navigationPath: "/dashboard/admin/alerts",
          suggestions: ["Show unresolved critical alerts today", "Open analytics"],
        },
      };
    }

    if (
      (q.includes("critical") && q.includes("today") && (q.includes("unresolved") || q.includes("open"))) ||
      q.includes("unresolved critical alerts today")
    ) {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);

      const count = await prisma.alert.count({
        where: {
          ...NON_DUMMY_ALERT_WHERE,
          severity: AlertSeverity.CRITICAL,
          status: { in: [AlertStatus.OPEN, AlertStatus.ACKNOWLEDGED] },
          createdAt: { gte: start, lte: end },
        },
      });

      return {
        success: true,
        result: {
          answer: `There are ${count} unresolved critical alerts today.`,
          navigationPath: "/dashboard/admin/alerts",
          suggestions: ["Filter by CRITICAL + OPEN", "Review AI next actions for top 3"],
          data: { unresolvedCriticalToday: count },
        },
      };
    }

    if (
      (q.includes("repeated") || q.includes("repeat") || q.includes("multiple")) &&
      (q.includes("blood pressure") || q.includes("high bp") || q.includes("bp"))
    ) {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const patients = await prisma.patient.findMany({
        where: { isActive: true },
        select: {
          userId: true,
          vitalRecords: {
            where: { createdAt: { gte: since } },
            select: { systolicBP: true, diastolicBP: true },
            take: 20,
            orderBy: { createdAt: "desc" },
          },
        },
      });

      const userIds = Array.from(new Set(patients.map((p) => p.userId).filter(Boolean)));
      const users = userIds.length
        ? await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, firstName: true, lastName: true },
          })
        : [];
      const userMap = new Map(users.map((u) => [u.id, u]));

      const highBpPatients = patients
        .map((p) => {
          const highReadings = p.vitalRecords.filter((r: any) => (r.systolicBP ?? 0) >= 140 || (r.diastolicBP ?? 0) >= 90).length;
          const user = userMap.get(p.userId);
          const name = user ? `${user.firstName} ${user.lastName}`.trim() : "Unknown patient";
          return { name, highReadings };
        })
        .filter((p) => p.highReadings >= 2)
        .sort((a, b) => b.highReadings - a.highReadings)
        .slice(0, 8);

      return {
        success: true,
        result: {
          answer:
            highBpPatients.length > 0
              ? `Found ${highBpPatients.length} patients with repeated high BP in the last 7 days.`
              : "No patients with repeated high BP in the last 7 days.",
          navigationPath: "/dashboard/admin/analytics",
          suggestions: highBpPatients.map((p) => `${p.name}: ${p.highReadings} high readings`),
          data: { repeatedHighBpPatients: highBpPatients },
        },
      };
    }

    const [openAlerts, criticalOpen, activePatients] = await Promise.all([
      prisma.alert.count({ where: { ...NON_DUMMY_ALERT_WHERE, status: AlertStatus.OPEN } }),
      prisma.alert.count({ where: { ...NON_DUMMY_ALERT_WHERE, severity: AlertSeverity.CRITICAL, status: AlertStatus.OPEN } }),
      prisma.patient.count({ where: { isActive: true } }),
    ]);

    const aiPayload = await askAzureJson(
      "You are MediFollow Admin Copilot. Answer briefly and safely for hospital operations.",
      `User command: ${query}\n\nCurrent context: {"openAlerts": ${openAlerts}, "criticalOpenAlerts": ${criticalOpen}, "activePatients": ${activePatients}}\n\nReturn JSON: {"answer": string, "navigationPath": string|null, "suggestions": string[]}`,
      700
    );

    if (aiPayload && typeof aiPayload.answer === "string") {
      return {
        success: true,
        result: {
          answer: aiPayload.answer,
          navigationPath: typeof aiPayload.navigationPath === "string" ? aiPayload.navigationPath : undefined,
          suggestions: Array.isArray(aiPayload.suggestions)
            ? aiPayload.suggestions.map((s: any) => String(s)).slice(0, 5)
            : [],
        },
      };
    }

    return {
      success: true,
      result: {
        answer: `I analyzed your request. Current baseline: ${openAlerts} open alerts, ${criticalOpen} critical open alerts, ${activePatients} active patients. Try: \"unresolved critical alerts today\" or \"patients with repeated high BP\".`,
        navigationPath: "/dashboard/admin",
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Copilot processing failed",
    };
  }
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function hasRecentEarlyWarningAlert(alerts: any[]): boolean {
  return alerts.some((a) => {
    const msg = String(a?.message || "").toLowerCase();
    return msg.includes("early warning") || msg.includes("alerte precoce") || msg.includes("anomaly");
  });
}

export async function detectAndCreateEarlyWarningAlert(patientId: string): Promise<{ success: boolean; created: boolean; message?: string }> {
  try {
    const [patient, recentVitals, existingRecentAlerts] = await Promise.all([
      prisma.patient.findUnique({
        where: { id: patientId },
        include: { user: { select: { firstName: true, lastName: true } } },
      }),
      prisma.vitalRecord.findMany({
        where: { patientId },
        orderBy: { recordedAt: "desc" },
        take: 8,
      }),
      prisma.alert.findMany({
        where: {
          patientId,
          status: { in: [AlertStatus.OPEN, AlertStatus.ACKNOWLEDGED] },
          createdAt: { gte: new Date(Date.now() - 6 * 60 * 60 * 1000) },
        },
        select: { message: true },
      }),
    ]);

    if (!patient || recentVitals.length < 4) {
      return { success: true, created: false, message: "Not enough data for anomaly detection" };
    }

    if (hasRecentEarlyWarningAlert(existingRecentAlerts)) {
      return { success: true, created: false, message: "Recent early warning already exists" };
    }

    const latest = recentVitals[0];
    const prev = recentVitals.slice(1, 4);
    const older = recentVitals.slice(4, 8);

    const avgPrevSys = average(prev.map((v: any) => v.systolicBP).filter((v): v is number => typeof v === "number"));
    const avgPrevDia = average(prev.map((v: any) => v.diastolicBP).filter((v): v is number => typeof v === "number"));
    const avgPrevSpo2 = average(prev.map((v: any) => v.oxygenSaturation).filter((v): v is number => typeof v === "number"));
    const avgPrevHr = average(prev.map((v: any) => v.heartRate).filter((v): v is number => typeof v === "number"));
    const avgOlderHr = average(older.map((v: any) => v.heartRate).filter((v): v is number => typeof v === "number"));

    const flags: string[] = [];
    let score = 0;

    const lastThreeHighBp = recentVitals
      .slice(0, 3)
      .filter((v: any) => (v.systolicBP ?? 0) >= 140 || (v.diastolicBP ?? 0) >= 90).length;

    if (lastThreeHighBp >= 2 && ((latest.systolicBP ?? 0) > avgPrevSys + 6 || (latest.diastolicBP ?? 0) > avgPrevDia + 4)) {
      flags.push("Repeated high blood pressure with upward trend");
      score += 2;
    }

    if (typeof latest.oxygenSaturation === "number" && latest.oxygenSaturation <= 93 && avgPrevSpo2 - latest.oxygenSaturation >= 2) {
      flags.push("Oxygen saturation drop compared to recent baseline");
      score += 2;
    }

    if (typeof latest.heartRate === "number" && latest.heartRate >= 110 && avgPrevHr >= avgOlderHr + 8) {
      flags.push("Progressive tachycardia pattern");
      score += 1;
    }

    if (typeof latest.temperature === "number" && latest.temperature >= 37.8) {
      flags.push("Rising fever trend");
      score += 1;
    }

    if (score < 2) {
      return { success: true, created: false, message: "No anomaly signal" };
    }

    const severity = score >= 4 ? AlertSeverity.CRITICAL : AlertSeverity.HIGH;
    const patientName = `${patient.user.firstName} ${patient.user.lastName}`.trim();
    const confidence = clampConfidence(0.55 + score * 0.1);
    const message = `AI Early Warning: ${flags.join("; ")}.`; 

    const alert = await prisma.alert.create({
      data: {
        patientId,
        alertType: AlertType.VITAL,
        severity,
        status: AlertStatus.OPEN,
        message,
        data: {
          anomalyType: "EARLY_WARNING",
          confidence,
          flags,
          latestVitalRecordId: latest.id,
        },
      },
    });

    await pusherServer.trigger("admin-updates", "new-alert", {
      title: "AI EARLY WARNING",
      desc: `${patientName}: ${flags[0] || "Clinical anomaly detected"}`,
    });

    await sendAdminAlertSMS(`AI EARLY WARNING\nPatient: ${patientName}\n${flags[0] || "Anomaly detected"}`);
    await notifyAlert(
      patientId,
      "AI Early Warning",
      `${patientName}: ${flags.join("; ")}`,
      { alertType: "VITAL", alertId: alert.id, anomalyType: "EARLY_WARNING", confidence }
    );

    return { success: true, created: true, message: "Early warning alert created" };
  } catch (error) {
    return {
      success: false,
      created: false,
      message: error instanceof Error ? error.message : "Early warning detection failed",
    };
  }
}
