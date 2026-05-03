import { NextRequest, NextResponse } from "next/server";

import {
  analyzeVitalsWithMistral,
  type ClinicalVitalsInput,
} from "@/lib/services/hfMistralClinical.service";

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

    const body = (await req.json().catch(() => ({}))) as ClinicalVitalsInput;
    const result = await analyzeVitalsWithMistral(body);

    return NextResponse.json(
      { success: true, clinical: result },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[HF_CLINICAL_MISTRAL]", error);
    const detail =
      process.env.NODE_ENV !== "production"
        ? String((error as Error)?.message ?? error)
        : undefined;
    return NextResponse.json(
      {
        success: false,
        error: "Analyse clinique (Mistral) indisponible pour le moment.",
        detail,
      },
      { status: 500 }
    );
  }
}
