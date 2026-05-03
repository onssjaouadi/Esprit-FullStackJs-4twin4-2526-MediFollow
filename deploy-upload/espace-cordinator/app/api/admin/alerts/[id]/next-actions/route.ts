import { NextResponse } from "next/server";
import { getNextBestActionsForAlert } from "@/lib/ai/admin-intelligence";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await getNextBestActionsForAlert(params.id);
    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate actions",
      },
      { status: 500 }
    );
  }
}
