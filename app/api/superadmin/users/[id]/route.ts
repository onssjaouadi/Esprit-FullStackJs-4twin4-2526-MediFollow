/**
 * [NEW] SuperAdmin Single User API Route
 * GET    /api/superadmin/users/[id]  — get user
 * PATCH  /api/superadmin/users/[id]  — update user
 * DELETE /api/superadmin/users/[id]  — soft delete user
 */

import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/superadmin-middleware";
import {
  superAdminGetUser,
  superAdminUpdateUser,
  superAdminSoftDeleteUser,
} from "@/lib/actions/superadmin.actions";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireSuperAdmin(req);
  if (error) return error;
  const result = await superAdminGetUser(params.id);
  return NextResponse.json(result);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireSuperAdmin(req);
  if (error) return error;
  const body = await req.json();
  const result = await superAdminUpdateUser(params.id, body);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireSuperAdmin(req);
  if (error) return error;
  const { reason } = await req.json().catch(() => ({ reason: undefined }));
  const result = await superAdminSoftDeleteUser(params.id, reason);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
