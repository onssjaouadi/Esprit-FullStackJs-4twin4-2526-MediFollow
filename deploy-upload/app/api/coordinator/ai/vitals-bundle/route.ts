import { NextRequest, NextResponse } from "next/server";

import { triageAlertWithBiomedBERT } from "@/lib/services/hfBiomedAlert.service";
import {
  analyzeVitalsWithMistral,
  type ClinicalVitalsInput,
} from "@/lib/services/hfMistralClinical.service";

/**
 * Mistral (JSON clinique) + BiomedBERT sur un texte construit à partir des constantes et notes.
 */
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

    const body = (await req.json().catch(() => ({}))) as ClinicalVitalsInput & {
      triageText?: string;
    };

    const { triageText, ...vitals } = body;
    const clinical = await analyzeVitalsWithMistral(vitals);

    const textForBiomed =
      (typeof triageText === "string" && triageText.trim()) ||
      [
        clinical.resume,
        clinical.recommandationFR,
        `Paramètres à surveiller: ${clinical.parametresFlagges.join(", ")}`,
        `Notes: ${vitals.notes ?? ""}`,
        `Constantes: TA ${vitals.systolicBP}/${vitals.diastolicBP}, FC ${vitals.heartRate}, T° ${vitals.temperature}, SpO2 ${vitals.oxygenSaturation}`,
      ].join("\n");

    const triage = await triageAlertWithBiomedBERT({ text: textForBiomed });

    return NextResponse.json(
      {
        success: true,
        models: {
          mistral:
            process.env.HF_MISTRAL_MODEL ??
            "mistralai/Mistral-7B-Instruct-v0.3",
          biomedBERT:
            process.env.HF_BIOMED_BERT_MODEL ??
            "microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract",
        },
        clinical,
        triage,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[HF_VITALS_BUNDLE]", error);
    const detail =
      process.env.NODE_ENV !== "production"
        ? String((error as Error)?.message ?? error)
        : undefined;
    return NextResponse.json(
      {
        success: false,
        error: "Analyse combinée indisponible pour le moment.",
        detail,
      },
      { status: 500 }
    );
  }
}
