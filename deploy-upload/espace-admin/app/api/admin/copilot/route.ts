import { NextResponse } from "next/server";
import { runAdminCopilot } from "@/lib/ai/admin-intelligence";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const query = typeof body?.query === "string" ? body.query : "";

    if (!query.trim()) {
      return NextResponse.json({ success: false, error: "Query is required" }, { status: 400 });
    }

    const result = await runAdminCopilot(query);
    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Copilot route failed",
      },
      { status: 500 }
    );
  }
}
