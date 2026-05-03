/**
 * [NEW] SuperAdmin Audit Logs API
 * GET /api/superadmin/audit-logs
 */

import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/superadmin-middleware";
import { superAdminGetAuditLogs } from "@/lib/actions/superadmin.actions";

export async function GET(req: NextRequest) {
  const { error } = await requireSuperAdmin(req);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const result = await superAdminGetAuditLogs({
    page: Number(searchParams.get("page") ?? 1),
    pageSize: Number(searchParams.get("pageSize") ?? 50),
    action: searchParams.get("action") ?? undefined,
    severity: searchParams.get("severity") ?? undefined,
    actorId: searchParams.get("actorId") ?? undefined,
    targetId: searchParams.get("targetId") ?? undefined,
    startDate: searchParams.get("startDate") ?? undefined,
    endDate: searchParams.get("endDate") ?? undefined,
    search: searchParams.get("search") ?? undefined,
  });

  return NextResponse.json(result);
}
