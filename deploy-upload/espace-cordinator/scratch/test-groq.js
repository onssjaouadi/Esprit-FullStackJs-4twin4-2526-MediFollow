import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function testGroq() {
  console.log("Testing Groq API...");
  console.log("API Key length:", GROQ_API_KEY?.length);
  
  if (!GROQ_API_KEY) {
    console.error("GROQ_API_KEY is missing!");
    return;
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: "Hello" }],
        temperature: 0.5,
        max_tokens: 10,
      }),
    });

    console.log("Status:", response.status);
    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

testGroq();
