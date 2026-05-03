import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT;
const AZURE_OPENAI_API_VERSION = process.env.AZURE_OPENAI_API_VERSION;

async function testUpdatedChatbotLogic() {
  console.log("Testing Updated Chatbot Logic (Azure OpenAI)...");
  
  if (!AZURE_OPENAI_API_KEY || !AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_DEPLOYMENT) {
    console.error("Azure OpenAI configuration is missing!");
    return;
  }

  const messages = [
    { role: "user", content: "Comment prendre ma tension ?" }
  ];

  const SYSTEM_PROMPT = `
Vous êtes l'assistant IA intégré au "Guide" de la plateforme MediFollow.
Votre rôle est d'aider les patients à comprendre comment mesurer leurs signes vitaux...
`;

  const fullMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages
  ];

  const azureUrl = `${AZURE_OPENAI_ENDPOINT}openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${AZURE_OPENAI_API_VERSION}`;

  try {
    const response = await fetch(azureUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": AZURE_OPENAI_API_KEY,
      },
      body: JSON.stringify({
        messages: fullMessages,
        max_tokens: 100,
        temperature: 0.5,
      }),
    });

    console.log("Status:", response.status);
    const data = await response.json();
    console.log("Reply:", data.choices[0]?.message?.content);
  } catch (error) {
    console.error("Error:", error);
  }
}

testUpdatedChatbotLogic();
