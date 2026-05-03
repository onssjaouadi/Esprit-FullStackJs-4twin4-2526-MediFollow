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
  data: NurseProfileUpdateInput,
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
 * Assign a patient to a nurse
 */
export async function assignPatientToNurse(input: NurseAssignmentInput) {
  try {
    const assignment = await prisma.nurseAssignment.create({
      data: {
        nurseId: input.nurseId,
        patientId: input.patientId,
        assignedBy: input.assignedBy,
        isActive: true,
      },
    });

    revalidatePath("/dashboard/nurse/patients");
    return { success: true, data: assignment };
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
  patientId: string,
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
  nurseId: string,
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
      patientsWithTodayVitals.map((v) => v.patientId),
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
      patientsWithTodayVitals.map((v) => v.patientId),
    );
    const patientsNeedingData = patientIds.filter(
      (id) => !patientsWithVitalsSet.has(id),
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
  nurseId: string,
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
  patientId: string,
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
