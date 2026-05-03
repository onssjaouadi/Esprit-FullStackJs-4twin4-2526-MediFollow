/**
 * MediFollow - Coordinator Actions
 * Server actions for coordinator-specific functionality
 */

"use server";

import { revalidatePath } from "next/cache";
import { endOfDay, startOfDay, subDays } from "date-fns";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import {
  CoordinatorProfile,
  CoordinatorProfileUpdateInput,
  CommunicationCreateInput,
  CoordinatorDashboardStats,
  PatientComplianceDetail,
  ComplianceStatus,
  AlertStatus,
  AlertType,
  AlertSeverity,
} from "@/types/medifollow.types";

/**
 * Get coordinator profile by user ID
 */
export async function getCoordinatorProfile(userId: string) {
  try {
    const profile = await prisma.coordinatorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phoneNumber: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return { success: true, data: profile };
  } catch (error) {
    console.error("Error fetching coordinator profile:", error);
    return { success: false, error: "Failed to fetch coordinator profile" };
  }
}

/**
 * Update coordinator profile
 */
export async function updateCoordinatorProfile(
  userId: string,
  data: CoordinatorProfileUpdateInput
) {
  try {
    const profile = await prisma.coordinatorProfile.update({
      where: { userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/coordinator/settings");
    return { success: true, data: profile };
  } catch (error) {
    console.error("Error updating coordinator profile:", error);
    return { success: false, error: "Failed to update coordinator profile" };
  }
}

/**
 * Calculate compliance status for a patient on a specific date
 */
async function calculateComplianceStatus(
  patientId: string,
  date: Date
): Promise<ComplianceStatus> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const [vitalsCount, symptomsCount, questionnairesCount] = await Promise.all([
    prisma.vitalRecord.count({
      where: {
        patientId,
        recordedAt: { gte: startOfDay, lte: endOfDay },
      },
    }),
    prisma.symptom.count({
      where: {
        patientId,
        occurredAt: { gte: startOfDay, lte: endOfDay },
      },
    }),
    prisma.questionnaire.count({
      where: {
        patientId,
        completedAt: { gte: startOfDay, lte: endOfDay },
      },
    }),
  ]);

  const itemsCompleted = [
    vitalsCount > 0,
    symptomsCount > 0 || true, // Symptoms optional
    questionnairesCount > 0 || true, // Questionnaires optional
  ].filter(Boolean).length;

  if (vitalsCount > 0) {
    return ComplianceStatus.COMPLIANT;
  } else if (itemsCompleted >= 1) {
    return ComplianceStatus.PARTIAL;
  } else {
    return ComplianceStatus.NON_COMPLIANT;
  }
}

/**
 * Update or create compliance record for a patient on a specific date
 */
export async function updateComplianceRecord(patientId: string, date: Date) {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [vitalsCount, symptomsCount, questionnairesCount] = await Promise.all(
      [
        prisma.vitalRecord.count({
          where: {
            patientId,
            recordedAt: { gte: startOfDay, lte: endOfDay },
          },
        }),
        prisma.symptom.count({
          where: {
            patientId,
            occurredAt: { gte: startOfDay, lte: endOfDay },
          },
        }),
        prisma.questionnaire.count({
          where: {
            patientId,
            completedAt: { gte: startOfDay, lte: endOfDay },
          },
        }),
      ]
    );

    const status = await calculateComplianceStatus(patientId, date);

    const complianceRecord = await prisma.complianceRecord.upsert({
      where: {
        patientId_date: {
          patientId,
          date: startOfDay,
        },
      },
      create: {
        patientId,
        date: startOfDay,
        vitalsSubmitted: vitalsCount > 0,
        vitalsCount,
        symptomsReported: symptomsCount > 0,
        symptomsCount,
        questionnairesCompleted: questionnairesCount > 0,
        questionnairesCount,
        status,
        lastCheckedAt: new Date(),
      },
      update: {
        vitalsSubmitted: vitalsCount > 0,
        vitalsCount,
        symptomsReported: symptomsCount > 0,
        symptomsCount,
        questionnairesCompleted: questionnairesCount > 0,
        questionnairesCount,
        status,
        lastCheckedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return { success: true, data: complianceRecord };
  } catch (error) {
    console.error("Error updating compliance record:", error);
    return { success: false, error: "Failed to update compliance record" };
  }
}

/**
 * Get all patients' compliance status
 */
export async function getPatientComplianceStatus() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const patients = await prisma.patient.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phoneNumber: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        vitalRecords: {
          where: { recordedAt: { gte: today } },
          take: 1,
          orderBy: { recordedAt: "desc" },
        },
      },
    });

    const complianceData = await Promise.all(
      patients.map(async (patient) => {
        const complianceRecord = await prisma.complianceRecord.findUnique({
          where: {
            patientId_date: {
              patientId: patient.id,
              date: today,
            },
          },
        });

        let status: ComplianceStatus;
        if (!complianceRecord) {
          status = await calculateComplianceStatus(patient.id, today);
          await updateComplianceRecord(patient.id, today);
        } else {
          status = complianceRecord.status as ComplianceStatus;
        }

        return {
          patient,
          complianceRecord: complianceRecord || null,
          status,
        };
      })
    );

    return { success: true, data: complianceData };
  } catch (error) {
    console.error("Error fetching patient compliance status:", error);
    return {
      success: false,
      error: "Failed to fetch patient compliance status",
    };
  }
}

/**
 * Get detailed compliance information for a specific patient
 */
export async function getPatientComplianceDetail(patientId: string): Promise<{
  success: boolean;
  data?: PatientComplianceDetail;
  error?: string;
}> {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phoneNumber: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!patient) {
      return { success: false, error: "Patient not found" };
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      complianceRecords,
      recentVitals,
      recentSymptoms,
      recentQuestionnaires,
      communications,
    ] = await Promise.all([
      prisma.complianceRecord.findMany({
        where: {
          patientId,
          date: { gte: thirtyDaysAgo },
        },
        orderBy: { date: "desc" },
      }),
      prisma.vitalRecord.findMany({
        where: {
          patientId,
          recordedAt: { gte: thirtyDaysAgo },
        },
        orderBy: { recordedAt: "desc" },
        take: 30,
      }),
      prisma.symptom.findMany({
        where: {
          patientId,
          occurredAt: { gte: thirtyDaysAgo },
        },
        orderBy: { occurredAt: "desc" },
        take: 20,
      }),
      prisma.questionnaire.findMany({
        where: {
          patientId,
          completedAt: { gte: thirtyDaysAgo },
        },
        orderBy: { completedAt: "desc" },
        take: 10,
      }),
      prisma.patientCommunication.findMany({
        where: { patientId },
        orderBy: { sentAt: "desc" },
        take: 20,
      }),
    ]);

    const data: PatientComplianceDetail = {
      patient: patient as any,
      complianceRecords: complianceRecords as any,
      recentVitals: recentVitals as any,
      recentSymptoms: recentSymptoms as any,
      recentQuestionnaires: recentQuestionnaires as any,
      communications: communications as any,
    };

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching patient compliance detail:", error);
    return {
      success: false,
      error: "Failed to fetch patient compliance detail",
    };
  }
}

/**
 * Send reminder to patient
 */
export async function sendReminderToPatient(
  patientId: string,
  coordinatorId: string,
  message: string,
  subject?: string
) {
  try {
    const communication = await prisma.patientCommunication.create({
      data: {
        patientId,
        coordinatorId,
        type: "REMINDER",
        subject: subject || "Rappel de suivi",
        message,
        isRead: false,
      },
    });

    revalidatePath("/dashboard/coordinator/communications");
    return { success: true, data: communication };
  } catch (error) {
    console.error("Error sending reminder:", error);
    return { success: false, error: "Failed to send reminder" };
  }
}

/**
 * Send guidance to patient
 */
export async function sendGuidanceToPatient(
  patientId: string,
  coordinatorId: string,
  message: string,
  subject?: string
) {
  try {
    const communication = await prisma.patientCommunication.create({
      data: {
        patientId,
        coordinatorId,
        type: "GUIDANCE",
        subject: subject || "Assistance",
        message,
        isRead: false,
      },
    });

    revalidatePath("/dashboard/coordinator/communications");
    return { success: true, data: communication };
  } catch (error) {
    console.error("Error sending guidance:", error);
    return { success: false, error: "Failed to send guidance" };
  }
}

/**
 * Get all patient communications
 */
export async function getPatientCommunications(patientId: string) {
  try {
    const communications = await prisma.patientCommunication.findMany({
      where: { patientId },
      orderBy: { sentAt: "desc" },
    });

    return { success: true, data: communications };
  } catch (error) {
    console.error("Error fetching patient communications:", error);
    return { success: false, error: "Failed to fetch patient communications" };
  }
}

/**
 * Get coordinator dashboard statistics
 */
export async function getCoordinatorDashboardStats(): Promise<{
  success: boolean;
  stats?: CoordinatorDashboardStats;
  error?: string;
}> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allPatients = await prisma.patient.count({
      where: { isActive: true },
    });

    const complianceRecords = await prisma.complianceRecord.findMany({
      where: {
        date: today,
      },
    });

    const compliantToday = complianceRecords.filter(
      (r) => r.status === "COMPLIANT"
    ).length;

    const nonCompliantToday = complianceRecords.filter(
      (r) => r.status === "NON_COMPLIANT"
    ).length;

    const recentCommunications = await prisma.patientCommunication.findMany({
      orderBy: { sentAt: "desc" },
      take: 10,
    });

    const pendingQuestionnaires = await prisma.patient.count({
      where: {
        isActive: true,
        questionnaires: {
          none: {
            completedAt: { gte: today },
          },
        },
      },
    });

    const stats: CoordinatorDashboardStats = {
      totalPatientsMonitored: allPatients,
      compliantToday,
      nonCompliantToday,
      pendingQuestionnaires,
      recentCommunications: recentCommunications as any,
    };

    return { success: true, stats };
  } catch (error) {
    console.error("Error fetching coordinator dashboard stats:", error);
    return {
      success: false,
      error: "Failed to fetch coordinator dashboard statistics",
    };
  }
}

/**
 * Get non-compliant patients
 */
export async function getNonCompliantPatients() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const complianceRecords = await prisma.complianceRecord.findMany({
      where: {
        date: today,
        status: { in: ["NON_COMPLIANT", "PARTIAL"] },
      },
    });

    const patientIds = complianceRecords.map((r) => r.patientId);

    const patients = await prisma.patient.findMany({
      where: {
        id: { in: patientIds },
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phoneNumber: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    const patientsWithCompliance = patients.map((patient) => {
      const compliance = complianceRecords.find(
        (r) => r.patientId === patient.id
      );
      return {
        patient,
        complianceStatus: compliance?.status || "NON_COMPLIANT",
        lastChecked: compliance?.lastCheckedAt || new Date(),
      };
    });

    return { success: true, data: patientsWithCompliance };
  } catch (error) {
    console.error("Error fetching non-compliant patients:", error);
    return { success: false, error: "Failed to fetch non-compliant patients" };
  }
}

/**
 * Verify entry completeness for a vital record
 */
export async function verifyEntryCompleteness(vitalRecordId: string) {
  try {
    const vitalRecord = await prisma.vitalRecord.findUnique({
      where: { id: vitalRecordId },
    });

    if (!vitalRecord) {
      return { success: false, error: "Vital record not found" };
    }

    const requiredFields = [
      "systolicBP",
      "diastolicBP",
      "heartRate",
      "temperature",
      "oxygenSaturation",
    ];

    const missingFields = requiredFields.filter(
      (field) => !vitalRecord[field as keyof typeof vitalRecord]
    );

    const isComplete = missingFields.length === 0;

    return {
      success: true,
      data: {
        isComplete,
        missingFields,
        vitalRecord,
      },
    };
  } catch (error) {
    console.error("Error verifying entry completeness:", error);
    return { success: false, error: "Failed to verify entry completeness" };
  }
}

/**
 * Get incomplete vital entries
 */
export async function getIncompleteVitalEntries() {
  try {
    const recentVitals = await prisma.vitalRecord.findMany({
      where: {
        recordedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                phoneNumber: true,
                isActive: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
      orderBy: { recordedAt: "desc" },
    });

    const incompleteEntries = recentVitals.filter((vital) => {
      const requiredFields = [
        vital.systolicBP,
        vital.diastolicBP,
        vital.heartRate,
        vital.temperature,
        vital.oxygenSaturation,
      ];
      return requiredFields.some(
        (field) => field === null || field === undefined
      );
    });

    return { success: true, data: incompleteEntries };
  } catch (error) {
    console.error("Error fetching incomplete entries:", error);
    return { success: false, error: "Failed to fetch incomplete entries" };
  }
}

/**
 * Mark communication as read
 */
export async function markCommunicationAsRead(communicationId: string) {
  try {
    const communication = await prisma.patientCommunication.update({
      where: { id: communicationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { success: true, data: communication };
  } catch (error) {
    console.error("Error marking communication as read:", error);
    return { success: false, error: "Failed to mark communication as read" };
  }
}

/**
 * Helper function to require coordinator role
 */
async function requireCoordinator() {
  const user = await getCurrentUser();
  if (!user || user.role !== "COORDINATOR") {
    return { ok: false as const, error: "Not authorized", user: null };
  }
  return { ok: true as const, user: user as typeof user & { id: string } };
}

/**
 * Compute compliance metrics for a patient
 */
async function computeComplianceForPatient(patientId: string) {
  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);
  const sevenAgo = startOfDay(subDays(now, 6));

  const [
    vitalsToday,
    vitals7d,
    symptoms7d,
    questionnaires7d,
    questionnaires28d,
    questionnaireAssignments7d,
  ] = await Promise.all([
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
    prisma.questionnaireAssignment.findMany({
      where: {
        patientId,
        assignedAt: { gte: sevenAgo, lte: now },
      },
      select: { status: true },
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
  const questionnaireCompletion30d = Math.min(
    100,
    Math.round((qMonth / 4) * 100)
  );

  // Calculate resolved vs pending questionnaire assignments
  const questionnaireResolved7d = questionnaireAssignments7d.filter(
    (qa: any) => qa.status === "COMPLETED"
  ).length;
  const questionnairePending7d = questionnaireAssignments7d.filter(
    (qa: any) => qa.status === "PENDING" || qa.status === "IN_PROGRESS"
  ).length;

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
    questionnaireResolved7d,
    questionnairePending7d,
    overallScore,
    missingVitalToday: !vitalsToday,
  };
}

/**
 * Get coordinator dashboard overview
 */
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

    const [compliances, alerts] = await Promise.all([
      Promise.all(patientIds.map((id) => computeComplianceForPatient(id))),
      prisma.alert.findMany({
        where: {
          patientId: { in: patientIds },
          status: { in: [AlertStatus.OPEN, AlertStatus.ACKNOWLEDGED] },
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
          (a) =>
            a.status === AlertStatus.OPEN &&
            validPatientIds.includes(a.patientId)
        ).length,
        acknowledgedAlerts: alerts.filter(
          (a) =>
            a.status === AlertStatus.ACKNOWLEDGED &&
            validPatientIds.includes(a.patientId)
        ).length,
        totalActiveAlerts: alerts.filter((a) =>
          validPatientIds.includes(a.patientId)
        ).length,
        unresolvedFlags: 0,
        avgCompliance,
        patients: list.sort((a, b) => a.overallScore - b.overallScore),
      },
    };
  } catch (error) {
    console.error("[getCoordinatorDashboardOverview]", error);
    return { success: false, error: "Error loading dashboard." };
  }
}

/**
 * Get basic patient information (firstName, lastName)
 */
export async function getPatientBasicInfo(patientId: string) {
  try {
    const patientData = await prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!patientData || !patientData.userId) {
      return { success: false, data: null };
    }

    const user = await prisma.user.findUnique({
      where: { id: patientData.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    return { success: true, data: user };
  } catch (error) {
    console.error("[getPatientBasicInfo]", error);
    return {
      success: false,
      data: null,
      error: "Failed to fetch patient info",
    };
  }
}

/**
 * Get all alerts for the coordinator's patients
 */
export async function getCoordinatorAlerts() {
  try {
    const auth = await requireCoordinator();
    if (!auth.ok || !auth.user) {
      return { success: false, alerts: [], error: auth.error };
    }

    // Get all patients since coordinator manages all patients
    const patientIds = await prisma.patient
      .findMany({
        select: { id: true },
      })
      .then((patients) => patients.map((p) => p.id));

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
            userId: true,
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

    // Get user info for patients
    const userIds = alerts
      .map((a) => a.patient?.userId)
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

    const validAlerts = alerts
      .filter((alert) => alert.patient)
      .map((alert) => ({
        ...alert,
        patient: {
          ...alert.patient,
          user: userById[alert.patient!.userId!],
        },
      }))
      .filter((alert) => alert.patient.user);

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

/**
 * Get all patients with detailed compliance information for the coordinator
 */
export async function getCoordinatorPatientsDetailed() {
  try {
    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        medicalRecordNumber: true,
        userId: true,
      },
      orderBy: { medicalRecordNumber: "asc" },
    });

    const userIds = patients.map((p: any) => p.userId);
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
    const userById = Object.fromEntries(users.map((u: any) => [u.id, u]));
    const validPatients = patients.filter((p: any) => userById[p.userId]);

    const detailed = await Promise.all(
      validPatients.map(async (p: any) => {
        const compliance = await computeComplianceForPatient(p.id);
        return {
          ...p,
          user: userById[p.userId],
          compliance,
          assignmentNotes: null,
          assignedAt: null,
          department: "Général",
          assignedDoctors: [],
        };
      })
    );

    return { success: true, patients: detailed };
  } catch (error) {
    console.error("[getCoordinatorPatientsDetailed]", error);
    return {
      success: false,
      patients: [],
      error: "Erreur lors du chargement des patients.",
    };
  }
}

/**
 * Get all patient IDs (simplified - returns all patients since we don't have coordinatorPatient model)
 */
export async function getCoordinatorPatientIds(coordinatorId: string) {
  try {
    const patients = await prisma.patient.findMany({
      select: { id: true },
    });
    return patients.map((p) => p.id);
  } catch {
    return [];
  }
}

/**
 * Escalate a coordinator alert to a higher severity level
 */
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
    const { NotificationService } =
      await import("@/lib/services/notification.service");
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

/**
 * Generate an escalation motif using AI or template fallback
 */
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

    function generateMotifFromAlert(
      alertType: string,
      severity: string,
      message: string
    ): string {
      const severityMap: Record<string, string> = {
        CRITICAL: "Critique",
        HIGH: "Élevée",
        MEDIUM: "Modérée",
        LOW: "Basse",
      };

      const severityLabel = severityMap[severity] || severity;

      const lowerMsg = message.toLowerCase();

      if (lowerMsg.includes("temperature")) {
        return `Alerte température ${severityLabel}: ${message}. Hospitalisation recommandée pour surveillance thermique.`;
      }
      if (
        lowerMsg.includes("tension") ||
        lowerMsg.includes("ta") ||
        lowerMsg.includes("tension artérielle")
      ) {
        return `Alerte TA ${severityLabel}: ${message}. Cardiologue consulté pour ajustement thérapeutique.`;
      }
      if (
        lowerMsg.includes("spo2") ||
        lowerMsg.includes("oxygène") ||
        lowerMsg.includes("saturation")
      ) {
        return `Alerte oxygénation ${severityLabel}: ${message}. Oxygénothérapie envisagée.`;
      }
      if (
        lowerMsg.includes("fréquence cardiaque") ||
        lowerMsg.includes("cœur") ||
        lowerMsg.includes("tachycardie")
      ) {
        return `Alerte cardiaque ${severityLabel}: ${message}. Monitoring continu recommandé.`;
      }
      if (lowerMsg.includes("poids") || lowerMsg.includes("fluide")) {
        return `Alerte métabolique ${severityLabel}: ${message}. Bilan sanguin demandé.`;
      }

      return `Alerte ${alertType.toLowerCase()} ${severityLabel}: ${message}. Intervention médicale requise selon protocole.`;
    }

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
        }
      }
    } catch (hfError) {
      console.log("[generateEscalationMotif HF fallback]");
    }

    if (!generatedMotif) {
      generatedMotif = generateMotifFromAlert(
        alert.alertType,
        alert.severity,
        alert.message
      );
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

/**
 * Get coordinator reminder history
 */
export async function getCoordinatorReminderHistory(limit = 50) {
  const auth = await requireCoordinator();
  if (!auth.ok || !auth.user) {
    return { success: false, reminders: [] };
  }

  try {
    // Get all notifications of type REMINDER
    const reminderNotifications = await prisma.notification.findMany({
      where: {
        type: "REMINDER",
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const remindersList = await Promise.all(
      reminderNotifications.map(async (notif: any) => {
        try {
          const recipient = await prisma.user.findUnique({
            where: { id: notif.recipientId },
            select: { firstName: true, lastName: true, email: true },
          });
          // Transform to match expected structure: { patient: { user: { ... } }, channels: [ ... ], ... }
          return {
            id: notif.id,
            message: notif.message,
            createdAt: notif.createdAt,
            channels: (notif.sentVia || []) as string[],
            patient: {
              user: recipient,
            },
          };
        } catch {
          return {
            id: notif.id,
            message: notif.message,
            createdAt: notif.createdAt,
            channels: (notif.sentVia || []) as string[],
            patient: null,
          };
        }
      })
    );

    return { success: true, reminders: remindersList };
  } catch (error) {
    console.error("[getCoordinatorReminderHistory error]", error);
    return { success: false, reminders: [], error: String(error) };
  }
}

/**
 * Get unified reviews from flags and alerts
 */
export async function getUnifiedReviews() {
  const auth = await requireCoordinator();
  if (!auth.ok || !auth.user) {
    return { success: false, reviews: [], stats: null };
  }

  try {
    const patientIds = await getCoordinatorPatientIds(auth.user.id);

    const alerts = await prisma.alert.findMany({
      where: {
        patientId: { in: patientIds },
        status: { in: [AlertStatus.OPEN, AlertStatus.ACKNOWLEDGED] },
      },
      orderBy: { createdAt: "desc" },
      include: {
        patient: {
          include: {
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
        vitalRecord: true,
        resolvedBy: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
      take: 50,
    });

    // Get doctor assignments for all patients
    // Map Patient.id to User.id for access grant lookup
    const patientUserIds = alerts
      .map((a: any) => a.patient.user.id)
      .filter((id): id is string => Boolean(id));

    console.log(
      "🔵 [getUnifiedReviews] Patient User IDs:",
      patientUserIds.slice(0, 3)
    );

    const accessGrants = await prisma.accessGrant.findMany({
      where: {
        patientId: { in: patientUserIds },
        isActive: true,
      },
      select: {
        patientId: true,
        doctorId: true,
      },
    });

    console.log(
      "🔵 [getUnifiedReviews] AccessGrants found:",
      accessGrants.length
    );

    // Get doctor details
    const doctorIds = [...new Set(accessGrants.map((ag: any) => ag.doctorId))];
    const doctors = await prisma.user.findMany({
      where: { id: { in: doctorIds } },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    const doctorById = Object.fromEntries(doctors.map((d: any) => [d.id, d]));

    const doctorByUserPatientId = Object.fromEntries(
      accessGrants.map((ag: any) => [ag.patientId, doctorById[ag.doctorId]])
    );

    console.log("🔵 [getUnifiedReviews] Doctors found:", {
      accessGrantsCount: accessGrants.length,
      doctorsCount: doctors.length,
      mappedCount: Object.keys(doctorByUserPatientId).length,
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let unifiedReviews: any[] = [];
    let stats = {
      total: alerts.length,
      critiques: 0,
      suspects: 0,
      incomplets: 0,
      closedToday: 0,
    };

    for (const a of alerts) {
      stats.critiques++;

      const patientUserIdKey = a.patient.user.id;
      const assignedDoctor = doctorByUserPatientId[patientUserIdKey];

      if (!assignedDoctor) {
        console.log(
          "⚠️ [getUnifiedReviews] No doctor found for patient:",
          a.patient.user.email,
          "User ID:",
          patientUserIdKey
        );
      }

      unifiedReviews.push({
        id: a.id,
        sourceType: "ALERT",
        patientId: a.patientId,
        patientName:
          `${a.patient.user.firstName || ""} ${a.patient.user.lastName || ""}`.trim() ||
          "Patient inconnu",
        patientEmail: a.patient.user.email,
        priority: a.severity === "CRITICAL" ? "haute" : "moyenne",
        reviewType: "Alerte",
        title: `Alerte ${a.severity} détectée`,
        note: a.message,
        createdAt: a.createdAt,
        vitalRecord: a.vitalRecord,
        alertStatus: a.status,
        isResolved:
          a.status === AlertStatus.RESOLVED || a.status === AlertStatus.CLOSED,
        resolvedBy: a.resolvedBy,
        resolvedAt: a.resolvedAt,
        assignedDoctor: assignedDoctor,
      } as any);
    }

    unifiedReviews.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    return { success: true, reviews: unifiedReviews, stats };
  } catch (error) {
    console.error("[getUnifiedReviews]", error);
    return { success: false, reviews: [], stats: null, error: String(error) };
  }
}

/**
 * Close a unified review (alert)
 */
export async function closeUnifiedReview(id: string, sourceType: string) {
  const auth = await requireCoordinator();
  if (!auth.ok || !auth.user) {
    return { success: false, error: auth.error };
  }

  try {
    // Only handle ALERT type (flags don't exist in this schema)
    if (sourceType === "ALERT") {
      await prisma.alert.update({
        where: { id },
        data: {
          status: "RESOLVED",
          resolvedById: auth.user.id,
          resolvedAt: new Date(),
          resolution: "Clôturé par le coordinateur",
        },
      });
    }

    revalidatePath("/dashboard/coordinator/reviews");
    return { success: true, message: "Signalement clôturé" };
  } catch (error) {
    return { success: false, error: "Impossible de clôturer l'élément." };
  }
}

/**
 * Request patient to re-measure vital signs
 */
export async function requestPatientReMeasure(patientId: string, note: string) {
  const auth = await requireCoordinator();
  if (!auth.ok || !auth.user) {
    return { success: false, error: auth.error };
  }

  try {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { user: true },
    });

    if (!patient || !patient.user) {
      return { success: false, error: "Patient non trouvé" };
    }

    // Send notification to patient via IN_APP
    await prisma.notification.create({
      data: {
        recipientId: patient.userId!,
        type: "REMINDER",
        title: "Demande de mesure",
        message: `Veuillez refaire vos mesures de constantes vitales: ${note}`,
        sentVia: ["IN_APP"],
      },
    });

    revalidatePath("/dashboard/coordinator/reviews");
    return { success: true, message: "Demande envoyée au patient" };
  } catch (error) {
    console.error("[requestPatientReMeasure]", error);
    return { success: false, error: "Impossible d'envoyer la demande" };
  }
}

/**
 * Helper function to check vital record completeness
 */
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

/**
 * Get detailed patient information for coordinator
 */
export async function getCoordinatorPatientDetail(patientId: string) {
  try {
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

    const vitalsWithCompleteness = patient.vitalRecords.map((v: any) => ({
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
  } catch (error) {
    console.error("[getCoordinatorPatientDetail]", error);
    return {
      success: false,
      error: "Erreur lors du chargement des détails du patient",
    };
  }
}

/**
 * Send coordinator reminder to patient
 */
export async function sendCoordinatorReminder(
  patientId: string,
  message: string,
  channels: ("IN_APP" | "EMAIL" | "SMS")[]
) {
  try {
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

    const patientUserId = patientRow.userId;
    const title = "Rappel — suivi post-hospitalisation";

    // Track which channels succeeded
    const results: { channel: string; success: boolean; error?: string }[] = [];

    // Always try to create IN_APP notification
    try {
      await prisma.notification.create({
        data: {
          recipientId: patientUserId,
          type: "REMINDER",
          title,
          message: `[Coordinateur] ${trimmed}`,
          sentVia: ["IN_APP"],
        },
      });
      results.push({ channel: "IN_APP", success: true });
    } catch (err) {
      results.push({ channel: "IN_APP", success: false, error: String(err) });
    }

    // Try EMAIL and SMS via NotificationService if requested
    if (ch.includes("EMAIL") || ch.includes("SMS")) {
      try {
        const { NotificationService } =
          await import("@/lib/services/notification.service");

        const emailSmsChannels = ch.filter((c) => c !== "IN_APP") as (
          | "EMAIL"
          | "SMS"
        )[];
        if (emailSmsChannels.length > 0) {
          await NotificationService.send({
            recipientId: patientUserId,
            type: "REMINDER",
            title,
            message: `[Coordinateur] ${trimmed}`,
            channels: emailSmsChannels,
            smsMessage: trimmed.slice(0, 160),
          });
          emailSmsChannels.forEach((c) =>
            results.push({ channel: c, success: true })
          );
        }
      } catch (notifError) {
        // Track which channels failed
        const errorMsg =
          notifError instanceof Error ? notifError.message : String(notifError);
        ch.filter((c) => c !== "IN_APP").forEach((c) => {
          results.push({ channel: c, success: false, error: errorMsg });
        });
        console.error(
          "[sendCoordinatorReminder] notification service error:",
          notifError
        );
      }
    }

    revalidatePath("/dashboard/coordinator");
    revalidatePath("/dashboard/coordinator/reminders");

    // Consider successful if at least IN_APP was sent
    const hasSuccessful = results.some((r) => r.success);
    if (hasSuccessful) {
      const successChannels = results
        .filter((r) => r.success)
        .map((r) => r.channel);
      const failedChannels = results
        .filter((r) => !r.success)
        .map((r) => r.channel);

      let message = `Rappel envoyé via ${successChannels.join(", ")}`;
      if (failedChannels.length > 0) {
        message += ` (${failedChannels.join(", ")} non disponible)`;
      }
      return { success: true, message };
    } else {
      return { success: false, error: "Impossible d'envoyer le rappel" };
    }
  } catch (error) {
    console.error("[sendCoordinatorReminder]", error);
    return { success: false, error: "Erreur lors de l'envoi du rappel" };
  }
}

/**
 * Flag a coordinator entry (vital record or other)
 */
export async function flagCoordinatorEntry(
  patientId: string,
  payload: {
    vitalRecordId?: string;
    flagType: "INCOMPLETE" | "SUSPICIOUS" | "OTHER";
    note: string;
  }
) {
  try {
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
          error:
            "Impossible de signaler une entrée complète à 100% comme incomplète.",
        };
      }
    }

    await prisma.alert.create({
      data: {
        patientId,
        alertType: AlertType.SYSTEM,
        severity: AlertSeverity.MEDIUM,
        message: `[Signalement coordinateur] ${note}`,
        status: AlertStatus.OPEN,
        data: {
          sourceType: payload.flagType,
          vitalRecordId: payload.vitalRecordId,
          coordinatorId: auth.user.id,
        },
      },
    });
    revalidatePath("/dashboard/coordinator");
    revalidatePath("/dashboard/coordinator/reviews");
    revalidatePath(`/dashboard/coordinator/patients/${patientId}`);
    return { success: true, message: "Signalement enregistré" };
  } catch (error) {
    console.error("[flagCoordinatorEntry]", error);
    return { success: false, error: "Erreur lors du signalement" };
  }
}

export async function ensurePatientLinkedToCoordinatorForGuide() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "PATIENT") {
      return { success: false, error: "Patient non authentifie" };
    }

    const coordinator = await prisma.user.findFirst({
      where: {
        role: "COORDINATOR",
        isActive: true,
      },
      select: {
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    if (!coordinator) {
      return {
        success: false,
        error: "Aucun coordinateur disponible pour le moment.",
      };
    }

    return {
      success: true,
      coordinator,
      alreadyLinked: true,
    };
  } catch (error) {
    console.error("[ensurePatientLinkedToCoordinatorForGuide]", error);
    return {
      success: false,
      error: "Impossible de charger les informations du coordinateur.",
    };
  }
}
