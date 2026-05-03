/**
 * MediFollow - Alert Actions
 * Server actions for alert management with Infobip SMS Integration
 */

"use server";

import { revalidatePath } from "next/cache";
import { pusherServer } from "@/lib/pusher";
import prisma from "@/lib/prisma";
import clientPromise from "@/lib/mongodb";
import { getVitalStatus } from "@/lib/utils";
import fs from "node:fs/promises";
import path from "node:path";
import type { Prisma } from "@prisma/client";
import {
  AlertType,
  AlertSeverity,
  AlertStatus,
} from "@/types/medifollow.types";
import { notifyAlert, sendAdminAlertSMS } from "@/lib/actions/notification.actions";

/**
 * Vérifie les seuils vitaux et crée des alertes si nécessaire.
 */
export async function checkVitalThresholds(vitalRecord: any) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: vitalRecord.patientId },
      include: { user: true },
    });

    if (!patient || !patient.vitalThresholds) {
      return { success: false, error: "Données patient ou seuils manquants" };
    }

    const alerts: any[] = [];
    const thresholds = patient.vitalThresholds as any;

    // --- 1. Vérification Pression Systolique ---
    if (vitalRecord.systolicBP && thresholds.systolicBP) {
      const status = getVitalStatus(vitalRecord.systolicBP, thresholds.systolicBP.min, thresholds.systolicBP.max);
      if (status === "critical") {
        alerts.push({
          patientId: patient.id,
          alertType: AlertType.VITAL,
          severity: AlertSeverity.CRITICAL,
          message: `Pression systolique critique: ${vitalRecord.systolicBP} mmHg`,
          data: { vitalType: "systolicBP", value: vitalRecord.systolicBP, threshold: thresholds.systolicBP, vitalRecordId: vitalRecord.id },
        });
      }
    }

    // --- 2. Vérification Fréquence Cardiaque ---
    if (vitalRecord.heartRate && thresholds.heartRate) {
      const status = getVitalStatus(vitalRecord.heartRate, thresholds.heartRate.min, thresholds.heartRate.max);
      if (status === "critical") {
        alerts.push({
          patientId: patient.id,
          alertType: AlertType.VITAL,
          severity: AlertSeverity.CRITICAL,
          message: `Fréquence cardiaque critique: ${vitalRecord.heartRate} bpm`,
          data: { vitalType: "heartRate", value: vitalRecord.heartRate, threshold: thresholds.heartRate, vitalRecordId: vitalRecord.id },
        });
      }
    }

    // --- 3. Vérification Saturation Oxygène ---
    if (vitalRecord.oxygenSaturation && thresholds.oxygenSaturation) {
      const status = getVitalStatus(vitalRecord.oxygenSaturation, thresholds.oxygenSaturation.min, thresholds.oxygenSaturation.max);
      if (status === "critical") {
        alerts.push({
          patientId: patient.id,
          alertType: AlertType.VITAL,
          severity: AlertSeverity.CRITICAL,
          message: `Saturation en oxygène critique: ${vitalRecord.oxygenSaturation}%`,
          data: { vitalType: "oxygenSaturation", value: vitalRecord.oxygenSaturation, threshold: thresholds.oxygenSaturation, vitalRecordId: vitalRecord.id },
        });
      }
    }

    // --- 4. ENREGISTREMENT MONGODB ET NOTIFICATIONS LIÉES ---
    if (alerts.length > 0) {
      // Étape A: On ajoute d'abord dans MongoDB
      await prisma.alert.createMany({ data: alerts });

      const patientName = patient.user 
        ? `${patient.user.firstName} ${patient.user.lastName}` 
        : "Patient";

      // Étape B: On déclenche les notifications UNIQUEMENT après le succès de MongoDB
      // 1. Notification Pusher (Temps réel web)
      try {
        await pusherServer.trigger("admin-updates", "new-alert", {
          title: "🚨 ALERTE CRITIQUE",
          desc: `${patientName} : ${alerts[0].message}`,
        });
      } catch (pusherErr) {
        console.error("Pusher error:", pusherErr);
      }

      // 2. Notification SMS vers le numero d'escalade admin
      await sendAdminAlertSMS(`🚨 ALERTE CRITIQUE\nPatient: ${patientName}\nProblème: ${alerts[0].message}`);

      // 3. Email + SMS to patient, care team & admins
      await notifyAlert(
        patient.id,
        "🚨 ALERTE CRITIQUE",
        `${patientName} : ${alerts[0].message}`,
        { alertType: "VITAL", vitalRecordId: vitalRecord.id }
      );

      revalidatePath("/dashboard/admin");
      revalidatePath("/dashboard/doctor");
    }

    return { success: true, alertsCreated: alerts.length };
  } catch (error) {
    console.error("Check vital thresholds error:", error);
    return { success: false, error: "Erreur lors de la vérification" };
  }
}

/**
 * Déclenchement manuel d'une notification
 */
export async function triggerNewAlert(title: string, description: string) {
  try {
    // Si tu veux que le bouton manuel ajoute aussi une trace en MongoDB :
    // await prisma.alert.create({ data: { message: description, severity: AlertSeverity.INFO, ... } });

    // 1. Pusher
    await pusherServer.trigger("admin-updates", "new-alert", {
      title,
      desc: description,
    });

    // 2. SMS vers le numero d'escalade admin
    await sendAdminAlertSMS(`⚠️ MEDI-FOLLOW : ${title}\n${description}`);

    return { success: true };
  } catch (error) {
    console.error("Manual trigger error:", error);
    return { success: false, error: "Erreur lors du déclenchement" };
  }
}

/**
 * Récupère les alertes d'un patient spécifique
 */
export async function getPatientAlerts(patientId: string, status?: AlertStatus) {
  try {
    const where: any = { patientId };
    if (status) where.status = status;

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        patient: { include: { user: true } },
      },
    });
    return { success: true, alerts };
  } catch (error) {
    return { success: false, alerts: [] };
  }
}

/**
 * Récupère toutes les alertes (pour l'admin)
 */
export async function getAllAlerts(status?: AlertStatus) {
  try {
    const client = await clientPromise;
    // Use explicit DB name when provided, otherwise use default DB from DATABASE_URL
    const db = process.env.MONGODB_DB ? client.db(process.env.MONGODB_DB) : client.db();
    const filter: any = status ? { status } : {};
    filter.$nor = [
      {
        alertType: "SYSTEM",
        severity: "LOW",
        message: { $regex: "collection 'alerts'", $options: "i" },
      },
    ];

    // Auto-detect alert collection name to avoid naming mismatch issues
    const collections = await db.listCollections({}, { nameOnly: true }).toArray();
    const collectionName =
      collections.find((c: any) => c.name.toLowerCase() === "alerts")?.name ||
      collections.find((c: any) => c.name.toLowerCase().includes("alert"))?.name ||
      "alerts";

    const rawAlerts = await db
      .collection(collectionName)
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    const alerts = rawAlerts.map((alert: any) => ({
      id: alert?._id ? String(alert._id) : "",
      alertType: alert?.alertType ? String(alert.alertType) : "UNKNOWN",
      severity: alert?.severity ? String(alert.severity) : "UNKNOWN",
      status: alert?.status ? String(alert.status) : "UNKNOWN",
      message: alert?.message ? String(alert.message) : "",
      createdAt: alert?.createdAt ? new Date(alert.createdAt).toISOString() : null,
      acknowledgedAt: alert?.acknowledgedAt ? new Date(alert.acknowledgedAt).toISOString() : null,
      resolvedAt: alert?.resolvedAt ? new Date(alert.resolvedAt).toISOString() : null,
      patientId: alert?.patientId ? String(alert.patientId) : "",
      patient: null,
      acknowledgedBy: null,
      resolvedBy: null,
    }));

    return { success: true, alerts };
  } catch (error) {
    console.error("[DEBUG] getAllAlerts error:", error);
    return { success: false, alerts: [] };
  }
}

/**
 * Récupère une alerte par son ID
 */
export async function getAlertById(id: string) {
  try {
    const alert = await prisma.alert.findUnique({
      where: { id },
      include: {
        patient: { include: { user: true } },
        acknowledgedBy: true,
        resolvedBy: true,
      },
    });
    return { success: true, alert };
  } catch (error) {
    return { success: false, alert: null };
  }
}

/**
 * Marque une alerte comme "Prise en compte"
 */
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
    return { success: true, alert };
  } catch (error) {
    return { success: false };
  }
}

/**
 * Résout une alerte
 */
export async function resolveAlert(alertId: string, userId: string, resolution: string) {
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
    return { success: true, alert };
  } catch (error) {
    return { success: false };
  }
}

/**
 * Statistiques des alertes pour le Dashboard Admin
 */
export async function getAlertStats() {
  try {
    const realAlertsWhere: Prisma.AlertWhereInput = {
      NOT: {
        AND: [
          { alertType: "SYSTEM" },
          { severity: "LOW" },
          { message: { contains: "collection 'alerts'", mode: "insensitive" } },
        ],
      },
    };

    let [total, open, acknowledged, resolved, critical] = await Promise.all([
      prisma.alert.count({ where: realAlertsWhere }),
      prisma.alert.count({ where: { ...realAlertsWhere, status: AlertStatus.OPEN } }),
      prisma.alert.count({ where: { ...realAlertsWhere, status: AlertStatus.ACKNOWLEDGED } }),
      prisma.alert.count({ where: { ...realAlertsWhere, status: AlertStatus.RESOLVED } }),
      prisma.alert.count({ where: { ...realAlertsWhere, severity: AlertSeverity.CRITICAL } }),
    ]);

    // Fallback for environments where alerts are loaded from exported JSON
    if (total === 0) {
      try {
        const exportPath = path.resolve(process.cwd(), "..", "medifollow.alerts.json");
        const raw = await fs.readFile(exportPath, "utf8");
        const docs = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];

        const realDocs = docs.filter((d: any) => {
          const alertType = String(d?.alertType || "");
          const severity = String(d?.severity || "");
          const message = String(d?.message || "").toLowerCase();
          const isDummyTest =
            alertType === "SYSTEM" &&
            severity === "LOW" &&
            message.includes("collection 'alerts'");
          return !isDummyTest;
        });

        total = realDocs.length;
        open = realDocs.filter((d: any) => d?.status === "OPEN").length;
        acknowledged = realDocs.filter((d: any) => d?.status === "ACKNOWLEDGED").length;
        resolved = realDocs.filter((d: any) => d?.status === "RESOLVED").length;
        critical = realDocs.filter((d: any) => d?.severity === "CRITICAL").length;
      } catch {
        // Keep Prisma-derived values if fallback file is unavailable
      }
    }

    return {
      success: true,
      stats: { total, open, acknowledged, resolved, critical },
    };
  } catch (error) {
    return { success: false, stats: null };
  }
}
export async function createManualAlert(data: {
  patientId: string;
  message: string;
  severity: AlertSeverity;
}) {
  try {
    // 1. Récupérer les infos du patient (pour le nom et le téléphone)
    const patient = await prisma.patient.findUnique({
      where: { id: data.patientId },
      include: { user: true },
    });

    if (!patient) return { success: false, error: "Patient introuvable" };

    // 2. Enregistrement en base de données
    const newAlert = await prisma.alert.create({
      data: {
        patientId: data.patientId,
        message: data.message,
        alertType: AlertType.SYSTEM, // Type système pour les envois manuels
        severity: data.severity,
        status: AlertStatus.OPEN,
      },
    });

    const patientName = `${patient.user.firstName} ${patient.user.lastName}`;

    // 3. Notification Pusher (Dashboard)
    await pusherServer.trigger("admin-updates", "new-alert", {
      title: `Alerte Admin: ${data.severity}`,
      desc: `${patientName} : ${data.message}`,
    });

    await sendAdminAlertSMS(`⚠️ ALERTE ${data.severity}\nPatient: ${patientName}\nProblème: ${data.message}`);

    // 4. Email + SMS to patient, care team & admins
    await notifyAlert(
      data.patientId,
      `Alerte ${data.severity}`,
      data.message,
      { alertType: "SYSTEM", alertId: newAlert.id }
    );

    revalidatePath("/dashboard/admin/alerts");
    return { success: true, alert: newAlert };
  } catch (error) {
    console.error("Manual alert creation error:", error);
    return { success: false, error: "Erreur lors de la création de l'alerte" };
  }
}