import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const apiKey = process.env.AZURE_OPENAI_API_KEY;
const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

async function testAzureOpenAI() {
  console.log("Testing Azure OpenAI API...");
  
  if (!apiKey || !endpoint || !deployment) {
    console.error("Azure OpenAI configuration is missing!");
    return;
  }

  const azureUrl = `${endpoint}openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

  try {
    const response = await fetch(azureUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
        max_tokens: 10,
        temperature: 0.7,
      }),
    });

    console.log("Status:", response.status);
    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

testAzureOpenAI();
