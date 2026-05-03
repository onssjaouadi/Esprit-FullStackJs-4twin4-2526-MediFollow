import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getAssignedPatients } from "@/lib/actions/nurse.actions";
import { NextResponse } from "next/server";

/**
 * Debug endpoint to check why patients aren't loading
 * Access via: GET /api/debug/nurse-patients
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated", status: "NOT_AUTH" },
        { status: 401 }
      );
    }

    if (user.role !== "NURSE") {
      return NextResponse.json(
        {
          error: `User role is ${user.role}, expected NURSE`,
          status: "WRONG_ROLE",
          userId: user.id,
        },
        { status: 403 }
      );
    }

    const result = await getAssignedPatients(user.id);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          status: "QUERY_FAILED",
          userId: user.id,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "OK",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      patientCount: result.data?.length || 0,
      patients: result.data?.map((p) => ({
        id: p.id,
        name: `${p.user.firstName} ${p.user.lastName}`,
        mrn: p.medicalRecordNumber,
        isActive: p.isActive,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        status: "ERROR",
      },
      { status: 500 }
    );
  }
}
