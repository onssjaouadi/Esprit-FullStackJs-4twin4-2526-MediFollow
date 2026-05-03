import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

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

    // Build context string if patient data is provided
    let contextString = "";
    if (patientContext) {
      contextString = `\n\nCONTEXTE PATIENT ACTUEL:\n${JSON.stringify(patientContext, null, 2)}`;
    }

    // System prompt for MedAssist AI - Medical Assistant
    const systemMessage: Message = {
      role: "system",
      content: `Tu es MedAssist AI, un assistant médical intelligent intégré dans le dashboard du médecin.

Ton rôle est d'assister le médecin en utilisant UNIQUEMENT les données disponibles dans la base de données de l'application (patients, consultations, prescriptions, analyses, rendez-vous, antécédents, allergies, traitements en cours).

RÈGLES PRINCIPALES:

1. Tu réponds uniquement en te basant sur :
   - Les données structurées fournies dans le contexte
   - Les informations extraites de la base de données
   - Les guidelines médicales générales si nécessaire

2. Ne jamais inventer une information patient.
   Si une donnée est absente, répondre :
   "Information non disponible dans le dossier patient."

3. Toujours structurer tes réponses de manière professionnelle :
   - Résumé patient
   - Données cliniques pertinentes
   - Analyse
   - Recommandation
   - Alertes éventuelles (allergies, interactions, risques)

4. Si le médecin demande :
   - "Résumé du patient" → fournir un résumé synthétique
   - "Historique médical" → lister chronologiquement
   - "Derniers examens" → afficher les résultats récents
   - "Interactions médicaments" → vérifier avec traitements actifs
   - "Rappel suivi" → analyser date dernier contrôle

5. Priorité absolue à la sécurité :
   - Signaler allergies
   - Signaler interactions médicamenteuses potentielles
   - Signaler valeurs biologiques anormales

6. Ne jamais remplacer le jugement clinique du médecin.
   Toujours conclure par :
   "Cette analyse est une assistance et ne remplace pas votre jugement clinique."

Ton ton doit être :
- Professionnel
- Clair
- Synthétique
- Structuré
- Adapté à un médecin

Langue par défaut : Français

${contextString}`,
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
