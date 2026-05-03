/**
 * Triage alerte texte : essai hf-inference (modèle pipeline classification si compatible),
 * sinon repli Mistral 7B Instruct (JSON structuré).
 *
 * Note: microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract est un BERT « base » (fill-mask),
 * pas un modèle text-classification sur l’API serverless → renvoie souvent HTTP 400.
 */

"use server";

import { HF_ROUTER_HF_INFERENCE, getHFToken } from "@/lib/services/hfInference.shared";
import { triageTextWithMistral } from "@/lib/services/hfMistralClinical.service";

export type AlertTriageInput = {
  /** Texte libre: symptômes, notes, résumé des constantes */
  text: string;
};

export type AlertTriageResult = {
  alerteProbable: boolean;
  priorite: "BASSE" | "MOYENNE" | "HAUTE" | "CRITIQUE";
  confiance: number;
  labelBrut?: string;
  raw?: unknown;
  /** Moteur réellement utilisé après essai Biomed */
  source?: "biomed" | "mistral";
};

const DEFAULT_MODEL =
  process.env.HF_BIOMED_BERT_MODEL ??
  "microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract";

function mapPriorityFromScore(score: number, urgentLabel: boolean): AlertTriageResult["priorite"] {
  if (urgentLabel) return score > 0.85 ? "CRITIQUE" : "HAUTE";
  if (score > 0.65) return "MOYENNE";
  return "BASSE";
}

/**
 * Appel hf-inference classification. Retourne null si erreur HTTP ou format non exploitable.
 */
async function tryBiomedClassification(
  text: string,
  model: string
): Promise<AlertTriageResult | null> {
  const token = getHFToken();
  const url = `${HF_ROUTER_HF_INFERENCE}/models/${encodeURIComponent(model)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: text }),
    cache: "no-store",
  });

  const rawText = await res.text();
  let raw: unknown;
  try {
    raw = JSON.parse(rawText);
  } catch {
    raw = rawText;
  }

  if (!res.ok) {
    return null;
  }

  if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === "object" && raw[0] !== null) {
    const row = raw[0] as Record<string, unknown>;
    if ("label" in row && "score" in row) {
      const label = String(row.label || "").toLowerCase();
      const score = typeof row.score === "number" ? row.score : 0.5;
      const urgent =
        label.includes("urgent") ||
        label.includes("alerte") ||
        label.includes("positive") ||
        label.includes("pos");
      return {
        alerteProbable: urgent || score > 0.55,
        priorite: mapPriorityFromScore(score, urgent),
        confiance: score,
        labelBrut: String(row.label),
        raw,
        source: "biomed",
      };
    }
  }

  if (
    raw &&
    typeof raw === "object" &&
    Array.isArray((raw as Record<string, unknown>).labels) &&
    Array.isArray((raw as Record<string, unknown>).scores)
  ) {
    const labels = (raw as { labels: string[]; scores: number[] }).labels;
    const scores = (raw as { labels: string[]; scores: number[] }).scores;
    const topIdx = scores.indexOf(Math.max(...scores));
    const label = (labels[topIdx] || "").toLowerCase();
    const score = scores[topIdx] ?? 0.5;
    const urgent =
      label.includes("urgent") ||
      label.includes("alerte") ||
      label.includes("nécessite");
    return {
      alerteProbable: urgent,
      priorite: mapPriorityFromScore(score, urgent),
      confiance: score,
      labelBrut: labels[topIdx],
      raw,
      source: "biomed",
    };
  }

  return null;
}

export async function triageAlertWithBiomedBERT(
  input: AlertTriageInput
): Promise<AlertTriageResult> {
  const model = process.env.HF_BIOMED_BERT_MODEL ?? DEFAULT_MODEL;
  const text = (input.text || "").trim().slice(0, 4000);
  if (!text) {
    return {
      alerteProbable: false,
      priorite: "BASSE",
      confiance: 0,
      labelBrut: "texte vide",
    };
  }

  const biomed = await tryBiomedClassification(text, model);
  if (biomed) return biomed;

  const m = await triageTextWithMistral(text);
  return {
    alerteProbable: m.alerteProbable,
    priorite: m.priorite,
    confiance: m.confiance,
    labelBrut: m.note
      ? `${m.note} (triage Mistral 7B — le modèle BiomedBERT « abstract » n’est pas une classification texte sur l’API HF.)`
      : "Triage Mistral 7B (BiomedBERT abstract non utilisable pour ce type de requête sur l’API).",
    source: "mistral",
  };
}
