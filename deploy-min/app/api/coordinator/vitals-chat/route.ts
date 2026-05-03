import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/actions/auth.actions";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "COORDINATOR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Configuration Azure OpenAI
    const AZURE_KEY = process.env.AZURE_OPENAI_API_KEY;
    const AZURE_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
    const AZURE_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";
    const AZURE_VERSION =
      process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview";

    if (!AZURE_KEY || !AZURE_ENDPOINT) {
      return NextResponse.json(
        { error: "Configuration Azure OpenAI manquante." },
        { status: 500 }
      );
    }

    const { messages, vitalsList, patientContext } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Format des messages invalide" },
        { status: 400 }
      );
    }

    const dataStr = vitalsList
      .map((v: any) => {
        const date = v.recordedAt
          ? new Date(v.recordedAt).toLocaleString("fr-FR")
          : "Date inconnue";
        return `[${date}] Temp: ${v.temperature ?? "-"} | FC: ${v.heartRate ?? "-"} | TA: ${v.systolicBP ?? "-"}/${v.diastolicBP ?? "-"} | SpO2: ${v.oxygenSaturation ?? "-"}`;
      })
      .join("\n");

    const systemPrompt = `Tu es un Assistant d'Analyse Médicale Expert IA intégré à la plateforme MediFollow. 
Le coordinateur lit ton rapport d'analyse des constantes et a une question.
Voici l'historique complet des constantes du patient:
${dataStr}

Contexte du patient : ${JSON.stringify(patientContext)}

Réponds directement, de manière concise et professionnelle à la question du coordinateur. N'utilise pas de longues mises en garde ("Je ne suis qu'une IA..."). Sois pragmatique.`;

    const azureMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const url = `${AZURE_ENDPOINT}/openai/deployments/${AZURE_DEPLOYMENT}/chat/completions?api-version=${AZURE_VERSION}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "api-key": AZURE_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: azureMessages,
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[VitalsChat Azure Error]", response.status, errText);
      return NextResponse.json(
        { error: "Erreur lors de la communication Azure OpenAI." },
        { status: response.status }
      );
    }

    const data = await response.json();
    const reply =
      data.choices[0]?.message?.content || "Aucune réponse disponible.";

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error("[VitalsChat Request Error]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
