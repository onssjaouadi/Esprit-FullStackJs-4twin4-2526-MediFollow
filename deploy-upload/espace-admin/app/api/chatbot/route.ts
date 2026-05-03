import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

    if (!apiKey || !endpoint || !deployment) {
      return NextResponse.json(
        { error: "Azure OpenAI configuration is missing" },
        { status: 500 }
      );
    }

    // System prompt for medical context
    const systemMessage: Message = {
      role: "system",
      content: `Tu es un assistant médical IA pour MediFollow, une plateforme de suivi post-hospitalisation. 

Ton rôle est d'aider les médecins avec:
- Analyse des signes vitaux et interprétation des données
- Suggestions de diagnostic basées sur les symptômes
- Recommandations pour la gestion des alertes critiques
- Informations médicales générales et best practices
- Aide à la prise de décision clinique

Règles importantes:
- Réponds en français de manière professionnelle et concise
- Base tes réponses sur des connaissances médicales validées
- Rappelle toujours que tu es un outil d'aide à la décision, pas un remplacement du jugement médical
- En cas de situation critique, recommande toujours une intervention humaine
- Ne fournis jamais de diagnostic définitif, seulement des pistes d'analyse
- Respecte la confidentialité des patients (ne stocke pas d'informations personnelles)

Format de réponse:
- Sois clair et structuré
- Utilise des bullet points si nécessaire
- Cite des références médicales quand c'est pertinent
- Propose des actions concrètes`,
    };

    const fullMessages = [systemMessage, ...messages];

    // Call Azure OpenAI API
    const azureUrl = `${endpoint}openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

    const response = await fetch(azureUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        messages: fullMessages,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Azure OpenAI API error:", error);
      return NextResponse.json(
        { error: "Failed to get response from AI" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      message:
        data.choices[0]?.message?.content ||
        "Désolé, je n'ai pas pu générer une réponse.",
      usage: data.usage,
    });
  } catch (error) {
    console.error("Chatbot API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
