/**
 * MediFollow — Coordinator actions (protocol compliance supervision)
 */

"use server";

import { revalidatePath } from "next/cache";
import { endOfDay, startOfDay, subDays } from "date-fns";

import { Role } from "@prisma/client";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import {
  AlertSeverity,
  AlertStatus,
  AlertType,
} from "@/types/medifollow.types";

async function requireCoordinator() {
  const user = await getCurrentUser();
  if (!user || user.role !== "COORDINATOR") {
    return { ok: false as const, error: "Non autorisé", user: null };
  }
  return { ok: true as const, user: user as typeof user & { id: string } };
}

/**
 * Lorsqu’un patient ouvre le guide : assure un lien CoordinatorPatient pour que
 * le coordinateur voie le patient dans son espace (rappels, suivi).
 * Si déjà lié, retourne le coordinateur existant. Sinon : DEFAULT_COORDINATOR_USER_ID ou premier COORDINATOR actif.
 */
export async function ensurePatientLinkedToCoordinatorForGuide() {
  const user = await getCurrentUser();
  if (!user || user.role !== "PATIENT") {
    return { success: false as const, error: "Non autorisé" };
  }

  const patient = await prisma.patient.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!patient) {
    return { success: false as const, error: "Profil patient introuvable" };
  }

  const existing = await prisma.coordinatorPatient.findFirst({
    where: { patientId: patient.id },
    include: {
      coordinator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  if (existing?.coordinator) {
    return {
      success: true as const,
      alreadyLinked: true,
      coordinator: {
        firstName: existing.coordinator.firstName,
        lastName: existing.coordinator.lastName,
        email: existing.coordinator.email,
      },
    };
  }

  const preferredId = process.env.DEFAULT_COORDINATOR_USER_ID?.trim();
  let coordinator = preferredId
    ? await prisma.user.findFirst({
        where: { id: preferredId, role: Role.COORDINATOR, isActive: true },
        select: { id: true, firstName: true, lastName: true, email: true },
      })
    : null;

  if (!coordinator) {
    coordinator = await prisma.user.findFirst({
      where: { role: Role.COORDINATOR, isActive: true },
      orderBy: { createdAt: "asc" },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
  }

  if (!coordinator) {
    return {
      success: false as const,
      error:
        "Aucun coordinateur n’est disponible pour le moment. Contactez l’administration.",
    };
  }

  await prisma.coordinatorPatient.create({
    data: {
      coordinatorId: coordinator.id,
      patientId: patient.id,
      notes:
        "Liaison automatique — consultation du guide patient MediFollow",
    },
  });

  revalidatePath("/dashboard/coordinator");
  revalidatePath("/dashboard/coordinator/patients");
  revalidatePath("/dashboard/patient/guide");

  return {
    success: true as const,
    alreadyLinked: false,
    coordinator: {
      firstName: coordinator.firstName,
      lastName: coordinator.lastName,
      email: coordinator.email,
    },
  };
}

export async function getCoordinatorPatientIds(coordinatorId: string) {
  const [assignedRows, reminderRows, flagRows] = await Promise.all([
    prisma.coordinatorPatient.findMany({
      where: { coordinatorId },
      select: { patientId: true },
    }),
    prisma.coordinatorReminder.findMany({
      where: { coordinatorId },
      select: { patientId: true },
      distinct: ["patientId"],
    }),
    prisma.coordinatorEntryFlag.findMany({
      where: { coordinatorId },
      select: { patientId: true },
      distinct: ["patientId"],
    }),
  ]);

  // Fallback legacy: certains environnements ont des interactions coordinateur
  // sans ligne CoordinatorPatient (migration incomplète / seed partiel).
  // On fusionne les IDs pour éviter une liste "Mes patients" vide.
  const ids = new Set<string>();
  for (const r of assignedRows) ids.add(r.patientId);
  for (const r of reminderRows) ids.add(r.patientId);
  for (const r of flagRows) ids.add(r.patientId);
  return Array.from(ids);
}

/** Vérifie si une entrée vitale est complète selon le protocole minimal (TA + FC + temp + SpO2) */
function getVitalCompleteness(v: {
  systolicBP?: number | null;
  diastolicBP?: number | null;
  heartRate?: number | null;
  temperature?: number | null;
  oxygenSaturation?: number | null;
}) {
  const issues: string[] = [];
  if (v.systolicBP == null || v.diastolicBP == null) {
    issues.push("Tension artérielle incomplète");
  }
  if (v.heartRate == null) issues.push("Fréquence cardiaque manquante");
  if (v.temperature == null) issues.push("Température manquante");
  if (v.oxygenSaturation == null) issues.push("Saturation O₂ manquante");
  const filled = 5 - issues.length;
  const score = Math.round((filled / 5) * 100);
  return { score, issues, isComplete: issues.length === 0 };
}

async function computeComplianceForPatient(patientId: string) {
  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);
  const sevenAgo = startOfDay(subDays(now, 6));

  const [vitalsToday, vitals7d, symptoms7d, questionnaires7d, questionnaires28d] =
    await Promise.all([
      prisma.vitalRecord.findFirst({
        where: {
          patientId,
          recordedAt: { gte: dayStart, lte: dayEnd },
        },
      }),
      prisma.vitalRecord.findMany({
        where: {
          patientId,
          recordedAt: { gte: sevenAgo, lte: now },
        },
        select: { recordedAt: true },
      }),
      prisma.symptom.findMany({
        where: {
          patientId,
          occurredAt: { gte: sevenAgo, lte: now },
        },
        select: { occurredAt: true },
      }),
      prisma.questionnaire.findMany({
        where: {
          patientId,
          completedAt: { gte: sevenAgo, lte: now },
        },
      }),
      prisma.questionnaire.findMany({
        where: {
          patientId,
          completedAt: { gte: subDays(now, 28), lte: now },
        },
      }),
    ]);

  const daysWithVital = new Set<number>();
  for (const v of vitals7d) {
    daysWithVital.add(startOfDay(v.recordedAt as Date).getTime());
  }
  const dailyCompliance7d = Math.round((daysWithVital.size / 7) * 100);

  const daysWithSymptom = new Set<number>();
  for (const s of symptoms7d) {
    daysWithSymptom.add(startOfDay(s.occurredAt as Date).getTime());
  }
  const symptomCompliance7d = Math.round((daysWithSymptom.size / 7) * 100);

  const qWeek = questionnaires7d.length;
  const questionnaireScore7d = Math.min(100, qWeek >= 1 ? 100 : qWeek * 50);

  const qMonth = questionnaires28d.length;
  const questionnaireCompletion30d = Math.min(100, Math.round((qMonth / 4) * 100));

  const overallScore = Math.round(
    dailyCompliance7d * 0.45 +
      questionnaireScore7d * 0.35 +
      symptomCompliance7d * 0.2
  );

  return {
    hasVitalToday: !!vitalsToday,
    dailyCompliance7d,
    symptomCompliance7d,
    questionnaireCount7d: qWeek,
    questionnaireScore7d,
    questionnaireCompletion30d,
    overallScore,
    missingVitalToday: !vitalsToday,
  };
}

export async function getCoordinatorDashboardOverview() {
  try {
    const auth = await requireCoordinator();
    if (!auth.ok || !auth.user) {
      return { success: false, error: auth.error };
    }
    const coordinatorId = auth.user.id;
    const allPatients = await prisma.patient.findMany({
      select: { id: true },
    });
  const patientIds = allPatients.map((p) => p.id);
  if (patientIds.length === 0) {
    return {
      success: true,
      data: {
        assignedCount: 0,
        missingVitalToday: 0,
        openAlerts: 0,
        unresolvedFlags: 0,
        avgCompliance: 0,
        patients: [] as any[],
      },
    };
  }

  const [compliances, alerts, flags] = await Promise.all([
    Promise.all(patientIds.map((id) => computeComplianceForPatient(id))),
    prisma.alert.findMany({
      where: {
        patientId: { in: patientIds },
        status: { in: [AlertStatus.OPEN, AlertStatus.ACKNOWLEDGED] },
      },
    }),
    prisma.coordinatorEntryFlag.count({
      where: {
        coordinatorId,
        status: "OPEN",
        patientId: { in: patientIds },
      },
    }),
  ]);

  const missingVitalToday = compliances.filter(
    (c) => c.missingVitalToday
  ).length;

  const avgCompliance =
    compliances.length > 0
      ? Math.round(
          compliances.reduce((s, c) => s + c.overallScore, 0) /
            compliances.length
        )
      : 0;

  const patientRows = await prisma.patient.findMany({
    where: {
      id: { in: patientIds },
    },
    select: {
      id: true,
      medicalRecordNumber: true,
      userId: true,
    },
  });

  const userIds = patientRows
    .map((p) => p.userId)
    .filter((id): id is string => Boolean(id));

  const users = userIds.length
    ? await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      })
    : [];
  const userById = Object.fromEntries(users.map((u) => [u.id, u]));
  const validPatients = patientRows.filter((p) => userById[p.userId]);

  const byId: Record<string, (typeof compliances)[0]> = {};
  patientIds.forEach((id, i) => {
    byId[id] = compliances[i];
  });

  const list = validPatients.map((p) => ({
    patientId: p.id,
    user: userById[p.userId],
    medicalRecordNumber: p.medicalRecordNumber,
    ...byId[p.id],
  }));

  const validPatientIds = validPatients.map((p) => p.id);

  return {
    success: true,
    data: {
      assignedCount: validPatientIds.length,
      missingVitalToday,
      openAlerts: alerts.filter(
        (a) => a.status === AlertStatus.OPEN && validPatientIds.includes(a.patientId)
      ).length,
      acknowledgedAlerts: alerts.filter(
        (a) => a.status === AlertStatus.ACKNOWLEDGED && validPatientIds.includes(a.patientId)
      ).length,
      totalActiveAlerts: alerts.filter((a) => validPatientIds.includes(a.patientId)).length,
      unresolvedFlags: flags,
      avgCompliance,
      patients: list.sort((a, b) => a.overallScore - b.overallScore),
    },
  };
  } catch (error) {
    console.error("[getCoordinatorDashboardOverview]", error);
    return { success: false, error: "Erreur lors du chargement du tableau de bord." };
  }
}

export async function getCoordinatorPatientsDetailed() {
  try {
    // Affichage demandé: tous les patients, même non associés au coordinateur.
    // On ne bloque donc pas la liste par relation CoordinatorPatient.
    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        medicalRecordNumber: true,
        userId: true,
      },
      orderBy: { medicalRecordNumber: "asc" },
    });

  const userIds = patients.map((p) => p.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
    },
  });
  const userById = Object.fromEntries(users.map((u) => [u.id, u]));
  const validPatients = patients.filter((p) => userById[p.userId]);

  const detailed = await Promise.all(
    validPatients.map(async (p) => {
      const compliance = await computeComplianceForPatient(p.id);
      return {
        ...p,
        user: userById[p.userId],
        compliance,
        assignmentNotes: null,
        assignedAt: null,
      };
    })
  );

  return { success: true, patients: detailed };
  } catch (error) {
    console.error("[getCoordinatorPatientsDetailed]", error);
    return { success: false, error: "Erreur lors du chargement des patients." };
  }
}

export async function getCoordinatorPatientDetail(patientId: string) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
        },
      },
      vitalRecords: {
        orderBy: { recordedAt: "desc" },
        take: 20,
      },
      symptoms: {
        orderBy: { occurredAt: "desc" },
        take: 14,
      },
      questionnaires: {
        orderBy: { completedAt: "desc" },
        take: 10,
      },
    },
  });

  if (!patient || !patient.user) {
    return { success: false, error: "Patient introuvable" };
  }

  const compliance = await computeComplianceForPatient(patientId);

  const vitalsWithCompleteness = patient.vitalRecords.map((v) => ({
    ...v,
    completeness: getVitalCompleteness(v),
  }));

  return {
    success: true,
    data: {
      patient,
      compliance,
      vitalsWithCompleteness,
    },
  };
}

export async function sendCoordinatorReminder(
  patientId: string,
  message: string,
  channels: ("IN_APP" | "EMAIL" | "SMS")[]
) {
  const auth = await requireCoordinator();
  if (!auth.ok || !auth.user) {
    return { success: false, error: auth.error };
  }
  const patientRow = await prisma.patient.findUnique({
    where: { id: patientId },
    include: { user: true },
  });
  if (!patientRow || !patientRow.user) {
    return { success: false, error: "Patient introuvable" };
  }

  const trimmed = message.trim();
  if (!trimmed) {
    return { success: false, error: "Message vide" };
  }

  const ch: ("IN_APP" | "EMAIL" | "SMS")[] =
    channels.length > 0 ? [...channels] : ["IN_APP"];
  await prisma.coordinatorReminder.create({
    data: {
      coordinatorId: auth.user.id,
      patientId,
      message: trimmed,
      channels: ch as string[],
    },
  });

  const patientUserId = patientRow.userId;
  const title = "Rappel — suivi post-hospitalisation";

  if (ch.includes("IN_APP")) {
    await prisma.notification.create({
      data: {
        recipientId: patientUserId,
        type: "REMINDER",
        title,
        message: `[Coordinateur] ${trimmed}`,
        sentVia: ["IN_APP"],
      },
    });
  }

  if (ch.includes("EMAIL") && process.env.SENDGRID_API_KEY) {
    try {
      const { default: NotificationService } = await import(
        "@/lib/services/notification.service"
      );
      await NotificationService.send({
        recipientId: patientUserId,
        title,
        message: trimmed,
        type: "REMINDER",
        channels: ["EMAIL"] as ["EMAIL"],
      });
    } catch (e) {
      console.error("[coordinator reminder email]", e);
    }
  }

  if (ch.includes("SMS") && process.env.TWILIO_ACCOUNT_SID) {
    try {
      const { default: NotificationService } = await import(
        "@/lib/services/notification.service"
      );
      await NotificationService.send({
        recipientId: patientUserId,
        title,
        message: trimmed,
        type: "REMINDER",
        channels: ["SMS"] as ["SMS"],
        smsMessage: trimmed.slice(0, 160),
      });
    } catch (e) {
      console.error("[coordinator reminder sms]", e);
    }
  }

  revalidatePath("/dashboard/coordinator");
  revalidatePath("/dashboard/coordinator/reminders");
  return { success: true, message: "Rappel enregistré" };
}

export async function getCoordinatorReminderHistory(limit = 50) {
  const auth = await requireCoordinator();
  if (!auth.ok || !auth.user) {
    return { success: false, reminders: [] };
  }
  
  try {
    const reminders = await prisma.coordinatorReminder.findMany({
      where: { coordinatorId: auth.user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    
    // Récupère les infos patients séparément pour éviter les erreurs de relations orphelines
    const remindersList = await Promise.all(
      reminders.map(async (r) => {
        try {
          const patient = await prisma.patient.findUnique({
            where: { id: r.patientId },
            include: {
              user: {
                select: { firstName: true, lastName: true, email: true },
              },
            },
          });
          return { ...r, patient };
        } catch {
          return { ...r, patient: null };
        }
      })
    );
    
    return { success: true, reminders: remindersList };
  } catch (error) {
    console.error("[getCoordinatorReminderHistory error]", error);
    return { success: false, reminders: [], error: String(error) };
  }
}

export async function getCoordinatorAlerts() {
  try {
    const auth = await requireCoordinator();
    if (!auth.ok || !auth.user) {
      return { success: false, alerts: [], error: auth.error };
    }
    const patientIds = await getCoordinatorPatientIds(auth.user.id);
    if (patientIds.length === 0) {
      return { success: true, alerts: [] };
    }
    const alerts = await prisma.alert.findMany({
      where: { patientId: { in: patientIds } },
      orderBy: { createdAt: "desc" },
      include: {
        patient: {
          select: {
            id: true,
            medicalRecordNumber: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        acknowledgedBy: {
          select: { firstName: true, lastName: true },
        },
        resolvedBy: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    const validAlerts = alerts.filter((alert) => alert.patient && alert.patient.user);
    return { success: true, alerts: validAlerts };
  } catch (error) {
    console.error("[getCoordinatorAlerts]", error);
    return {
      success: false,
      alerts: [],
      error: String((error as Error)?.message ?? error),
    };
  }
}

export async function escalateCoordinatorAlert(alertId: string, note: string) {
  const auth = await requireCoordinator();
  if (!auth.ok || !auth.user) {
    return { success: false, error: auth.error };
  }
  const patientIds = await getCoordinatorPatientIds(auth.user.id);
  const alert = await prisma.alert.findUnique({ where: { id: alertId } });
  if (!alert || !patientIds.includes(alert.patientId)) {
    return { success: false, error: "Alerte introuvable" };
  }
  const n = note.trim();
  const newAlert = await prisma.alert.create({
    data: {
      patientId: alert.patientId,
      alertType: AlertType.SYSTEM,
      severity: AlertSeverity.HIGH,
      message: `Escalade coordinateur : ${n}`,
      status: AlertStatus.OPEN,
      data: {
        escalatedFromAlertId: alertId,
        coordinatorId: auth.user.id,
      },
    },
  });

  try {
    const { NotificationService } = await import(
      "@/lib/services/notification.service"
    );
    await NotificationService.notifyAlert(newAlert.id);
  } catch (notificationError) {
    console.error(
      "[escalateCoordinatorAlert] failed to notify patient",
      notificationError
    );
  }

  revalidatePath("/dashboard/coordinator/alerts");
  return { success: true, message: "Escalade enregistrée" };
}

export async function generateEscalationMotif(alertId: string) {
  const auth = await requireCoordinator();
  if (!auth.ok || !auth.user) {
    return { success: false, motif: "", error: auth.error };
  }

  try {
    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
      include: {
        patient: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    });

    if (!alert) {
      return { success: false, motif: "", error: "Alerte introuvable" };
    }

    // Fonction pour générer un motif basé sur le contenu de l'alerte
    function generateMotifFromAlert(alertType: string, severity: string, message: string): string {
      const severityMap: Record<string, string> = {
        CRITICAL: "Critique",
        HIGH: "Élevée",
        MEDIUM: "Modérée",
        LOW: "Basse",
      };

      const severityLabel = severityMap[severity] || severity;

      // Extraire des mots-clés du message
      const lowerMsg = message.toLowerCase();
      
      if (lowerMsg.includes("temperature")) {
        return `Alerte température ${severityLabel}: ${message}. Hospitalisation recommandée pour surveillance thermique.`;
      }
      if (lowerMsg.includes("tension") || lowerMsg.includes("ta") || lowerMsg.includes("tension artérielle")) {
        return `Alerte TA ${severityLabel}: ${message}. Cardiologue consulté pour ajustement thérapeutique.`;
      }
      if (lowerMsg.includes("spo2") || lowerMsg.includes("oxygène") || lowerMsg.includes("saturation")) {
        return `Alerte oxygénation ${severityLabel}: ${message}. Oxygénothérapie envisagée.`;
      }
      if (lowerMsg.includes("fréquence cardiaque") || lowerMsg.includes("cœur") || lowerMsg.includes("tachycardie")) {
        return `Alerte cardiaque ${severityLabel}: ${message}. Monitoring continu recommandé.`;
      }
      if (lowerMsg.includes("poids") || lowerMsg.includes("fluide")) {
        return `Alerte métabolique ${severityLabel}: ${message}. Bilan sanguin demandé.`;
      }

      // Motif générique
      return `Alerte ${alertType.toLowerCase()} ${severityLabel}: ${message}. Intervention médicale requise selon protocole.`;
    }

    // Essayer d'abord HF API (fallback si échoue)
    let generatedMotif = null;

    try {
      const token = process.env.HF_API_TOKEN || process.env.token;
      if (token) {
        const prompt = `Tu es un coordinateur médical. Génère un motif d'escalade court et professionnel (1-2 phrases) pour l'alerte suivante :
- Type : ${alert.alertType}
- Sévérité : ${alert.severity}
- Message : ${alert.message}

Réponds UNIQUEMENT avec le motif d'escalade.`;

        const res = await fetch("https://router.huggingface.co/v1/responses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            model: "mistralai/Mistral-7B-Instruct-v0.3",
            input: prompt,
            max_output_tokens: 150,
            temperature: 0.3,
          }),
          cache: "no-store",
        });

        if (res.ok) {
          const data: any = await res.json();
          console.log("[generateEscalationMotif HF response]", JSON.stringify(data).slice(0, 300));

          generatedMotif =
            typeof data?.output_text === "string"
              ? data.output_text.trim()
              : Array.isArray(data?.output)
              ? data.output
                  .flatMap((o: any) =>
                    Array.isArray(o?.content)
                      ? o.content.map((c: any) => c?.text ?? "")
                      : []
                  )
                  .join("")
                  .trim()
              : null;
        } else {
          const errText = await res.text();
          console.log("[generateEscalationMotif HF error]", res.status, errText.slice(0, 200));
        }
      }
    } catch (hfError) {
      console.log("[generateEscalationMotif HF fallback]", String(hfError).slice(0, 100));
    }

    // Si HF échoue, générer localement
    if (!generatedMotif) {
      generatedMotif = generateMotifFromAlert(alert.alertType, alert.severity, alert.message);
    }

    return { success: true, motif: generatedMotif, error: null };
  } catch (error) {
    console.error("[generateEscalationMotif]", error);
    return {
      success: false,
      motif: "",
      error: String(error),
    };
  }
}

export async function flagCoordinatorEntry(
  patientId: string,
  payload: {
    vitalRecordId?: string;
    flagType: "INCOMPLETE" | "SUSPICIOUS" | "OTHER";
    note: string;
  }
) {
  const auth = await requireCoordinator();
  if (!auth.ok || !auth.user) {
    return { success: false, error: auth.error };
  }
  const patientRow = await prisma.patient.findUnique({
    where: { id: patientId },
  });
  if (!patientRow) {
    return { success: false, error: "Patient introuvable" };
  }
  const note = payload.note.trim();
  if (!note) return { success: false, error: "Note requise" };

  if (payload.flagType === "INCOMPLETE" && payload.vitalRecordId) {
    const vital = await prisma.vitalRecord.findUnique({
      where: { id: payload.vitalRecordId },
      select: {
        systolicBP: true,
        diastolicBP: true,
        heartRate: true,
        temperature: true,
        oxygenSaturation: true,
        patientId: true,
      },
    });
    if (!vital || vital.patientId !== patientId) {
      return { success: false, error: "Entrée vitale introuvable" };
    }
    const completeness = getVitalCompleteness(vital);
    if (completeness.score === 100) {
      return {
        success: false,
        error: "Impossible de signaler une entrée complète à 100% comme incomplète.",
      };
    }
  }

  await prisma.coordinatorEntryFlag.create({
    data: {
      coordinatorId: auth.user.id,
      patientId,
      vitalRecordId: payload.vitalRecordId,
      flagType: payload.flagType,
      note,
    },
  });
  revalidatePath("/dashboard/coordinator");
  revalidatePath("/dashboard/coordinator/reviews");
  revalidatePath(`/dashboard/coordinator/patients/${patientId}`);
  return { success: true, message: "Signalement enregistré" };
}

export async function resolveCoordinatorFlag(flagId: string) {
  const auth = await requireCoordinator();
  if (!auth.ok || !auth.user) {
    return { success: false, error: auth.error };
  }
  const flag = await prisma.coordinatorEntryFlag.findUnique({
    where: { id: flagId },
  });
  if (!flag || flag.coordinatorId !== auth.user.id) {
    return { success: false, error: "Signalement introuvable" };
  }
  await prisma.coordinatorEntryFlag.update({
    where: { id: flagId },
    data: { status: "RESOLVED", resolvedAt: new Date() },
  });
  revalidatePath("/dashboard/coordinator/reviews");
  return { success: true, message: "Signalement clôturé" };
}

export async function getCoordinatorOpenFlags() {
  const auth = await requireCoordinator();
  if (!auth.ok || !auth.user) {
    return { success: false, flags: [] };
  }
  const flags = await prisma.coordinatorEntryFlag.findMany({
    where: { coordinatorId: auth.user.id, status: "OPEN" },
    orderBy: { createdAt: "desc" },
    include: {
      patient: {
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
      },
      vitalRecord: true,
    },
  });
  const validFlags = flags.filter(
    (flag) => flag.patient && flag.patient.user
  );
  return { success: true, flags: validFlags };
}

export async function getUnifiedReviews() {
  const auth = await requireCoordinator();
  if (!auth.ok || !auth.user) {
    return { success: false, reviews: [], stats: null };
  }

  // 1. Get Flags
  const flags = await prisma.coordinatorEntryFlag.findMany({
    where: { coordinatorId: auth.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      patient: {
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
      },
      vitalRecord: true,
    },
  });

  // 2. Get Alerts (for patients assigned to coordinator)
  const patientIds = await getCoordinatorPatientIds(auth.user.id);
  const alerts = await prisma.alert.findMany({
    where: { patientId: { in: patientIds }, alertType: "VITAL" }, 
    orderBy: { createdAt: "desc" },
    include: {
      patient: {
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
      },
      vitalRecord: true,
    },
  });

  // Today's date logic for Closed stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Map into Unified format
  let unifiedReviews = [];
  let stats = {
    total: 0,
    critiques: 0,
    suspects: 0,
    incomplets: 0,
    closedToday: 0
  };

  for (const f of flags) {
    if (f.status === "RESOLVED" && f.resolvedAt && f.resolvedAt >= today) {
      stats.closedToday++;
    }
    if (f.status !== "OPEN") continue;

    const reviewType = f.flagType === "INCOMPLETE" ? "Incomplet" : "Suspect";
    if (reviewType === "Incomplet") stats.incomplets++;
    if (reviewType === "Suspect") stats.suspects++;
    stats.total++;

    unifiedReviews.push({
      id: f.id,
      sourceType: "FLAG",
      patientId: f.patientId,
      patientName: `${f.patient.user.firstName} ${f.patient.user.lastName}`,
      priority: reviewType === "Incomplet" ? "basse" : "moyenne",
      reviewType,
      title: reviewType === "Incomplet" ? "Entrée soumise avec champs manquants" : "Valeur hors plage normale — possible erreur",
      note: f.note,
      createdAt: f.createdAt,
      vitalRecord: f.vitalRecord
    });
  }

  for (const a of alerts) {
    if ((a.status === "RESOLVED" || a.status === "CLOSED" || a.resolvedAt) && a.resolvedAt && a.resolvedAt >= today) {
      stats.closedToday++;
    }
    if (a.status !== "OPEN" && a.status !== "ACKNOWLEDGED") continue;

    stats.critiques++;
    stats.total++;

    unifiedReviews.push({
      id: a.id,
      sourceType: "ALERT",
      patientId: a.patientId,
      patientName: `${a.patient.user.firstName} ${a.patient.user.lastName}`,
      priority: "haute",
      reviewType: "Critique",
      title: a.severity === "CRITICAL" ? "Valeur anormalement élevée détectée" : "Alerte système sur constante",
      note: a.message,
      createdAt: a.createdAt,
      vitalRecord: a.vitalRecord
    });
  }

  // Sort by date DESC
  unifiedReviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return { success: true, reviews: unifiedReviews, stats };
}

export async function closeUnifiedReview(id: string, sourceType: string) {
  const auth = await requireCoordinator();
  if (!auth.ok || !auth.user) {
    return { success: false, error: auth.error };
  }

  try {
    if (sourceType === "FLAG") {
      await prisma.coordinatorEntryFlag.update({
        where: { id },
        data: { status: "RESOLVED", resolvedAt: new Date() },
      });
    } else {
      await prisma.alert.update({
        where: { id },
        data: { status: "RESOLVED", resolvedById: auth.user.id, resolvedAt: new Date(), resolution: "Clôturé par le coordinateur depuis Revues" },
      });
    }

    revalidatePath("/dashboard/coordinator/reviews");
    return { success: true, message: "Signalement clôturé" };
  } catch (error) {
    return { success: false, error: "Impossible de clôturer l'élément." };
  }
}
