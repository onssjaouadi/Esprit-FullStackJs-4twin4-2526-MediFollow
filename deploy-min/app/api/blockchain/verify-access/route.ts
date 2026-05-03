import { NextRequest, NextResponse } from "next/server";
import { verifyDoctorAccess } from "@/lib/actions/blockchain-access.actions";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const doctorAddress = searchParams.get("doctorAddress");
    const patientId = searchParams.get("patientId");

    if (!doctorAddress || !patientId) {
      return NextResponse.json(
        { error: "Doctor address and patient ID are required" },
        { status: 400 }
      );
    }

    const result = await verifyDoctorAccess(doctorAddress, patientId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Verify access error:", error);
    return NextResponse.json(
      { error: "Failed to verify access" },
      { status: 500 }
    );
  }
}
