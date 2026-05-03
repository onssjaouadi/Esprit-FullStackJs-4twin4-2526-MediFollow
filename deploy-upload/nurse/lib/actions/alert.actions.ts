/**
 * MediFollow - Alert Actions
 * Server actions for alert management
 */

"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { getVitalStatus } from "@/lib/utils";
import {
  AlertType,
  AlertSeverity,
  AlertStatus,
} from "@/types/medifollow.types";

export async function checkVitalThresholds(vitalRecord: any) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: vitalRecord.patientId },
      include: { user: true },
    });

    if (!patient || !patient.vitalThresholds) {
      return;
    }

    const alerts = [];

    // Check systolic BP
    if (vitalRecord.systolicBP && patient.vitalThresholds.systolicBP) {
      const status = getVitalStatus(
        vitalRecord.systolicBP,
        patient.vitalThresholds.systolicBP.min,
        patient.vitalThresholds.systolicBP.max
      );

      if (status === "critical") {
        alerts.push({
          patientId: patient.id,
          alertType: AlertType.VITAL,
          severity: AlertSeverity.CRITICAL,
          message: `Pression systolique critique: ${vitalRecord.systolicBP} mmHg`,
          data: {
            vitalType: "systolicBP",
            value: vitalRecord.systolicBP,
            threshold: patient.vitalThresholds.systolicBP,
            vitalRecordId: vitalRecord.id,
          },
        });
      } else if (status === "warning") {
        alerts.push({
          patientId: patient.id,
          alertType: AlertType.VITAL,
          severity: AlertSeverity.MEDIUM,
          message: `Pression systolique anormale: ${vitalRecord.systolicBP} mmHg`,
          data: {
            vitalType: "systolicBP",
            value: vitalRecord.systolicBP,
            threshold: patient.vitalThresholds.systolicBP,
            vitalRecordId: vitalRecord.id,
          },
        });
      }
    }

    // Check diastolic BP
    if (vitalRecord.diastolicBP && patient.vitalThresholds.diastolicBP) {
      const status = getVitalStatus(
        vitalRecord.diastolicBP,
        patient.vitalThresholds.diastolicBP.min,
        patient.vitalThresholds.diastolicBP.max
      );

      if (status === "critical") {
        alerts.push({
          patientId: patient.id,
          alertType: AlertType.VITAL,
          severity: AlertSeverity.CRITICAL,
          message: `Pression diastolique critique: ${vitalRecord.diastolicBP} mmHg`,
          data: {
            vitalType: "diastolicBP",
            value: vitalRecord.diastolicBP,
            threshold: patient.vitalThresholds.diastolicBP,
            vitalRecordId: vitalRecord.id,
          },
        });
      }
    }

    // Check heart rate
    if (vitalRecord.heartRate && patient.vitalThresholds.heartRate) {
      const status = getVitalStatus(
        vitalRecord.heartRate,
        patient.vitalThresholds.heartRate.min,
        patient.vitalThresholds.heartRate.max
      );

      if (status === "critical") {
        alerts.push({
          patientId: patient.id,
          alertType: AlertType.VITAL,
          severity: AlertSeverity.CRITICAL,
          message: `Fréquence cardiaque critique: ${vitalRecord.heartRate} bpm`,
          data: {
            vitalType: "heartRate",
            value: vitalRecord.heartRate,
            threshold: patient.vitalThresholds.heartRate,
            vitalRecordId: vitalRecord.id,
          },
        });
      }
    }

    // Check temperature
    if (vitalRecord.temperature && patient.vitalThresholds.temperature) {
      const status = getVitalStatus(
        vitalRecord.temperature,
        patient.vitalThresholds.temperature.min,
        patient.vitalThresholds.temperature.max
      );

      if (status === "critical") {
        alerts.push({
          patientId: patient.id,
          alertType: AlertType.VITAL,
          severity: AlertSeverity.HIGH,
          message: `Température anormale: ${vitalRecord.temperature}°C`,
          data: {
            vitalType: "temperature",
            value: vitalRecord.temperature,
            threshold: patient.vitalThresholds.temperature,
            vitalRecordId: vitalRecord.id,
          },
        });
      }
    }

    // Check oxygen saturation
    if (
      vitalRecord.oxygenSaturation &&
      patient.vitalThresholds.oxygenSaturation
    ) {
      const status = getVitalStatus(
        vitalRecord.oxygenSaturation,
        patient.vitalThresholds.oxygenSaturation.min,
        patient.vitalThresholds.oxygenSaturation.max
      );

      if (status === "critical") {
        alerts.push({
          patientId: patient.id,
          alertType: AlertType.VITAL,
          severity: AlertSeverity.CRITICAL,
          message: `Saturation en oxygène critique: ${vitalRecord.oxygenSaturation}%`,
          data: {
            vitalType: "oxygenSaturation",
            value: vitalRecord.oxygenSaturation,
            threshold: patient.vitalThresholds.oxygenSaturation,
            vitalRecordId: vitalRecord.id,
          },
        });
      }
    }

    // Create alerts
    if (alerts.length > 0) {
      await prisma.alert.createMany({
        data: alerts,
      });
    }

    return { success: true, alertsCreated: alerts.length };
  } catch (error) {
    console.error("Check vital thresholds error:", error);
    return {
      success: false,
      error: "Erreur lors de la vérification des seuils",
    };
  }
}

export async function getPatientAlerts(
  patientId: string,
  status?: AlertStatus
) {
  try {
    const where: any = { patientId };
    if (status) where.status = status;

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        patient: {
          include: { user: true },
        },
      },
    });

    return { success: true, alerts };
  } catch (error) {
    console.error("Get patient alerts error:", error);
    return { success: false, error: "Erreur", alerts: [] };
  }
}

export async function getAllAlerts(status?: AlertStatus) {
  try {
    const where: any = {};
    if (status) where.status = status;

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        patient: {
          include: { user: true },
        },
        acknowledgedBy: true,
        resolvedBy: true,
      },
    });

    return { success: true, alerts };
  } catch (error) {
    console.error("Get all alerts error:", error);
    return { success: false, error: "Erreur", alerts: [] };
  }
}

export async function acknowledgeAlert(alertId: string, userId: string) {
  try {
    const alert = await prisma.alert.update({
      where: { id: alertId },
      data: {
        status: AlertStatus.ACKNOWLEDGED,
        acknowledgedById: userId,
        acknowledgedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/doctor");
    revalidatePath("/dashboard/patient");

    return { success: true, message: "Alerte prise en compte", alert };
  } catch (error) {
    console.error("Acknowledge alert error:", error);
    return { success: false, error: "Erreur" };
  }
}

export async function resolveAlert(
  alertId: string,
  userId: string,
  resolution: string
) {
  try {
    const alert = await prisma.alert.update({
      where: { id: alertId },
      data: {
        status: AlertStatus.RESOLVED,
        resolvedById: userId,
        resolvedAt: new Date(),
        resolution,
      },
    });

    revalidatePath("/dashboard/doctor");
    revalidatePath("/dashboard/patient");

    return { success: true, message: "Alerte résolue", alert };
  } catch (error) {
    console.error("Resolve alert error:", error);
    return { success: false, error: "Erreur" };
  }
}

export async function getAlertStats() {
  try {
    const total = await prisma.alert.count();
    const open = await prisma.alert.count({
      where: { status: AlertStatus.OPEN },
    });
    const acknowledged = await prisma.alert.count({
      where: { status: AlertStatus.ACKNOWLEDGED },
    });
    const resolved = await prisma.alert.count({
      where: { status: AlertStatus.RESOLVED },
    });
    const critical = await prisma.alert.count({
      where: { severity: AlertSeverity.CRITICAL },
    });

    return {
      success: true,
      stats: { total, open, acknowledged, resolved, critical },
    };
  } catch (error) {
    console.error("Get alert stats error:", error);
    return { success: false, error: "Erreur", stats: null };
  }
}
