/**
 * MediFollow - Nurse Actions
 * Server actions for nurse-specific functionality
 */

"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  NurseProfile,
  NurseAssignment,
  NurseAssignmentInput,
  NurseProfileUpdateInput,
  NurseDashboardStats,
} from "@/types/medifollow.types";

/**
 * Get nurse profile by user ID
 */
export async function getNurseProfile(userId: string) {
  try {
    const profile = await prisma.nurseProfile.findUnique({
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
    console.error("Error fetching nurse profile:", error);
    return { success: false, error: "Failed to fetch nurse profile" };
  }
}

/**
 * Update nurse profile
 */
export async function updateNurseProfile(
  userId: string,
  data: NurseProfileUpdateInput
) {
  try {
    const profile = await prisma.nurseProfile.update({
      where: { userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/nurse/settings");
    return { success: true, data: profile };
  } catch (error) {
    console.error("Error updating nurse profile:", error);
    return { success: false, error: "Failed to update nurse profile" };
  }
}

/**
 * Get all patients assigned to a nurse
 */
export async function getAssignedPatients(nurseId: string) {
  try {
    const assignments = await prisma.nurseAssignment.findMany({
      where: {
        nurseId,
        isActive: true,
      },
      include: {
        // We'll manually fetch patient data
      },
    });

    // Fetch full patient details for each assignment
    const patientIds = assignments.map((a) => a.patientId);
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
        vitalRecords: {
          take: 1,
          orderBy: { recordedAt: "desc" },
        },
        alerts: {
          where: { status: "OPEN" },
        },
      },
    });

    return { success: true, data: patients };
  } catch (error) {
    console.error("Error fetching assigned patients:", error);
    return { success: false, error: "Failed to fetch assigned patients" };
  }
}

/**
 * Assign a patient to a nurse (and optionally to a doctor)
 */
export async function assignPatientToNurse(
  input: NurseAssignmentInput & { doctorUserId?: string }
) {
  try {
    // Create NurseAssignment
    const nurseAssignment = await prisma.nurseAssignment.create({
      data: {
        nurseId: input.nurseId,
        patientId: input.patientId,
        assignedBy: input.assignedBy,
        isActive: true,
      },
    });

    // If doctorUserId is provided, also create AccessGrant
    let accessGrant = null;
    if (input.doctorUserId) {
      // Get patient's user ID
      const patient = await prisma.patient.findUnique({
        where: { id: input.patientId },
        select: { userId: true },
      });

      if (patient?.userId) {
        accessGrant = await prisma.accessGrant.upsert({
          where: {
            patientId_doctorId: {
              patientId: patient.userId,
              doctorId: input.doctorUserId,
            },
          },
          update: { isActive: true },
          create: {
            patientId: patient.userId,
            doctorId: input.doctorUserId,
            isActive: true,
            durationDays: 365,
          },
        });

        console.log(
          `✅ [Nurse + Doctor Assignment] NurseAssignment created: ${nurseAssignment.id}`
        );
        console.log(`✅ [AccessGrant Created/Updated] ID: ${accessGrant.id}`);
      }
    }

    revalidatePath("/dashboard/nurse/patients");
    return { success: true, data: { nurseAssignment, accessGrant } };
  } catch (error) {
    console.error("Error assigning patient to nurse:", error);
    return { success: false, error: "Failed to assign patient to nurse" };
  }
}

/**
 * Remove patient assignment from nurse
 */
export async function unassignPatientFromNurse(
  nurseId: string,
  patientId: string
) {
  try {
    await prisma.nurseAssignment.updateMany({
      where: {
        nurseId,
        patientId,
      },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/nurse/patients");
    return { success: true };
  } catch (error) {
    console.error("Error unassigning patient from nurse:", error);
    return { success: false, error: "Failed to unassign patient from nurse" };
  }
}

/**
 * Get nurse dashboard statistics
 */
export async function getNurseDashboardStats(
  nurseId: string
): Promise<{ success: boolean; stats?: NurseDashboardStats; error?: string }> {
  try {
    // Get assigned patients
    const assignments = await prisma.nurseAssignment.findMany({
      where: {
        nurseId,
        isActive: true,
      },
    });

    const patientIds = assignments.map((a) => a.patientId);

    // Get active alerts for assigned patients
    const activeAlerts = await prisma.alert.count({
      where: {
        patientId: { in: patientIds },
        status: "OPEN",
      },
    });

    // Get today's entries made by this nurse
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const entriesMadeToday = await prisma.vitalRecord.count({
      where: {
        enteredBy: nurseId,
        createdAt: { gte: today },
      },
    });

    // Get recent entries made by this nurse
    const recentEntries = await prisma.vitalRecord.findMany({
      where: {
        enteredBy: nurseId,
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
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Check which patients need data entry today
    const patientsWithTodayVitals = await prisma.vitalRecord.findMany({
      where: {
        patientId: { in: patientIds },
        recordedAt: { gte: today },
      },
      select: { patientId: true },
      distinct: ["patientId"],
    });

    const patientsWithVitalsSet = new Set(
      patientsWithTodayVitals.map((v) => v.patientId)
    );
    const patientsNeedingDataEntry =
      patientIds.length - patientsWithVitalsSet.size;

    const stats: NurseDashboardStats = {
      totalAssignedPatients: patientIds.length,
      patientsNeedingDataEntry,
      activeAlerts,
      entriesMadeToday,
      recentEntries: recentEntries as any,
    };

    return { success: true, stats };
  } catch (error) {
    console.error("Error fetching nurse dashboard stats:", error);
    return { success: false, error: "Failed to fetch dashboard statistics" };
  }
}

/**
 * Get patients needing data entry today
 */
export async function getPatientsNeedingDataEntry(nurseId: string) {
  try {
    const assignments = await prisma.nurseAssignment.findMany({
      where: {
        nurseId,
        isActive: true,
      },
    });

    const patientIds = assignments.map((a) => a.patientId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get patients who haven't submitted vitals today
    const patientsWithTodayVitals = await prisma.vitalRecord.findMany({
      where: {
        patientId: { in: patientIds },
        recordedAt: { gte: today },
      },
      select: { patientId: true },
      distinct: ["patientId"],
    });

    const patientsWithVitalsSet = new Set(
      patientsWithTodayVitals.map((v) => v.patientId)
    );
    const patientsNeedingData = patientIds.filter(
      (id) => !patientsWithVitalsSet.has(id)
    );

    const patients = await prisma.patient.findMany({
      where: {
        id: { in: patientsNeedingData },
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

    return { success: true, data: patients };
  } catch (error) {
    console.error("Error fetching patients needing data entry:", error);
    return {
      success: false,
      error: "Failed to fetch patients needing data entry",
    };
  }
}

/**
 * Get alerts for nurse's assigned patients
 */
export async function getNursePatientAlerts(nurseId: string) {
  try {
    const assignments = await prisma.nurseAssignment.findMany({
      where: {
        nurseId,
        isActive: true,
      },
    });

    const patientIds = assignments.map((a) => a.patientId);

    const alerts = await prisma.alert.findMany({
      where: {
        patientId: { in: patientIds },
        status: { in: ["OPEN", "ACKNOWLEDGED"] },
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
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
    });

    return { success: true, data: alerts };
  } catch (error) {
    console.error("Error fetching nurse patient alerts:", error);
    return { success: false, error: "Failed to fetch patient alerts" };
  }
}

/**
 * Acknowledge alert (nurse can see but not resolve)
 */
export async function acknowledgeAlertAsNurse(
  alertId: string,
  nurseId: string
) {
  try {
    const alert = await prisma.alert.update({
      where: { id: alertId },
      data: {
        status: "ACKNOWLEDGED",
        acknowledgedById: nurseId,
        acknowledgedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/nurse/alerts");
    return { success: true, data: alert };
  } catch (error) {
    console.error("Error acknowledging alert:", error);
    return { success: false, error: "Failed to acknowledge alert" };
  }
}

/**
 * Check if a patient is assigned to a nurse
 */
export async function isPatientAssignedToNurse(
  nurseId: string,
  patientId: string
) {
  try {
    const assignment = await prisma.nurseAssignment.findFirst({
      where: {
        nurseId,
        patientId,
        isActive: true,
      },
    });

    return { success: true, data: !!assignment };
  } catch (error) {
    console.error("Error checking patient assignment:", error);
    return { success: false, error: "Failed to check patient assignment" };
  }
}

/**
 * Get notifications for a nurse
 */
export async function getNurseNotifications(userId: string) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        recipientId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    return { success: true, data: notifications };
  } catch (error) {
    console.error("Error fetching nurse notifications:", error);
    return { success: false, error: "Failed to fetch notifications" };
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });

    revalidatePath("/dashboard/nurse/notifications");
    return { success: true, data: notification };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: "Failed to mark notification as read" };
  }
}

export async function getNursePatients(nurseId: string) {
  const result = await getAssignedPatients(nurseId);
  return {
    success: result.success,
    patients: result.success ? result.data || [] : [],
    error: result.error,
  };
}

export async function getNurseReminders(nurseId: string) {
  try {
    const assignments = await prisma.nurseAssignment.findMany({
      where: {
        nurseId,
        isActive: true,
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
    });

    const patientUserIds = assignments
      .map((assignment) => assignment.patient?.userId)
      .filter((id): id is string => Boolean(id));

    const notifications = await prisma.notification.findMany({
      where: {
        recipientId: { in: patientUserIds },
        type: "REMINDER",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const reminderPatientMap = new Map(
      assignments.map((assignment) => [assignment.patient?.userId, assignment.patient])
    );

    const reminders = notifications.map((notification: any) => {
      const patient = reminderPatientMap.get(notification.recipientId) || null;
      const reminderData = (notification.data || {}) as Record<string, any>;

      return {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        reminderType: reminderData.reminderType || "GENERAL",
        priority: reminderData.priority || "NORMAL",
        scheduledFor: reminderData.scheduledFor || notification.createdAt,
        isSent: Array.isArray(notification.sentVia) && notification.sentVia.length > 0,
        isRead: notification.isRead,
        patient,
        patientName: patient?.user
          ? `${patient.user.firstName || ""} ${patient.user.lastName || ""}`.trim()
          : "Patient",
      };
    });

    return { success: true, reminders };
  } catch (error) {
    console.error("Error fetching nurse reminders:", error);
    return {
      success: false,
      reminders: [],
      error: "Failed to fetch nurse reminders",
    };
  }
}

export async function createPatientReminder(
  nurseId: string,
  patientId: string,
  payload: {
    title: string;
    message: string;
    reminderType: string;
    scheduledFor: Date;
    priority: string;
  }
) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: true,
      },
    });

    if (!patient?.userId) {
      return { success: false, error: "Patient not found" };
    }

    const reminder = await prisma.notification.create({
      data: {
        recipientId: patient.userId,
        type: "REMINDER",
        title: payload.title,
        message: payload.message,
        sentVia: [],
        data: {
          reminderType: payload.reminderType,
          priority: payload.priority,
          scheduledFor: payload.scheduledFor,
          nurseId,
          patientId,
        } as any,
      },
    });

    return {
      success: true,
      reminder: {
        ...reminder,
        reminderType: payload.reminderType,
        priority: payload.priority,
        scheduledFor: payload.scheduledFor,
        isSent: false,
        patient,
        patientName: `${patient.user.firstName || ""} ${patient.user.lastName || ""}`.trim(),
      },
    };
  } catch (error) {
    console.error("Error creating patient reminder:", error);
    return { success: false, error: "Failed to create patient reminder" };
  }
}

export async function sendPatientReminder(reminderId: string) {
  try {
    await prisma.notification.update({
      where: { id: reminderId },
      data: {
        sentVia: ["IN_APP"],
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending patient reminder:", error);
    return { success: false, error: "Failed to send patient reminder" };
  }
}
