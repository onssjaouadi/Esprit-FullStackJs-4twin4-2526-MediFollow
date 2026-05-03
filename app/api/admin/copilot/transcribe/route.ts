import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import OpenAI from "openai";

function providerErrorMessage(error: unknown) {
  const status = (error as any)?.status;
  const message =
    typeof (error as any)?.message === "string" ? (error as any).message : "";

  if (status === 401 || message.toLowerCase().includes("invalid api key")) {
    return "The configured speech-to-text API key is invalid. Please update the key and restart the server.";
  }

  return message || "Voice transcription failed";
}

function getHuggingFaceToken() {
  return (
    process.env.HUGGINGFACE_API_KEY?.trim() ||
    process.env.HF_TOKEN?.trim() ||
    process.env.token?.trim() ||
    ""
  );
}

async function transcribeWithGroq(audio: File) {
  if (!process.env.GROQ_API_KEY) return "";

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const transcription = await groq.audio.transcriptions.create({
    file: audio,
    model: "whisper-large-v3-turbo",
  });

  return typeof transcription.text === "string"
    ? transcription.text.trim()
    : "";
}

async function transcribeWithOpenAI(audio: File) {
  if (!process.env.OPENAI_API_KEY) return "";

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const transcription = await openai.audio.transcriptions.create({
    file: audio,
    model: "gpt-4o-mini-transcribe",
  });

  return typeof transcription.text === "string"
    ? transcription.text.trim()
    : "";
}

async function transcribeWithHuggingFace(audio: File) {
  const token = getHuggingFaceToken();
  if (!token) return "";

  const model =
    process.env.HF_TRANSCRIPTION_MODEL?.trim() || "openai/whisper-large-v3";
  const response = await fetch(
    `https://router.huggingface.co/hf-inference/models/${model}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": audio.type || "audio/webm",
      },
      body: await audio.arrayBuffer(),
    }
  );

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof payload?.error === "string"
        ? payload.error
        : "Hugging Face transcription failed"
    );
  }

  return typeof payload?.text === "string" ? payload.text.trim() : "";
}

export async function POST(request: Request) {
  try {
    if (
      !process.env.GROQ_API_KEY &&
      !process.env.OPENAI_API_KEY &&
      !getHuggingFaceToken()
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A speech-to-text API key is required. Configure GROQ_API_KEY, OPENAI_API_KEY, or HUGGINGFACE_API_KEY.",
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const audio = formData.get("audio");

    if (!(audio instanceof File) || audio.size === 0) {
      return NextResponse.json(
        { success: false, error: "Audio file is required" },
        { status: 400 }
      );
    }

    let text = "";
    let lastError: unknown = null;

    try {
      text = await transcribeWithGroq(audio);
    } catch (error) {
      lastError = error;
      text = "";
    }

    if (!text) {
      try {
        text = await transcribeWithOpenAI(audio);
      } catch (error) {
        lastError = error;
        text = "";
      }
    }

    if (!text) {
      try {
        text = await transcribeWithHuggingFace(audio);
      } catch (error) {
        lastError = error;
        text = "";
      }
    }

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          error: lastError
            ? providerErrorMessage(lastError)
            : "No speech was detected.",
        },
        { status: lastError ? 500 : 400 }
      );
    }

    return NextResponse.json({ success: true, text });
  } catch (error) {
    console.error("Admin voice transcription failed:", providerErrorMessage(error));
    return NextResponse.json(
      {
        success: false,
        error: providerErrorMessage(error),
      },
      { status: 500 }
    );
  }
}
