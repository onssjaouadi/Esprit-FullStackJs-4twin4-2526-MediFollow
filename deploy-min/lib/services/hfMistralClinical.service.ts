/**
 * Mistral-7B-Instruct – analyse clinique structurée (JSON)
 * Modèle par défaut: mistralai/Mistral-7B-Instruct-v0.3
 */

"use server";

import { HF_ROUTER_V1, getHFToken } from "@/lib/services/hfInference.shared";

export type ClinicalVitalsInput = {
  systolicBP?: number | null;
  diastolicBP?: number | null;
  heartRate?: number | null;
  temperature?: number | null;
  oxygenSaturation?: number | null;
  weight?: number | null;
  notes?: string | null;
  patientContext?: {
    age?: number;
    pathology?: string;
    dischargeDate?: string;
  };
};

export type ClinicalAnalysisResult = {
  scoreRisque: number;
  recommandationFR: string;
  parametresFlagges: string[];
  resume: string;
};

function extractJsonObject(text: string): ClinicalAnalysisResult | null {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(trimmed.slice(start, end + 1)) as ClinicalAnalysisResult;
    if (typeof parsed.scoreRisque !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function analyzeVitalsWithMistral(
  vitals: ClinicalVitalsInput
): Promise<ClinicalAnalysisResult> {
  const token = getHFToken();
  const model =
    process.env.HF_MISTRAL_MODEL ?? "mistralai/Mistral-7B-Instruct-v0.3";

  const prompt = `Tu es un assistant d'aide à la décision pour un coordinateur de suivi post-hospitalisation (MediFollow).
Analyse les constantes vitales ci-dessous. Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans texte avant ou après.

Schéma JSON exact:
{
  "scoreRisque": <nombre entier 0-100>,
  "recommandationFR": "<conseils concrets pour le patient ou le coordinateur, en français, 2-4 phrases>",
  "parametresFlagges": ["<liste des mesures ou situations à surveiller, ex: TA élevée>"],
  "resume": "<une phrase courte>"
}

Constantes:
- TA systolique: ${vitals.systolicBP ?? "N/A"}
- TA diastolique: ${vitals.diastolicBP ?? "N/A"}
- Fréquence cardiaque: ${vitals.heartRate ?? "N/A"} bpm
- Température: ${vitals.temperature ?? "N/A"} °C
- SpO2: ${vitals.oxygenSaturation ?? "N/A"} %
- Poids: ${vitals.weight ?? "N/A"} kg
- Notes: ${vitals.notes ?? "aucune"}
Contexte patient: ${JSON.stringify(vitals.patientContext ?? {})}

Rappel: tu n'es pas un médecin remplaçant; reste prudent et oriente vers un professionnel si risque élevé.`;

  const res = await fetch(`${HF_ROUTER_V1}/responses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: prompt,
      max_output_tokens: 700,
      temperature: 0.25,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mistral (HF): ${res.status} – ${text}`);
  }

  const data: any = await res.json();
  let raw =
    typeof data?.output_text === "string"
      ? data.output_text
      : Array.isArray(data?.output)
        ? data.output
            .flatMap((o: any) =>
              Array.isArray(o?.content)
                ? o.content.map((c: any) => c?.text ?? "")
                : []
            )
            .join("")
        : JSON.stringify(data);

  const parsed = extractJsonObject(raw);
  if (parsed) return parsed;

  return {
    scoreRisque: 50,
    recommandationFR:
      "Analyse IA reçue dans un format inattendu. Vérifie les constantes manuellement.",
    parametresFlagges: ["format JSON"],
    resume: raw.slice(0, 400),
  };
}

/** Triage texte libre (alerte / priorité) — même routeur que l’analyse clinique */
export type TextTriageJson = {
  alerteProbable: boolean;
  priorite: "BASSE" | "MOYENNE" | "HAUTE" | "CRITIQUE";
  confiance: number;
  note?: string;
};

function extractTriageJson(text: string): TextTriageJson | null {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(trimmed.slice(start, end + 1)) as TextTriageJson;
    if (typeof parsed.alerteProbable !== "boolean") return null;
    if (typeof parsed.confiance !== "number") return null;
    const ok = ["BASSE", "MOYENNE", "HAUTE", "CRITIQUE"].includes(
      parsed.priorite
    );
    if (!ok) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function triageTextWithMistral(freeText: string): Promise<TextTriageJson> {
  const token = getHFToken();
  const model =
    process.env.HF_MISTRAL_MODEL ?? "mistralai/Mistral-7B-Instruct-v0.3";

  const prompt = `Tu es un assistant de triage pour un coordinateur de suivi post-hospitalisation (MediFollow).
À partir du texte clinique ci-dessous, décide si une alerte vers l'équipe soignante est probable et quelle priorité indicative appliquer.

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans texte avant ou après.

Schéma JSON exact:
{
  "alerteProbable": <true ou false>,
  "priorite": <"BASSE" | "MOYENNE" | "HAUTE" | "CRITIQUE">,
  "confiance": <nombre entre 0 et 1, ex. 0.85>,
  "note": "<une courte justification en français>"
}

Texte à analyser:
${freeText.trim().slice(0, 6000)}

Rappel: reste prudent; une température très élevée, une détresse respiratoire ou des signes graves impliquent alerteProbable true et priorité HAUTE ou CRITIQUE.`;

  const res = await fetch(`${HF_ROUTER_V1}/responses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: prompt,
      max_output_tokens: 400,
      temperature: 0.2,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Mistral triage (HF): ${res.status} – ${t}`);
  }

  const data: any = await res.json();
  let raw =
    typeof data?.output_text === "string"
      ? data.output_text
      : Array.isArray(data?.output)
        ? data.output
            .flatMap((o: any) =>
              Array.isArray(o?.content)
                ? o.content.map((c: any) => c?.text ?? "")
                : []
            )
            .join("")
        : JSON.stringify(data);

  const parsed = extractTriageJson(raw);
  if (parsed) return parsed;

  return {
    alerteProbable: true,
    priorite: "MOYENNE",
    confiance: 0.4,
    note: `Réponse non JSON — extrait: ${raw.slice(0, 200)}`,
  };
}
