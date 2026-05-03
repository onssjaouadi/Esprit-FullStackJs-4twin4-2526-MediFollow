/**
 * Diagnostic API endpoint for doctor access troubleshooting
 */
import { NextRequest, NextResponse } from "next/server";
import { diagnoseDoctorAccess } from "@/lib/actions/patient.actions";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Diagnostic endpoint called");

    // Debug: Check cookies
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    console.log(
      "📍 Available cookies:",
      allCookies.map((c) => c.name).join(", ")
    );
    const accessToken = cookieStore.get("accessToken")?.value;
    console.log("📍 accessToken present:", !!accessToken);
    console.log(
      "📍 accessToken value:",
      accessToken ? `${accessToken.substring(0, 20)}...` : "null"
    );

    // Get current user
    const user = await getCurrentUser();
    console.log("👤 Current user:", user);

    if (!user) {
      console.log("❌ No user authenticated");
      return NextResponse.json(
        {
          success: false,
          error: "Not authenticated",
          debug: {
            message: "getCurrentUser() returned null",
            timestamp: new Date().toISOString(),
          },
        },
        { status: 401 }
      );
    }

    console.log("✅ User authenticated:", user.id, user.email, user.role);

    if (user.role !== "DOCTOR") {
      console.log("❌ User is not a doctor:", user.role);
      return NextResponse.json(
        {
          success: false,
          error: "Only doctors can run diagnostics",
          debug: {
            userRole: user.role,
          },
        },
        { status: 403 }
      );
    }

    console.log("🔍 Running diagnostic for doctor:", user.id);

    // Verify user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    console.log("🗄️ User in DB:", dbUser);

    if (!dbUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User exists in session but not in database",
          debug: {
            sessionUser: user,
            dbUser: null,
          },
        },
        { status: 500 }
      );
    }

    // Run diagnostic
    const diagnostic = await diagnoseDoctorAccess(user.id);

    console.log("✅ Diagnostic complete");

    return NextResponse.json({
      success: true,
      diagnostic,
      debug: {
        sessionUser: user,
        dbUser,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Diagnostic endpoint error:", error);
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        debug: {
          errorType:
            error instanceof Error ? error.constructor.name : "Unknown",
          errorMessage: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
