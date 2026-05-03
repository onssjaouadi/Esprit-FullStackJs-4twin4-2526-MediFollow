import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Return mock AI actions for alerts
    // In production, you would call Azure OpenAI here
    return NextResponse.json({
      success: true,
      summary: "Alert analysis based on vital signs and patient history.",
      actions: [
        {
          title: "Immediate Notification",
          rationale:
            "Patient vital sign is critically abnormal. Notify healthcare team immediately.",
          confidence: 0.98,
        },
        {
          title: "Patient Contact",
          rationale:
            "Reach out to patient to confirm symptoms and current status.",
          confidence: 0.95,
        },
        {
          title: "Medical Review",
          rationale:
            "Schedule urgent medical review based on vital sign readings.",
          confidence: 0.92,
        },
      ],
    });
  } catch (error) {
    console.error("Get alert next actions error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate actions" },
      { status: 500 }
    );
  }
}
