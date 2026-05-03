import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fs from "node:fs/promises";
import path from "node:path";

function normalizeExtendedJson(value: any): any {
  if (Array.isArray(value)) return value.map(normalizeExtendedJson);

  if (value && typeof value === "object") {
    if ("$oid" in value) return String((value as any).$oid);
    if ("$date" in value) return new Date((value as any).$date).toISOString();

    const normalized: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      normalized[key] = normalizeExtendedJson(val);
    }
    return normalized;
  }

  return value;
}

function isDummySystemTestAlert(alert: { alertType?: string; severity?: string; message?: string }) {
  return (
    String(alert.alertType || "") === "SYSTEM" &&
    String(alert.severity || "") === "LOW" &&
    String(alert.message || "").toLowerCase().includes("collection 'alerts'")
  );
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const alert = await prisma.alert.findUnique({
      where: { id },
      select: {
        id: true,
        alertType: true,
        severity: true,
        status: true,
        message: true,
        resolution: true,
        patientId: true,
        data: true,
        createdAt: true,
        updatedAt: true,
        acknowledgedAt: true,
        resolvedAt: true,
        patient: {
          select: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
              },
            },
          },
        },
        acknowledgedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        resolvedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (alert && !isDummySystemTestAlert(alert as any)) {
      return NextResponse.json({
        success: true,
        source: "prisma",
        alert: {
          id: String(alert.id),
          alertType: String(alert.alertType),
          severity: String(alert.severity),
          status: String(alert.status),
          message: alert.message ? String(alert.message) : "",
          resolution: alert.resolution ? String(alert.resolution) : null,
          patientId: String(alert.patientId),
          data: alert.data ?? null,
          patient: alert.patient
            ? {
                user: {
                  id: String(alert.patient.user.id),
                  email: String(alert.patient.user.email),
                  firstName: String(alert.patient.user.firstName),
                  lastName: String(alert.patient.user.lastName),
                  phoneNumber: alert.patient.user.phoneNumber ? String(alert.patient.user.phoneNumber) : null,
                },
              }
            : null,
          acknowledgedBy: alert.acknowledgedBy
            ? {
                firstName: String(alert.acknowledgedBy.firstName),
                lastName: String(alert.acknowledgedBy.lastName),
              }
            : null,
          resolvedBy: alert.resolvedBy
            ? {
                firstName: String(alert.resolvedBy.firstName),
                lastName: String(alert.resolvedBy.lastName),
              }
            : null,
          createdAt: alert.createdAt ? new Date(alert.createdAt).toISOString() : null,
          updatedAt: alert.updatedAt ? new Date(alert.updatedAt).toISOString() : null,
          acknowledgedAt: alert.acknowledgedAt ? new Date(alert.acknowledgedAt).toISOString() : null,
          resolvedAt: alert.resolvedAt ? new Date(alert.resolvedAt).toISOString() : null,
        },
      });
    }

    const exportPath = path.resolve(process.cwd(), "..", "medifollow.alerts.json");
    const fileContent = await fs.readFile(exportPath, "utf8");
    const raw = JSON.parse(fileContent);
    const docs = Array.isArray(raw) ? raw : [];

    const found = docs.find((doc: any) => {
      const oid = doc?._id?.$oid;
      return String(oid) === String(id);
    });

    if (!found) {
      return NextResponse.json({ success: false, error: "Alert not found" }, { status: 404 });
    }

    const normalized = normalizeExtendedJson(found);

    if (isDummySystemTestAlert(normalized)) {
      return NextResponse.json({ success: false, error: "Alert not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      source: "json-fallback",
      alert: {
        id: normalized._id ? String(normalized._id) : String(id),
        alertType: normalized.alertType ? String(normalized.alertType) : "UNKNOWN",
        severity: normalized.severity ? String(normalized.severity) : "UNKNOWN",
        status: normalized.status ? String(normalized.status) : "UNKNOWN",
        message: normalized.message ? String(normalized.message) : "",
        resolution: normalized.resolution ?? null,
        patientId: normalized.patientId ? String(normalized.patientId) : "",
        data: normalized.data ?? null,
        createdAt: normalized.createdAt ?? null,
        updatedAt: normalized.updatedAt ?? null,
        acknowledgedAt: normalized.acknowledgedAt ?? null,
        resolvedAt: normalized.resolvedAt ?? null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: "Failed to fetch alert", detail: message },
      { status: 500 }
    );
  }
}
