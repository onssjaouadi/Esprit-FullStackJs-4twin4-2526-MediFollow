/**
 * MediFollow - Coordinator Actions
 * Server actions for coordinator-specific functionality
 */

"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  CoordinatorProfile,
  CoordinatorProfileUpdateInput,
  CommunicationCreateInput,
  CoordinatorDashboardStats,
  PatientComplianceDetail,
  ComplianceStatus,
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
export async function getPatientComplianceDetail(
  patientId: string
): Promise<{
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
      return requiredFields.some((field) => field === null || field === undefined);
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
