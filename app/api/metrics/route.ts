/**
 * app/api/metrics/route.ts
 * Prometheus metrics endpoint — accessible only to SUPERADMIN or internal network.
 * Exposes default Node.js metrics + custom MediFollow counters.
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/utils";
import prisma from "@/lib/prisma";

// ── prom-client singleton ─────────────────────────────────────────────────────
// We use a module-level singleton to avoid re-registering metrics on hot reload.

import {
  collectDefaultMetrics,
  Registry,
  Counter,
} from "prom-client";

declare global {
  // eslint-disable-next-line no-var
  var __prometheusRegistry: Registry | undefined;
  var __metricsInitialized: boolean | undefined;
}

function getRegistry(): Registry {
  if (!global.__prometheusRegistry) {
    global.__prometheusRegistry = new Registry();
  }
  return global.__prometheusRegistry;
}

function initMetrics(registry: Registry) {
  if (global.__metricsInitialized) return;
  global.__metricsInitialized = true;

  // Default Node.js metrics (memory, CPU, event loop lag, etc.)
  collectDefaultMetrics({ register: registry, prefix: "medifollow_node_" });

  // ── Custom counters ───────────────────────────────────────────────────────

  new Counter({
    name: "medifollow_vitals_submitted_total",
    help: "Total number of vital sign records submitted",
    labelNames: ["severity"],
    registers: [registry],
  });

  new Counter({
    name: "medifollow_alerts_triggered_total",
    help: "Total number of clinical alerts triggered",
    labelNames: ["severity", "role"],
    registers: [registry],
  });

  new Counter({
    name: "medifollow_auth_attempts_total",
    help: "Total number of authentication attempts",
    labelNames: ["status", "role"],
    registers: [registry],
  });
}

// ── Internal network check ────────────────────────────────────────────────────

function isInternalRequest(req: NextRequest): boolean {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim() ?? realIp ?? "unknown";

  const INTERNAL_RANGES = ["127.0.0.1", "::1", "10.", "172.16.", "172.17.", "192.168."];
  return INTERNAL_RANGES.some((prefix) => ip.startsWith(prefix));
}

// ── Auth guard ────────────────────────────────────────────────────────────────

async function isSuperAdmin(req: NextRequest): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) return false;
    const payload = verifyAccessToken(token);
    if (!payload) return false;
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    return user?.role === "SUPERADMIN";
  } catch {
    return false;
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Allow access from internal network (k8s pod-to-pod, Prometheus scraper)
  // OR from an authenticated SuperAdmin session
  const internal = isInternalRequest(req);
  const superAdmin = !internal && (await isSuperAdmin(req));

  if (!internal && !superAdmin) {
    return NextResponse.json(
      { error: "Forbidden: metrics endpoint is restricted to SuperAdmin or internal network" },
      { status: 403 }
    );
  }

  try {
    const registry = getRegistry();
    initMetrics(registry);

    const metrics = await registry.metrics();
    const contentType = registry.contentType;

    return new NextResponse(metrics, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // Prevent caching of metrics
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("[/api/metrics] Failed to collect metrics:", error);
    return NextResponse.json({ error: "Failed to collect metrics" }, { status: 500 });
  }
}

// Helpers exported for use in other API routes ─────────────────────────────────

/**
 * Increment the vitals submitted counter.
 * Call this from /api/vitals after a successful write.
 */
export function incrementVitalsCounter(severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "NORMAL") {
  try {
    const registry = getRegistry();
    const counter = registry.getSingleMetric("medifollow_vitals_submitted_total") as Counter<string> | undefined;
    counter?.labels({ severity }).inc();
  } catch { /* no-op if metrics not initialized */ }
}

/**
 * Increment the alerts triggered counter.
 */
export function incrementAlertsCounter(severity: string, role: string) {
  try {
    const registry = getRegistry();
    const counter = registry.getSingleMetric("medifollow_alerts_triggered_total") as Counter<string> | undefined;
    counter?.labels({ severity, role }).inc();
  } catch { /* no-op */ }
}

/**
 * Increment the auth attempts counter.
 */
export function incrementAuthCounter(status: "success" | "failure" | "blocked", role: string = "unknown") {
  try {
    const registry = getRegistry();
    const counter = registry.getSingleMetric("medifollow_auth_attempts_total") as Counter<string> | undefined;
    counter?.labels({ status, role }).inc();
  } catch { /* no-op */ }
}
