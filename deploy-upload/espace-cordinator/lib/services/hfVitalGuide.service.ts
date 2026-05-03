/**
 * Hugging Face – IA de guidage vidéo pour signes vitaux
 * Utilisé par le module Coordinateur (guide patient).
 */

"use server";

// Hugging Face legacy endpoint (api-inference.huggingface.co) is decommissioned.
// Use the Inference Router (OpenAI-compatible) instead.
const HF_ROUTER_BASE = "https://router.huggingface.co/v1";

export type VitalGuideRequest = {
  language?: "fr" | "en";
  patientProfile?: {
    age?: number;
    pathology?: string;
    deviceType?: string;
  };
};

export async function generateVitalVideoGuide(
  params: VitalGuideRequest = {}
): Promise<{ script: string }> {
  // Le user a mis son token Hugging Face dans la variable d'env "token"
  // On supporte aussi HF_API_TOKEN pour rester générique.
  const token = process.env.token || process.env.HF_API_TOKEN;
  const model =
    process.env.HF_VITAL_GUIDE_MODEL ??
    // Modèle texte open-source largement accessible
    "mistralai/Mistral-7B-Instruct-v0.2";

  if (!token) {
    throw new Error(
      "HF_API_TOKEN manquant. Ajoute-le dans ton fichier .env côté serveur."
    );
  }

  const lang = params.language ?? "fr";

  const prompt = `
Tu es un expert médical qui prépare un GUIDE VIDÉO (pas forcément réel, peut être en animation) pour expliquer à un patient comment remplir correctement ses SIGNES VITAUX dans MediFollow après une hospitalisation.

Contexte patient (optionnel) :
- Âge: ${params.patientProfile?.age ?? "non précisé"}
- Pathologie: ${params.patientProfile?.pathology ?? "non précisée"}
- Appareils disponibles: ${params.patientProfile?.deviceType ?? "tensiomètre, thermomètre, oxymètre"}

Objectif :
- Guider le patient étape par étape, comme une VOIX OFF de vidéo.
- Style très pédagogique, rassurant, phrases courtes.
- Décrire les plans/scènes (Scène 1, Scène 2…) pour que le coordinateur puisse transformer ça en vidéo plus tard.

Répond STRICTEMENT dans la langue: ${lang}

Structure demandée :
1) Titre de la vidéo
2) Message d'introduction (2–3 phrases)
3) Scènes numérotées :
   - Scène X : Titre
   - Visuel suggéré (patient, appareil…)
   - Script voix off (2–4 phrases)
   - Texte à afficher à l'écran (bullet points très courts)
4) Conclusion courte et rassurante

Commence directement par le titre, sans texte inutile.
`;

  const body = {
    model,
    input: prompt,
    // OpenAI Responses API (supported by HF Inference Providers)
    // https://huggingface.co/docs/inference-providers/guides/responses-api
    max_output_tokens: 900,
    temperature: 0.4,
  };

  const res = await fetch(`${HF_ROUTER_BASE}/responses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erreur HuggingFace: ${res.status} – ${text}`);
  }

  const data: any = await res.json();

  // Try to extract text from Responses API payload
  // Common shapes:
  // - { output_text: "..." }
  // - { output: [{ type: "message", content: [{ type: "output_text", text: "..." }]}]}
  const direct = typeof data?.output_text === "string" ? data.output_text : null;
  if (direct) return { script: direct.trim() };

  const chunks: string[] = [];
  const output = Array.isArray(data?.output) ? data.output : [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const c of content) {
      if (typeof c?.text === "string") chunks.push(c.text);
    }
  }
  const combined = chunks.join("").trim();
  if (combined) return { script: combined };

  // Fallback: stringify (useful for debugging)
  return { script: JSON.stringify(data).slice(0, 4000) };
}

