import { getCurrentUser } from "@/lib/actions/auth.actions";
import { reclassifyAllVitals } from "@/lib/actions/vital.actions";
import { NextResponse } from "next/server";

/**
 * API endpoint to reclassify all vital records with AI
 * ADMIN ONLY - Fixes vitals with incorrect status from previous classification
 *
 * Usage: POST /api/admin/reclassify-vitals
 *
 * This should only be run once to fix historical data, or when needed
 */
export async function POST() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    console.log("[ReclassifyVitals API] Started by admin:", user.id);

    const result = await reclassifyAllVitals();
    console.log("[ReclassifyVitals API] Result:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[ReclassifyVitals API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to reclassify vitals",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check admin access and show status
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      message: "POST to this endpoint to reclassify all vital records with AI",
      endpoint: "/api/admin/reclassify-vitals",
      method: "POST",
      requiresAuth: "ADMIN",
      description:
        "Reclassifies all historical vital records using AI classification to fix potentially incorrect status values",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
