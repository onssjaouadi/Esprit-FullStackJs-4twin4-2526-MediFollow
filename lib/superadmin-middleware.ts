/**
 * MediFollow - SuperAdmin API Middleware
 * [NEW] Backend route guard for all /api/superadmin/* endpoints.
 * Checks role === 'SUPERADMIN' server-side — never trusts frontend alone.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAccessToken, extractBearerToken } from "@/lib/utils";

export async function requireSuperAdmin(req: NextRequest) {
  let token: string | null = null;

  // 1. Try Authorization header
  const authHeader = req.headers.get("authorization");
  token = extractBearerToken(authHeader);

  // 2. Fall back to cookie
  if (!token) {
    token = req.cookies.get("accessToken")?.value ?? null;
  }

  if (!token) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return {
      user: null,
      error: NextResponse.json({ error: "Invalid token" }, { status: 401 }),
    };
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });

  if (!user || user.role !== "SUPERADMIN" || !user.isActive) {
    return {
      user: null,
      error: NextResponse.json({ error: "Forbidden — SuperAdmin only" }, { status: 403 }),
    };
  }

  return { user, error: null };
}
