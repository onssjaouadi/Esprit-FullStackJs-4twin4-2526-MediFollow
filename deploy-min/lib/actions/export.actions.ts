"use server";

import { prisma } from "@/lib/prisma";

export async function getExportablePatients() {
  try {
    const patients = await prisma.patient.findMany({
      where: {
        user: { isActive: true },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      patients: patients.map((p) => ({
        id: p.id,
        name: `${p.user.firstName} ${p.user.lastName}`.trim(),
        email: p.user.email,
        phone: p.user.phoneNumber || "",
        medicalRecordNumber: p.medicalRecordNumber,
        dateOfBirth: p.dateOfBirth,
        gender: p.gender,
        bloodType: p.bloodType || "",
        diagnosis: p.diagnosis || "",
        dischargeDate: p.dischargeDate,
        isActive: p.isActive,
        createdAt: p.createdAt,
      })),
    };
  } catch (error) {
    console.error("Export patients error:", error);
    return { success: false, patients: [], error: "Failed to load patients" };
  }
}

export async function getExportableVitals(patientId?: string) {
  try {
    const where = patientId ? { patientId } : {};
    const vitals = await prisma.vitalRecord.findMany({
      where,
      include: {
        patient: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { recordedAt: "desc" },
      take: 1000,
    });

    return {
      success: true,
      vitals: vitals.map((v) => ({
        id: v.id,
        patient:
          `${v.patient.user.firstName} ${v.patient.user.lastName}`.trim(),
        patientId: v.patientId,
        systolicBP: v.systolicBP,
        diastolicBP: v.diastolicBP,
        heartRate: v.heartRate,
        temperature: v.temperature,
        oxygenSaturation: v.oxygenSaturation,
        weight: v.weight,
        notes: v.notes || "",
        recordedAt: v.recordedAt,
      })),
    };
  } catch (error) {
    console.error("Export vitals error:", error);
    return { success: false, vitals: [], error: "Failed to load vitals" };
  }
}

export async function getExportableAlerts() {
  try {
    const alerts = await prisma.alert.findMany({
      include: {
        patient: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 1000,
    });

    return {
      success: true,
      alerts: alerts.map((a) => ({
        id: a.id,
        patient:
          `${a.patient.user.firstName} ${a.patient.user.lastName}`.trim(),
        alertType: a.alertType,
        severity: a.severity,
        status: a.status,
        message: a.message,
        createdAt: a.createdAt,
        resolvedAt: a.resolvedAt,
      })),
    };
  } catch (error) {
    console.error("Export alerts error:", error);
    return { success: false, alerts: [], error: "Failed to load alerts" };
  }
}
