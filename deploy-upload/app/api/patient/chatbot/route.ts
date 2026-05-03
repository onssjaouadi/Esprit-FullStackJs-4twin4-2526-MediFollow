import { getCurrentUserFromRequest } from "@/lib/auth-api";
import { AzureOpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";

const client = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}`,
});

type Message = {
  role: "user" | "assistant";
  content: string;
};

const SYSTEM_PROMPT = `Tu es l'assistant MediFollow, un expert en santé dédié à aider les patients à comprendre comment utiliser l'application MediFollow et prendre soin de leur santé.

Tu réponds en français avec clarté et bienveillance. Voici tes responsabilités principales:

1. **Constantes vitales**: Aide les patients à prendre correctement leur tension, fréquence cardiaque, température, et SpO2. Explique l'importance de ces mesures et les valeurs normales.

2. **Utilisation de MediFollow**: Guide les utilisateurs sur comment remplir les formulaires, prendre leurs mesures, soumettre les questionnaires, et interpréter les graphiques d'alerte.

3. **Symptômes et bien-être**: Aide le patient à identifier et noter ses symptômes. Encourage-le à signaler les changements importants à son coordinateur/médecin.

4. **Éducation médicale**: Fournis des informations simples et exactes sur la santé générale, les conditions cardiaques post-hospitalisation, et l'importance de l'observance.

5. **Rappels et encouragement**: Aide le patient à rester motivé dans son suivi médical quotidien.

IMPORTANT:
- Réponds UNIQUEMENT sur les sujets liés à MediFollow et au suivi de santé.
- Ne donne JAMAIS de diagnostic ou prescription médicale.
- Toujours rappeller: "Les réponses ne remplacent pas un avis médical professionnel."
- Si une question dépasse ton expertise, renvoie le patient vers son coordinateur ou son médecin.
- Sois bref mais informatif (max 3-4 phrases par réponse).
- Utilise un ton chaleureux et encourageant.`;

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user || user.role !== "PATIENT") {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { messages } = (await request.json()) as { messages: Message[] };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: "Messages invalides" },
        { status: 400 }
      );
    }

    // Prepare messages for Azure OpenAI
    const formattedMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
    ];

    // Call Azure OpenAI
    const response = await client.chat.completions.create({
      messages: formattedMessages,
      max_tokens: 300,
      temperature: 0.7,
    });

    const reply = response.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return NextResponse.json(
        { success: false, error: "Pas de réponse du modèle" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error("[Patient Chatbot Error]", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
