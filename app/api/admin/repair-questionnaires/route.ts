"use server";

import { NextResponse } from "next/server";
import { repairQuestionnaireOptions } from "@/lib/actions/questionnaire.actions";

export async function POST() {
  try {
    const result = await repairQuestionnaireOptions();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Repair API error:", error);
    return NextResponse.json(
      { success: false, error: "Repair failed" },
      { status: 500 }
    );
  }
}
