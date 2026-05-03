import { NextRequest, NextResponse } from "next/server";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, patientContext } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Groq API key not configured" },
        { status: 500 }
      );
    }

    let contextString = "";
    if (patientContext) {
      contextString = `\n\nCONTEXTE PATIENT ACTUEL:\n${JSON.stringify(patientContext, null, 2)}`;
    }

    const systemMessage: Message = {
      role: "system",
      content: `Tu es Jarvis, un assistant vocal médical intelligent intégré dans le dashboard du médecin MediFollow.
Tu es inspiré de l'IA Jarvis d'Iron Man — efficace, précis, professionnel, légèrement sophistiqué.

RÈGLES ABSOLUES POUR LES RÉPONSES VOCALES :
- Réponds TOUJOURS en français
- Réponses COURTES (2 à 4 phrases maximum) — optimisées pour être lues à voix haute
- Pas de listes à puces, pas de markdown, pas de symboles spéciaux
- Langage naturel et fluide, comme si tu parlais directement au médecin
- Commence parfois par "Docteur," pour un effet naturel en conversation vocale

RÔLE MÉDICAL :
- Assiste le médecin avec les données patient disponibles dans le contexte
- Ne jamais inventer une information médicale
- Si une information est absente : "Cette information n'est pas disponible dans le dossier."
- Signaler immédiatement allergies, valeurs critiques ou interactions médicamenteuses
- Toujours rappeler que l'analyse ne remplace pas le jugement clinique si la question est sérieuse${contextString}`,
    };

    const fullMessages: Message[] = [systemMessage, ...messages];

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: fullMessages,
          max_tokens: 300,
          temperature: 0.75,
          top_p: 0.95,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Groq error (Jarvis):", error);
      return NextResponse.json(
        { error: "Impossible de contacter Jarvis" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      message:
        data.choices[0]?.message?.content ||
        "Désolé, je n'ai pas pu générer une réponse.",
    });
  } catch (error) {
    console.error("Jarvis API error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
