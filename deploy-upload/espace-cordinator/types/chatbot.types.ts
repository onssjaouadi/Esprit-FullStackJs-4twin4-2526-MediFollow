// Types for Azure OpenAI Chatbot

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp?: Date;
}

export interface ChatResponse {
  message: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface AzureOpenAIConfig {
  apiKey: string;
  endpoint: string;
  deployment: string;
  apiVersion: string;
}

export interface ChatBotSettings {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export const DEFAULT_CHAT_SETTINGS: ChatBotSettings = {
  maxTokens: 1000,
  temperature: 0.7,
  topP: 0.95,
  frequencyPenalty: 0,
  presencePenalty: 0,
};

export const MEDICAL_SYSTEM_PROMPT = `Tu es un assistant médical IA pour MediFollow, une plateforme de suivi post-hospitalisation. 

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
- Propose des actions concrètes`;

// Example medical questions for testing
export const EXAMPLE_MEDICAL_QUESTIONS = [
  "Comment interpréter une fréquence cardiaque élevée chez un patient post-opératoire?",
  "Quels sont les signes d'une infection post-chirurgicale?",
  "Recommandations pour un patient avec une tension artérielle de 160/95?",
  "Analyse des symptômes: fièvre, douleur abdominale, nausées",
  "Quels signes vitaux surveiller pour un patient diabétique?",
  "Interprétation d'une saturation en oxygène de 92%",
  "Protocole de surveillance pour un patient cardiaque à domicile",
];
