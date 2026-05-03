import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/actions/auth.actions";

// Helper function to call AI API (configure with your provider)
async function generateQuestionsWithAI(
  specialty: string,
  customPrompt?: string
): Promise<any[]> {
  // This is a template - configure with your AI provider (OpenAI, Claude, etc.)
  // For now, returning sample questions based on specialty

  const specialtyPrompts: Record<string, any[]> = {
    CARDIOLOGY: [
      {
        questionText: "Do you experience any chest pain or discomfort at rest?",
        questionType: "YESNO",
        helpText: "Include any pain in the chest, shoulder, arm, or jaw",
      },
      {
        questionText: "How often do you experience shortness of breath?",
        questionType: "MULTIPLE_CHOICE",
        options: [
          { value: "never", label: "Never" },
          { value: "rarely", label: "Rarely (less than once a week)" },
          { value: "sometimes", label: "Sometimes (a few times a week)" },
          { value: "often", label: "Often (daily)" },
        ],
      },
      {
        questionText:
          "Do you experience palpitations (racing or skipping heartbeats)?",
        questionType: "YESNO",
      },
      {
        questionText: "Have you noticed any swelling in your legs or feet?",
        questionType: "YESNO",
      },
      {
        questionText:
          "How many flights of stairs can you climb without stopping?",
        questionType: "NUMBER",
        minValue: 0,
        maxValue: 100,
      },
    ],
    NEUROLOGY: [
      {
        questionText: "Do you experience frequent headaches?",
        questionType: "YESNO",
      },
      {
        questionText: "How often do you experience dizziness or vertigo?",
        questionType: "MULTIPLE_CHOICE",
        options: [
          { value: "never", label: "Never" },
          { value: "rarely", label: "Rarely" },
          { value: "sometimes", label: "Sometimes" },
          { value: "often", label: "Often" },
        ],
      },
      {
        questionText:
          "Do you have any numbness or tingling in your extremities?",
        questionType: "YESNO",
      },
      {
        questionText: "Rate your memory quality (1-10)",
        questionType: "RATING",
      },
      {
        questionText:
          "Do you experience any tremors or uncontrolled movements?",
        questionType: "YESNO",
      },
    ],
    ORTHOPEDICS: [
      {
        questionText: "Do you have joint pain?",
        questionType: "YESNO",
      },
      {
        questionText: "Which joints are affected?",
        questionType: "CHECKBOX",
        options: [
          { value: "knee", label: "Knee" },
          { value: "hip", label: "Hip" },
          { value: "shoulder", label: "Shoulder" },
          { value: "wrist", label: "Wrist" },
          { value: "ankle", label: "Ankle" },
          { value: "other", label: "Other" },
        ],
      },
      {
        questionText: "Rate your pain level (1-10)",
        questionType: "RATING",
      },
      {
        questionText: "Does the pain affect your daily activities?",
        questionType: "YESNO",
      },
      {
        questionText: "How much can you walk without pain (in minutes)?",
        questionType: "NUMBER",
        minValue: 0,
        maxValue: 480,
      },
    ],
    PULMONOLOGY: [
      {
        questionText: "Do you have a persistent cough?",
        questionType: "YESNO",
      },
      {
        questionText: "Do you cough up blood or blood-tinged sputum?",
        questionType: "YESNO",
      },
      {
        questionText: "How often do you experience wheezing?",
        questionType: "MULTIPLE_CHOICE",
        options: [
          { value: "never", label: "Never" },
          { value: "rarely", label: "Rarely" },
          { value: "sometimes", label: "Sometimes" },
          { value: "often", label: "Often" },
        ],
      },
      {
        questionText: "Do you have any chest pain when breathing?",
        questionType: "YESNO",
      },
      {
        questionText: "Rate your breathing difficulty (1-10)",
        questionType: "RATING",
      },
    ],
    GENERAL_MEDICINE: [
      {
        questionText: "How have you been feeling overall?",
        questionType: "TEXTAREA",
        helpText: "Please describe any symptoms or concerns",
      },
      {
        questionText: "Are you taking all your medications as prescribed?",
        questionType: "YESNO",
      },
      {
        questionText: "Rate your energy level (1-10)",
        questionType: "RATING",
      },
      {
        questionText: "Have you had any recent fever or infections?",
        questionType: "YESNO",
      },
      {
        questionText: "Any other concerns or symptoms?",
        questionType: "TEXTAREA",
      },
    ],
  };

  return (
    specialtyPrompts[specialty as string] || specialtyPrompts.GENERAL_MEDICINE
  );
}

// POST - Generate questions with AI
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "DOCTOR") {
      return NextResponse.json(
        { error: "Only doctors can generate questionnaires" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { specialty, customPrompt } = body;

    if (!specialty) {
      return NextResponse.json(
        { error: "Specialty is required" },
        { status: 400 }
      );
    }

    // Generate questions using AI
    const generatedQuestions = await generateQuestionsWithAI(
      specialty,
      customPrompt
    );

    if (!generatedQuestions || generatedQuestions.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate questions" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        specialty,
        questionCount: generatedQuestions.length,
        questions: generatedQuestions,
        aiGenerated: true,
      },
    });
  } catch (error) {
    console.error("Error generating questions:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}
