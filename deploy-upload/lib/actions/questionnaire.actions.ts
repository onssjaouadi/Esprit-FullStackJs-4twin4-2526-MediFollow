"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

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

// Helper function to parse JSON options from database
function parseOptions(data: unknown): string[] {
  if (!data) {
    return [];
  }

  // If it's already an array of strings
  if (Array.isArray(data)) {
    return data.filter((o): o is string => typeof o === "string");
  }

  // If it's a string, try to parse it as JSON
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.filter((o): o is string => typeof o === "string");
      }
      return [data]; // Return the string itself if JSON parsing fails
    } catch {
      return [data]; // Return the string itself if JSON parsing fails
    }
  }

  // If it's a JSON object with value/label structure, extract values
  if (typeof data === "object" && !Array.isArray(data)) {
    const obj = data as Record<string, unknown>;
    if ("value" in obj && "label" in obj) {
      return [String(obj.value)];
    }
  }

  return [];
}

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
    // Get templates without the doctorId field (it has null values causing issues)
    const templates = await (prisma.questionnaireTemplate as any).findMany({
      select: {
        id: true,
        title: true,
        description: true,
        specialty: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // SKIP doctorId - it has null values causing type errors
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(`✅ Found ${templates.length} templates`);

    // Manually fetch questions with error handling
    const transformedTemplates = [];
    for (const template of templates) {
      try {
        const questions = await prisma.questionnaireQuestion.findMany({
          where: { templateId: template.id },
          orderBy: { questionNumber: "asc" },
        });

        const assignments = await prisma.questionnaireAssignment.findMany({
          where: { templateId: template.id },
        });

        transformedTemplates.push({
          id: template.id,
          title: template.title,
          description: template.description,
          isActive: template.isActive,
          createdAt: template.createdAt,
          updatedAt: template.updatedAt,
          questions: questions.map((q) => ({
            text: q.questionText,
            type: q.questionType,
            required: q.required,
            options: parseOptions(q.options),
          })),
          assignedServiceIds: [],
          assignedPatientIds: assignments.map((a) => a.patientId),
        });
      } catch (qError) {
        console.error(
          `Error loading questions for template ${template.id}:`,
          qError
        );
        // Still include the template but with empty questions
        transformedTemplates.push({
          id: template.id,
          title: template.title,
          description: template.description,
          isActive: template.isActive,
          createdAt: template.createdAt,
          updatedAt: template.updatedAt,
          questions: [],
          assignedServiceIds: [],
          assignedPatientIds: [],
        });
      }
    }

    console.log(`✅ Returning ${transformedTemplates.length} templates`);
    return { success: true, templates: transformedTemplates };
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

    // Fetch questions and assignments separately to avoid JSON parsing issues
    const questions = await prisma.questionnaireQuestion.findMany({
      where: { templateId: id },
      orderBy: { questionNumber: "asc" },
    });

    const assignments = await prisma.questionnaireAssignment.findMany({
      where: { templateId: id },
    });

    // Transform to match expected format
    const transformed = {
      id: template.id,
      title: template.title,
      description: template.description,
      isActive: template.isActive,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
      questions: questions.map((q) => ({
        text: q.questionText,
        type: q.questionType,
        required: q.required,
        options: parseOptions(q.options),
      })),
      assignedServiceIds: [],
      assignedPatientIds: assignments.map((a) => a.patientId),
    };

    return { success: true, template: transformed };
  } catch (error) {
    console.error("Get template error:", error);
    return { success: false, template: null, error: "Failed to load template" };
  }
}

export async function createTemplate(data: TemplateInput) {
  try {
    const { getCurrentUser } = await import("@/lib/actions/auth.actions");
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Normalize questions
    const normalizedQuestions = normalizeQuestions(data.questions);
    if (normalizedQuestions.length === 0) {
      return {
        success: false,
        error: "At least one valid question is required",
      };
    }

    // Create template with nested questions
    const template = await prisma.questionnaireTemplate.create({
      data: {
        title: data.title,
        description: data.description || null,
        specialty: data.questions?.[0]?.type || "GENERAL_MEDICINE",
        doctorId: user.id,
        isActive: data.isActive ?? true,
        questions: {
          create: normalizedQuestions.map((q, index) => ({
            questionNumber: index + 1,
            questionText: q.text,
            questionType: q.type,
            required: q.required,
            options: q.options.length > 0 ? q.options : undefined,
          })),
        },
        // Create assignments for patients if provided
        ...(data.assignedPatientIds && data.assignedPatientIds.length > 0
          ? {
              assignments: {
                create: data.assignedPatientIds.map((patientId) => ({
                  patientId,
                  status: "PENDING",
                })),
              },
            }
          : {}),
      },
      include: {
        questions: true,
        assignments: true,
      },
    });

    revalidatePath("/admin/questionnaires");
    return { success: true, template };
  } catch (error) {
    console.error("Create template error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create template",
    };
  }
}

export async function updateTemplate(id: string, data: Partial<TemplateInput>) {
  try {
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description || null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const template = await prisma.questionnaireTemplate.update({
      where: { id },
      data: updateData,
      include: {
        questions: true,
        assignments: true,
      },
    });
    revalidatePath("/admin/questionnaires");
    return { success: true, template };
  } catch (error) {
    console.error("Update template error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update template",
    };
  }
}

export async function deleteTemplate(id: string) {
  try {
    await prisma.questionnaireTemplate.delete({ where: { id } });
    revalidatePath("/admin/questionnaires");
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
      try {
        // Check if template already exists
        const existing = await (prisma.questionnaireTemplate as any).findFirst({
          where: {
            title: { contains: service.serviceName },
            isActive: true,
          },
        });

        if (existing && !overwrite) {
          skipped.push({
            serviceId: service.id,
            serviceName: service.serviceName,
            reason: "Template already exists",
          });
          continue;
        }

        // Call AI to generate questionnaire
        const aiResult = await callAzureForServiceQuestionnaire(service);
        if (!aiResult.success || !aiResult.template) {
          failed.push({
            serviceId: service.id,
            serviceName: service.serviceName,
            reason: aiResult.error || "AI generation failed",
          });
          continue;
        }

        // Create new template
        const template = await prisma.questionnaireTemplate.create({
          data: {
            title: aiResult.template.title,
            description: aiResult.template.description,
            specialty: service.serviceName,
            isActive: true,
            questions: {
              create: normalizeQuestions(aiResult.template.questions).map(
                (q, idx) => ({
                  questionNumber: idx + 1,
                  questionText: q.text,
                  questionType: q.type,
                  required: q.required,
                  options: q.options.length > 0 ? q.options : undefined,
                })
              ),
            },
          },
        });

        createdOrUpdated.push({
          serviceId: service.id,
          serviceName: service.serviceName,
          templateId: template.id,
        });
      } catch (error) {
        failed.push({
          serviceId: service.id,
          serviceName: service.serviceName,
          reason: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    revalidatePath("/admin/questionnaires");

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

// Repair function to fix corrupted options data
export async function repairQuestionnaireOptions() {
  try {
    // Delete all QuestionnaireQuestion records to clear corrupted data
    const deleteResult = await (prisma.questionnaireQuestion as any).deleteMany(
      {}
    );

    console.log("Deleted corrupted questions:", deleteResult);
    return {
      success: true,
      message: `Cleared corrupted data. Deleted ${deleteResult.count ?? 0} records.`,
    };
  } catch (error) {
    console.error("Repair error:", error);
    return { success: false, error: "Failed to repair data" };
  }
}
