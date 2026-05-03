/**
 * MediFollow - API Authentication Utilities
 * Utilities for extracting and validating user context in API routes
 */

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAccessToken, extractBearerToken } from "@/lib/utils";

/**
 * Get current user from NextRequest in API routes
 * Checks both Authorization header and cookies
 */
export async function getCurrentUserFromRequest(req: NextRequest) {
  try {
    let accessToken: string | null = null;

    // First, try to get token from Authorization header
    const authHeader = req.headers.get("authorization");
    accessToken = extractBearerToken(authHeader);
    console.log(
      "[Auth-API] Authorization header:",
      authHeader ? "present" : "missing"
    );

    // If not in header, try to get from cookies
    if (!accessToken) {
      const cookies = req.cookies;
      const allCookies = cookies.getAll();
      console.log(
        "[Auth-API] Available cookies:",
        allCookies.map((c) => c.name)
      );
      accessToken = cookies.get("accessToken")?.value || null;
      console.log(
        "[Auth-API] AccessToken from cookie:",
        accessToken ? "found" : "missing"
      );
    }

    if (!accessToken) {
      console.log("[Auth-API] No token found - returning null");
      return null;
    }

    // Verify and decode token
    const payload = verifyAccessToken(accessToken);
    console.log(
      "[Auth-API] Token verification:",
      payload ? "valid" : "invalid"
    );

    if (!payload) {
      return null;
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        patient: true,
        nurseProfile: true,
        coordinatorProfile: true,
      },
    });

    console.log(
      "[Auth-API] User lookup:",
      user ? `found ${user.email}` : "not found"
    );

    if (!user) {
      return null;
    }

    // Allow inactive patients to access questionnaire endpoints before approval
    // Inactive users of other roles should be rejected
    if (!user.isActive && user.role !== "PATIENT") {
      console.log("[Auth-API] User inactive and not a patient - rejecting");
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phoneNumber: user.phoneNumber,
      patient: user.patient,
      nurseProfile: user.nurseProfile,
      coordinatorProfile: user.coordinatorProfile,
    };
  } catch (error) {
    console.error("Error getting current user from request:", error);
    return null;
  }
}
