"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type QuestionInput = {
  text: string;
  type: string; // TEXT, NUMBER, BOOLEAN, CHOICE
  required: boolean;
  options: string[];
};

type TemplateInput = {
  title: string;
  description?: string;
  questions: QuestionInput[];
  assignedServiceIds?: string[];
  assignedPatientIds?: string[];
  isActive?: boolean;
};

type AIQuestionInput = {
  text?: unknown;
  type?: unknown;
  required?: unknown;
  options?: unknown;
};

const VALID_QUESTION_TYPES = new Set(["TEXT", "NUMBER", "BOOLEAN", "CHOICE"]);

function normalizeQuestions(raw: unknown): QuestionInput[] {
  if (!Array.isArray(raw)) return [];

  const normalized = raw
    .map((q) => {
      const item = q as AIQuestionInput;
      const text = typeof item.text === "string" ? item.text.trim() : "";
      const type =
        typeof item.type === "string" ? item.type.toUpperCase() : "TEXT";
      const required =
        typeof item.required === "boolean" ? item.required : true;
      const options = Array.isArray(item.options)
        ? item.options
            .filter((o): o is string => typeof o === "string")
            .map((o) => o.trim())
            .filter(Boolean)
        : [];

      if (!text || !VALID_QUESTION_TYPES.has(type)) return null;

      if (type === "CHOICE") {
        return {
          text,
          type,
          required,
          options: options.length > 0 ? options : ["Yes", "No"],
        };
      }

      return { text, type, required, options: [] };
    })
    .filter((q): q is QuestionInput => q !== null);

  return normalized.slice(0, 20);
}

async function callAzureForServiceQuestionnaire(service: {
  id: string;
  serviceName: string;
  description: string | null;
  specializations: string[];
}) {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion =
    process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview";

  if (!apiKey || !endpoint || !deployment) {
    return { success: false, error: "Azure OpenAI configuration is missing." };
  }

  const systemPrompt = `You are a medical questionnaire designer for MediFollow.

Goal: generate a STANDARD post-hospitalization questionnaire template for ONE medical service.

Rules:
- Return valid JSON only.
- 8 to 12 questions.
- Keep questions clinically relevant and concise.
- Use only these types: TEXT, NUMBER, BOOLEAN, CHOICE.
- For CHOICE questions, include at least 2 options.

Required JSON schema:
{
  "title": "string",
  "description": "string",
  "questions": [
    {
      "text": "string",
      "type": "TEXT|NUMBER|BOOLEAN|CHOICE",
      "required": true,
      "options": ["string"]
    }
  ]
}`;

  const userPrompt = `Generate a standard questionnaire for this service:
${JSON.stringify(service, null, 2)}`;

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
      temperature: 0.3,
      max_tokens: 2500,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("AI questionnaire generation error:", text);
    return { success: false, error: `OpenAI API error: ${response.status}` };
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) return { success: false, error: "Empty response from AI." };

  try {
    const parsed = JSON.parse(content);
    const questions = normalizeQuestions(parsed.questions);
    if (questions.length === 0) {
      return { success: false, error: "AI returned no valid questions." };
    }

    const title =
      typeof parsed.title === "string" && parsed.title.trim()
        ? parsed.title.trim()
        : `Standard Questionnaire - ${service.serviceName}`;

    const description =
      typeof parsed.description === "string" && parsed.description.trim()
        ? parsed.description.trim()
        : `AI-generated standard questionnaire for ${service.serviceName}.`;

    return {
      success: true,
      template: {
        title,
        description,
        questions,
      },
    };
  } catch {
    return { success: false, error: "Failed to parse AI response." };
  }
}

// ──────────────────────────────────────
// Template CRUD
// ──────────────────────────────────────

export async function getAllTemplates() {
  try {
    const templates = await prisma.questionnaireTemplate.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, templates };
  } catch (error) {
    console.error("Get templates error:", error);
    return { success: false, templates: [], error: "Failed to load templates" };
  }
}

export async function getTemplateById(id: string) {
  try {
    const template = await prisma.questionnaireTemplate.findUnique({
      where: { id },
    });
    if (!template)
      return { success: false, template: null, error: "Not found" };
    return { success: true, template };
  } catch (error) {
    console.error("Get template error:", error);
    return { success: false, template: null, error: "Failed to load template" };
  }
}

export async function createTemplate(data: TemplateInput) {
  try {
    const template = await prisma.questionnaireTemplate.create({
      data: {
        title: data.title,
        description: data.description || null,
        questions: data.questions,
        assignedServiceIds: data.assignedServiceIds || [],
        assignedPatientIds: data.assignedPatientIds || [],
        isActive: data.isActive ?? true,
      },
    });
    revalidatePath("/dashboard/admin/questionnaires");
    return { success: true, template };
  } catch (error) {
    console.error("Create template error:", error);
    return { success: false, error: "Failed to create template" };
  }
}

export async function updateTemplate(id: string, data: Partial<TemplateInput>) {
  try {
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description || null;
    if (data.questions !== undefined) updateData.questions = data.questions;
    if (data.assignedServiceIds !== undefined)
      updateData.assignedServiceIds = data.assignedServiceIds;
    if (data.assignedPatientIds !== undefined)
      updateData.assignedPatientIds = data.assignedPatientIds;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const template = await prisma.questionnaireTemplate.update({
      where: { id },
      data: updateData,
    });
    revalidatePath("/dashboard/admin/questionnaires");
    return { success: true, template };
  } catch (error) {
    console.error("Update template error:", error);
    return { success: false, error: "Failed to update template" };
  }
}

export async function deleteTemplate(id: string) {
  try {
    await prisma.questionnaireTemplate.delete({ where: { id } });
    revalidatePath("/dashboard/admin/questionnaires");
    return { success: true };
  } catch (error) {
    console.error("Delete template error:", error);
    return { success: false, error: "Failed to delete template" };
  }
}

// ──────────────────────────────────────
// Helpers for assignment dropdowns
// ──────────────────────────────────────

export async function getAssignableOptions() {
  try {
    const [services, patients] = await Promise.all([
      prisma.service.findMany({
        where: { isActive: true },
        select: { id: true, serviceName: true },
        orderBy: { serviceName: "asc" },
      }),
      prisma.user.findMany({
        where: { role: "PATIENT" },
        select: { id: true, firstName: true, lastName: true, email: true },
        orderBy: { lastName: "asc" },
      }),
    ]);

    return {
      success: true,
      services: services.map((s) => ({ id: s.id, label: s.serviceName })),
      patients: patients.map((p) => ({
        id: p.id,
        label: `${p.firstName} ${p.lastName}`.trim() || p.email,
      })),
    };
  } catch (error) {
    console.error("Get assignable options error:", error);
    return {
      success: false,
      services: [],
      patients: [],
      error: "Failed to load options",
    };
  }
}

// ──────────────────────────────────────
// Stats for dashboard
// ──────────────────────────────────────

export async function getQuestionnaireStats() {
  try {
    const [totalTemplates, activeTemplates, totalResponses] = await Promise.all(
      [
        prisma.questionnaireTemplate.count(),
        prisma.questionnaireTemplate.count({ where: { isActive: true } }),
        prisma.questionnaire.count(),
      ]
    );

    return {
      success: true,
      stats: { totalTemplates, activeTemplates, totalResponses },
    };
  } catch (error) {
    console.error("Get questionnaire stats error:", error);
    return {
      success: false,
      stats: { totalTemplates: 0, activeTemplates: 0, totalResponses: 0 },
    };
  }
}

export async function generateStandardQuestionnairesForAllServices(
  overwrite = false
) {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      select: {
        id: true,
        serviceName: true,
        description: true,
        specializations: true,
      },
      orderBy: { serviceName: "asc" },
    });

    if (services.length === 0) {
      return { success: false, error: "No active services found." };
    }

    const createdOrUpdated: Array<{
      serviceId: string;
      serviceName: string;
      templateId: string;
    }> = [];
    const skipped: Array<{
      serviceId: string;
      serviceName: string;
      reason: string;
    }> = [];
    const failed: Array<{
      serviceId: string;
      serviceName: string;
      reason: string;
    }> = [];

    for (const service of services) {
      const existingTemplate = await prisma.questionnaireTemplate.findFirst({
        where: { assignedServiceIds: { has: service.id } },
        orderBy: { createdAt: "desc" },
      });

      if (existingTemplate && !overwrite) {
        skipped.push({
          serviceId: service.id,
          serviceName: service.serviceName,
          reason: "Template already exists for this service",
        });
        continue;
      }

      const ai = await callAzureForServiceQuestionnaire(service);
      if (!ai.success || !ai.template) {
        failed.push({
          serviceId: service.id,
          serviceName: service.serviceName,
          reason: ai.error || "AI generation failed",
        });
        continue;
      }

      try {
        if (existingTemplate) {
          const updated = await prisma.questionnaireTemplate.update({
            where: { id: existingTemplate.id },
            data: {
              title: ai.template.title,
              description: ai.template.description,
              questions: ai.template.questions,
              isActive: true,
              assignedServiceIds: Array.from(
                new Set([
                  ...(existingTemplate.assignedServiceIds || []),
                  service.id,
                ])
              ),
            },
          });

          createdOrUpdated.push({
            serviceId: service.id,
            serviceName: service.serviceName,
            templateId: updated.id,
          });
        } else {
          const created = await prisma.questionnaireTemplate.create({
            data: {
              title: ai.template.title,
              description: ai.template.description,
              questions: ai.template.questions,
              isActive: true,
              assignedServiceIds: [service.id],
              assignedPatientIds: [],
            },
          });

          createdOrUpdated.push({
            serviceId: service.id,
            serviceName: service.serviceName,
            templateId: created.id,
          });
        }
      } catch (error) {
        failed.push({
          serviceId: service.id,
          serviceName: service.serviceName,
          reason:
            error instanceof Error
              ? error.message
              : "Failed to persist template",
        });
      }
    }

    revalidatePath("/dashboard/admin/questionnaires");

    return {
      success: true,
      summary: {
        totalServices: services.length,
        createdOrUpdated: createdOrUpdated.length,
        skipped: skipped.length,
        failed: failed.length,
      },
      createdOrUpdated,
      skipped,
      failed,
    };
  } catch (error) {
    console.error("Generate questionnaires for services error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unexpected error",
    };
  }
}
