/**
 * [NEW] SuperAdmin Users API Route
 * GET  /api/superadmin/users  — list users (with filters)
 * POST /api/superadmin/users  — create user
 */

import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/superadmin-middleware";
import {
  superAdminGetUsers,
  superAdminCreateUser,
} from "@/lib/actions/superadmin.actions";

export async function GET(req: NextRequest) {
  const { error } = await requireSuperAdmin(req);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const result = await superAdminGetUsers({
    role: searchParams.get("role") ?? undefined,
    status: (searchParams.get("status") as any) ?? "all",
    search: searchParams.get("search") ?? "",
    page: Number(searchParams.get("page") ?? 1),
    pageSize: Number(searchParams.get("pageSize") ?? 20),
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const { error } = await requireSuperAdmin(req);
  if (error) return error;

  const body = await req.json();
  const result = await superAdminCreateUser(body);
  return NextResponse.json(result, { status: result.success ? 201 : 400 });
}
