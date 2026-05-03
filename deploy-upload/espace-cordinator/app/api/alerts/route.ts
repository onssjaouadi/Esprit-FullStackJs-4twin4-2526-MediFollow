import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fs from "node:fs/promises";
import path from "node:path";

function normalizeExtendedJson(value: any): any {
  if (Array.isArray(value)) {
    return value.map(normalizeExtendedJson);
  }

  if (value && typeof value === "object") {
    if ("$oid" in value) {
      return String(value.$oid);
    }
    if ("$date" in value) {
      return new Date(value.$date).toISOString();
    }

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

export async function GET() {
  try {
    const alerts = await prisma.alert.findMany({
      where: {
        NOT: {
          AND: [
            { alertType: "SYSTEM" },
            { severity: "LOW" },
            { message: { contains: "collection 'alerts'", mode: "insensitive" } },
          ],
        },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        alertType: true,
        severity: true,
        status: true,
        message: true,
        patientId: true,
        createdAt: true,
        updatedAt: true,
        acknowledgedAt: true,
        resolvedAt: true,
      },
    });

    const mappedAlerts = alerts.map((alert: any) => ({
      id: String(alert.id),
      alertType: String(alert.alertType),
      severity: String(alert.severity),
      status: String(alert.status),
      message: alert.message ? String(alert.message) : "",
      patientId: String(alert.patientId),
      createdAt: alert.createdAt ? new Date(alert.createdAt).toISOString() : null,
      updatedAt: alert.updatedAt ? new Date(alert.updatedAt).toISOString() : null,
      acknowledgedAt: alert.acknowledgedAt ? new Date(alert.acknowledgedAt).toISOString() : null,
      resolvedAt: alert.resolvedAt ? new Date(alert.resolvedAt).toISOString() : null,
    }));

    if (mappedAlerts.length === 0) {
      // Fallback: read exported MongoDB alerts JSON from Downloads
      const exportPath = path.resolve(process.cwd(), "..", "medifollow.alerts.json");
      try {
        const fileContent = await fs.readFile(exportPath, "utf8");
        const raw = JSON.parse(fileContent);
        const fromFile = (Array.isArray(raw) ? raw : [])
          .map((doc: any) => {
          const normalized = normalizeExtendedJson(doc);
          return {
            id: normalized._id ? String(normalized._id) : "",
            alertType: normalized.alertType ? String(normalized.alertType) : "UNKNOWN",
            severity: normalized.severity ? String(normalized.severity) : "UNKNOWN",
            status: normalized.status ? String(normalized.status) : "UNKNOWN",
            message: normalized.message ? String(normalized.message) : "",
            patientId: normalized.patientId ? String(normalized.patientId) : "",
            createdAt: normalized.createdAt || null,
            updatedAt: normalized.updatedAt || null,
            acknowledgedAt: normalized.acknowledgedAt || null,
            resolvedAt: normalized.resolvedAt || null,
          };
          })
          .filter((alert: any) => !isDummySystemTestAlert(alert));

        return NextResponse.json({
          success: true,
          count: fromFile.length,
          source: "json-fallback",
          alerts: fromFile,
        });
      } catch {
        // ignore file fallback errors and return Prisma result
      }
    }

    return NextResponse.json({
      success: true,
      count: mappedAlerts.length,
      source: "prisma",
      alerts: mappedAlerts,
    });
  } catch (error) {
    console.error("MongoDB /api/alerts error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: "Failed to fetch alerts", detail: message },
      { status: 500 }
    );
  }
}
