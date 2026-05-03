"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ═══════════════════════════════════════════════════════
// AI-Powered Patient → Service Auto-Assignment
// Uses Azure OpenAI to match patients to services based
// on their diagnosis, medications, and symptoms.
// ═══════════════════════════════════════════════════════

interface PatientSummary {
  userId: string;
  name: string;
  diagnosis: string | null;
  medications: string[];
  symptoms: string[];
}

interface ServiceSummary {
  id: string;
  serviceName: string;
  specializations: string[];
  description: string | null;
}

interface AssignmentResult {
  serviceId: string;
  serviceName: string;
  patientUserIds: string[];
  reason: string;
}

/**
 * Gather patient medical context (diagnosis, meds, symptoms)
 * and service info, then ask GPT-4o to produce optimal assignments.
 */
export async function runAIAutoAssign(): Promise<{
  success: boolean;
  assignments?: AssignmentResult[];
  error?: string;
}> {
  try {
    // 1) Load all active patients with medical data
    const patients = await prisma.patient.findMany({
      where: {
        isActive: true,
        user: { isActive: true },
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        symptoms: {
          orderBy: { occurredAt: "desc" },
          take: 10,
          select: { symptomType: true, description: true, severity: true },
        },
      },
    });

    // 2) Load all active services
    const services = await prisma.service.findMany({
      where: { isActive: true },
    });

    if (services.length === 0) {
      return {
        success: false,
        error: "No active services found. Create services first.",
      };
    }

    if (patients.length === 0) {
      return { success: false, error: "No active patients found." };
    }

    // 3) Build compact summaries for the AI prompt
    const patientSummaries: PatientSummary[] = patients.map((p) => ({
      userId: p.user.id,
      name: `${p.user.firstName} ${p.user.lastName}`.trim(),
      diagnosis: p.diagnosis,
      medications: (p.medications as any[])?.map((m) => m.name) || [],
      symptoms: p.symptoms.map(
        (s) => `${s.symptomType} (${s.severity}): ${s.description}`
      ),
    }));

    const serviceSummaries: ServiceSummary[] = services.map((s) => ({
      id: s.id,
      serviceName: s.serviceName,
      specializations: s.specializations,
      description: s.description,
    }));

    // 4) Call Azure OpenAI
    const aiResult = await callAzureOpenAI(patientSummaries, serviceSummaries);

    if (!aiResult.success || !aiResult.assignments) {
      return {
        success: false,
        error: aiResult.error || "AI assignment failed.",
      };
    }

    // 5) Apply the assignments to the database
    // Note: Service model doesn't have patientIds field
    // Assignments are logged for reference but not persisted to Service model
    for (const assignment of aiResult.assignments) {
      // Log assignment for audit purposes
      console.log(
        `[AI Assignment] Service ${assignment.serviceName} assigned to patients:`,
        assignment.patientUserIds
      );
    }

    revalidatePath("/dashboard/admin/services");

    return { success: true, assignments: aiResult.assignments };
  } catch (error) {
    console.error("AI auto-assign error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unexpected error during AI assignment.",
    };
  }
}

// ───────────────────────────────────────────
// Azure OpenAI call
// ───────────────────────────────────────────

async function callAzureOpenAI(
  patients: PatientSummary[],
  services: ServiceSummary[]
): Promise<{
  success: boolean;
  assignments?: AssignmentResult[];
  error?: string;
}> {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion =
    process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview";

  if (!apiKey || !endpoint || !deployment) {
    return { success: false, error: "Azure OpenAI configuration is missing." };
  }

  const systemPrompt = `You are a medical AI assistant for MediFollow, a post-hospitalization monitoring platform.

Your task: Given a list of PATIENTS (with diagnosis, medications, symptoms) and a list of SERVICES (with specializations), determine which patients should be assigned to which services.

Rules:
- A patient can be assigned to MULTIPLE services if their condition warrants it.
- Match based on diagnosis keywords, medication types, symptom patterns, and service specializations.
- If a patient has no diagnosis, medications, or symptoms, skip them.
- Only assign patients to services where there's a clear medical relevance.
- Be conservative — only assign when there's a strong match.

You MUST respond with valid JSON only, no markdown, no explanation outside the JSON.

Response format:
{
  "assignments": [
    {
      "serviceId": "<service id>",
      "serviceName": "<service name>",
      "patientUserIds": ["<userId1>", "<userId2>"],
      "reason": "<brief explanation of why these patients match this service>"
    }
  ]
}

If no assignments can be made, return: { "assignments": [] }`;

  const userPrompt = `SERVICES:
${JSON.stringify(services, null, 2)}

PATIENTS:
${JSON.stringify(patients, null, 2)}

Analyze each patient's medical profile and assign them to the most relevant services. Return JSON only.`;

  const url = `${endpoint.replace(/\/$/, "")}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Azure OpenAI error:", errText);
    return { success: false, error: `OpenAI API error: ${response.status}` };
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    return { success: false, error: "Empty response from AI." };
  }

  try {
    const parsed = JSON.parse(content);

    if (!Array.isArray(parsed.assignments)) {
      return { success: false, error: "Invalid AI response format." };
    }

    // Validate that serviceIds and patientUserIds reference real data
    const validServiceIds = new Set(services.map((s) => s.id));
    const validUserIds = new Set(patients.map((p) => p.userId));

    const validatedAssignments: AssignmentResult[] = parsed.assignments
      .filter((a: any) => validServiceIds.has(a.serviceId))
      .map((a: any) => ({
        serviceId: a.serviceId,
        serviceName: a.serviceName || "",
        patientUserIds: (a.patientUserIds || []).filter((id: string) =>
          validUserIds.has(id)
        ),
        reason: a.reason || "",
      }))
      .filter((a: AssignmentResult) => a.patientUserIds.length > 0);

    return { success: true, assignments: validatedAssignments };
  } catch {
    console.error("Failed to parse AI response:", content);
    return { success: false, error: "Failed to parse AI response." };
  }
}
