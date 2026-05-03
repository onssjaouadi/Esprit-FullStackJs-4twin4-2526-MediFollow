/**
 * [NEW] SuperAdmin Stats API
 * GET /api/superadmin/stats
 */

import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/superadmin-middleware";
import { getSuperAdminStats } from "@/lib/actions/superadmin.actions";

export async function GET(req: NextRequest) {
  const { error } = await requireSuperAdmin(req);
  if (error) return error;

  const result = await getSuperAdminStats();
  return NextResponse.json(result);
}
