import { NextRequest, NextResponse } from "next/server";

import {
  generateVitalVideoGuide,
  type VitalGuideRequest,
} from "@/lib/services/hfVitalGuide.service";

type VideoScene = {
  title: string;
  voiceover: string;
  onScreen: string[];
  durationSec: number;
};

function normalizeText(value: string) {
  return value.replace(/\r\n/g, "\n").trim();
}

function extractScenes(script: string): VideoScene[] {
  const text = normalizeText(script);
  const sceneHeaderRegex = /Sc[èe]ne\s*\d+\s*[:\-]\s*(.*)/gi;
  const headers = [...text.matchAll(sceneHeaderRegex)];

  if (headers.length === 0) {
    const chunk = text.slice(0, 1200);
    return [
      {
        title: "Guide patient",
        voiceover: chunk,
        onScreen: [
          "Installez-vous calmement",
          "Prenez chaque mesure correctement",
          "Validez les données dans MediFollow",
        ],
        durationSec: 20,
      },
    ];
  }

  const scenes: VideoScene[] = [];
  for (let i = 0; i < headers.length; i++) {
    const match = headers[i];
    const start = match.index ?? 0;
    const end =
      i < headers.length - 1
        ? (headers[i + 1].index ?? text.length)
        : text.length;
    const block = text.slice(start, end).trim();
    const title = (match[1] || `Scène ${i + 1}`).trim();
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .filter((l) => !/^Sc[èe]ne\s*\d+/i.test(l));

    const bullets = lines
      .filter((l) => /^[-*•]/.test(l))
      .map((l) => l.replace(/^[-*•]\s*/, ""))
      .slice(0, 4);

    const voiceover = lines.join(" ").slice(0, 1200);
    scenes.push({
      title: title || `Scène ${i + 1}`,
      voiceover: voiceover || "Suivez les instructions affichées à l'écran.",
      onScreen:
        bullets.length > 0
          ? bullets
          : [
              "Position correcte du patient",
              "Mesure précise et calme",
              "Saisie des valeurs dans l'application",
            ],
      durationSec: 18,
    });
  }

  return scenes;
}

export async function POST(req: NextRequest) {
  try {
    // Vérification explicite du token pour un message d'erreur plus clair
    if (!process.env.token && !process.env.HF_API_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Aucun token Hugging Face trouvé côté serveur. Ajoute token="..." dans ton fichier .env puis redémarre npm run dev.',
        },
        { status: 500 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as VitalGuideRequest;

    const result = await generateVitalVideoGuide({
      language: body.language ?? "fr",
      patientProfile: body.patientProfile,
    });

    return NextResponse.json(
      {
        success: true,
        script: result.script,
        videoPlan: {
          title: "Guide vidéo généré par IA",
          scenes: extractScenes(result.script),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[HF_VITAL_GUIDE]", error);
    const detail =
      process.env.NODE_ENV !== "production"
        ? String(error?.message ?? error)
        : undefined;
    return NextResponse.json(
      {
        success: false,
        error: "Impossible de générer le guide vidéo pour l'instant.",
        detail,
      },
      { status: 500 }
    );
  }
}
