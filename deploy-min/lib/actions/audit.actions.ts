"use server";

import { prisma } from "@/lib/prisma";
import { AuditAction } from "@prisma/client";

export async function getAuditLogs(filters?: {
  action?: string;
  entityType?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        ...(filters?.action && { action: filters.action }),
        ...(filters?.entityType && { entityType: filters.entityType }),
        ...(filters?.userId && { userId: filters.userId }),
        ...(filters?.startDate &&
          filters?.endDate && {
            timestamp: {
              gte: filters.startDate,
              lte: filters.endDate,
            },
          }),
      },
      orderBy: { timestamp: "desc" },
      take: filters?.limit || 100,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    // Serialize dates to ISO strings for client-side compatibility
    return logs.map((log) => ({
      ...log,
      timestamp: log.timestamp.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    throw error;
  }
}

export async function getAuditStats(startDate: Date, endDate: Date) {
  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const stats = {
      totalActions: logs.length,
      actionsByType: {} as Record<string, number>,
      actionsByEntity: {} as Record<string, number>,
      actionsByUser: {} as Record<string, number>,
    };

    logs.forEach((log) => {
      stats.actionsByType[log.action] =
        (stats.actionsByType[log.action] || 0) + 1;
      stats.actionsByEntity[log.entityType] =
        (stats.actionsByEntity[log.entityType] || 0) + 1;
      const userEmail = log.userId; // We'll enrich this in the component
      stats.actionsByUser[userEmail] =
        (stats.actionsByUser[userEmail] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error("Error fetching audit stats:", error);
    throw error;
  }
}

export async function getUserList() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
      orderBy: { email: "asc" },
    });

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function getLoginHistory(userId?: string, days: number = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const loginLogs = await prisma.auditLog.findMany({
      where: {
        action: "LOGIN",
        ...(userId && { userId }),
        timestamp: {
          gte: startDate,
        },
      },
      orderBy: { timestamp: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return loginLogs.map((log) => ({
      ...log,
      timestamp: log.timestamp.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching login history:", error);
    throw error;
  }
}

export async function getPatientModificationHistory(patientId: string) {
  try {
    const modificationLogs = await prisma.auditLog.findMany({
      where: {
        entityType: "Patient",
        entityId: patientId,
      },
      orderBy: { timestamp: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return modificationLogs.map((log) => ({
      ...log,
      timestamp: log.timestamp.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching patient modification history:", error);
    throw error;
  }
}

export async function getVitalSignModificationHistory(vitalRecordId: string) {
  try {
    const modificationLogs = await prisma.auditLog.findMany({
      where: {
        entityType: "VitalRecord",
        entityId: vitalRecordId,
      },
      orderBy: { timestamp: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return modificationLogs.map((log) => ({
      ...log,
      timestamp: log.timestamp.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching vital sign modification history:", error);
    throw error;
  }
}

export async function getAlertModificationHistory(alertId: string) {
  try {
    const modificationLogs = await prisma.auditLog.findMany({
      where: {
        entityType: "Alert",
        entityId: alertId,
      },
      orderBy: { timestamp: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return modificationLogs.map((log) => ({
      ...log,
      timestamp: log.timestamp.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching alert modification history:", error);
    throw error;
  }
}
