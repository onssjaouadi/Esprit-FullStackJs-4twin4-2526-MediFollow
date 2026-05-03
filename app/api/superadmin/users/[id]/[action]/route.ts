/**
 * [NEW] SuperAdmin user suspend/reactivate routes
 * POST /api/superadmin/users/[id]/suspend     — suspend
 * POST /api/superadmin/users/[id]/reactivate  — reactivate
 * POST /api/superadmin/users/[id]/restore     — restore deleted
 */

import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/superadmin-middleware";
import {
  superAdminSuspendUser,
  superAdminReactivateUser,
  superAdminRestoreUser,
} from "@/lib/actions/superadmin.actions";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; action: string } }
) {
  const { error } = await requireSuperAdmin(req);
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const { action } = params;

  if (action === "suspend") {
    const result = await superAdminSuspendUser(params.id, body.reason ?? "No reason provided", body.note);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  }
  if (action === "reactivate") {
    const result = await superAdminReactivateUser(params.id);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  }
  if (action === "restore") {
    const result = await superAdminRestoreUser(params.id);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
