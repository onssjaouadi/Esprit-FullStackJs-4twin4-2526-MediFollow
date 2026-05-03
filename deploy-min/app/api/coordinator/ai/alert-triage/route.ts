import { NextRequest, NextResponse } from "next/server";

import { triageAlertWithBiomedBERT } from "@/lib/services/hfBiomedAlert.service";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.token && !process.env.HF_API_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Aucun token Hugging Face (token ou HF_API_TOKEN) dans .env — redémarrez le serveur après ajout.",
        },
        { status: 500 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as { text?: string };
    const text = typeof body.text === "string" ? body.text : "";
    const result = await triageAlertWithBiomedBERT({ text });

    return NextResponse.json(
      { success: true, triage: result },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[HF_BIOMED_TRIAGE]", error);
    const detail =
      process.env.NODE_ENV !== "production"
        ? String((error as Error)?.message ?? error)
        : undefined;
    return NextResponse.json(
      {
        success: false,
        error: "Triage BiomedBERT indisponible pour le moment.",
        detail,
      },
      { status: 500 }
    );
  }
}
