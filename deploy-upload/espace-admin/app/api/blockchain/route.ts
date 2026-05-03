import { NextRequest, NextResponse } from "next/server";
import { getBlockchainProofs, getBlockchainStats } from "@/lib/actions/blockchain.actions";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "stats") {
    const result = await getBlockchainStats();
    return NextResponse.json(result);
  }

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status") || undefined;

  const result = await getBlockchainProofs(page, limit, status);
  return NextResponse.json(result);
}
