"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { Anthropic } from "@anthropic-ai/sdk";

const client = new Anthropic();

// ============================================
// CREATE SITUATION REPORT
// ============================================

export async function createSituationReport(
  patientId: string,
  title: string,
  initialContent: string
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "DOCTOR") {
      return { success: false, error: "Unauthorized" };
    }

    const report = await prisma.situationReport.create({
      data: {
        patientId,
        doctorId: user.id,
        title,
        content: initialContent,
        status: "DRAFT",
      },
      include: {
        patient: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return { success: true, report };
  } catch (error) {
    console.error("Error creating situation report:", error);
    return { success: false, error: "Failed to create report" };
  }
}

// ============================================
// UPDATE SITUATION REPORT
// ============================================

export async function updateSituationReport(
  reportId: string,
  updates: {
    title?: string;
    content?: string;
    status?: string;
    context?: any;
  }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "DOCTOR") {
      return { success: false, error: "Unauthorized" };
    }

    // Verify ownership
    const report = await prisma.situationReport.findUnique({
      where: { id: reportId },
    });

    if (!report || report.doctorId !== user.id) {
      return { success: false, error: "Forbidden" };
    }

    // If content is being updated, create a version entry
    if (updates.content && updates.content !== report.content) {
      await prisma.situationReportVersion.create({
        data: {
          reportId,
          versionNumber: report.version,
          content: report.content,
          changeSummary: "Auto-saved version",
        },
      });
    }

    const updatedReport = await prisma.situationReport.update({
      where: { id: reportId },
      data: {
        ...updates,
        ...(updates.status && { status: updates.status as any }),
        version: updates.content ? { increment: 1 } : undefined,
      },
      include: {
        patient: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return { success: true, report: updatedReport };
  } catch (error) {
    console.error("Error updating situation report:", error);
    return { success: false, error: "Failed to update report" };
  }
}

// ============================================
// GENERATE AI SUMMARY
// ============================================

export async function generateAISummary(reportId: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "DOCTOR") {
      return { success: false, error: "Unauthorized" };
    }

    const report = await prisma.situationReport.findUnique({
      where: { id: reportId },
      include: {
        patient: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            diagnosis: true,
            vitalRecords: {
              take: 10,
              orderBy: { recordedAt: "desc" },
              select: {
                systolicBP: true,
                diastolicBP: true,
                heartRate: true,
                temperature: true,
                oxygenSaturation: true,
              },
            },
          },
        },
      },
    });

    if (!report || report.doctorId !== user.id) {
      return { success: false, error: "Forbidden" };
    }

    const prompt = `You are a medical AI assistant. Generate a concise clinical summary of the following situation report.

Patient: ${report.patient.user.firstName} ${report.patient.user.lastName}
Diagnosis: ${report.patient.diagnosis || "Not specified"}

Report Content:
${report.content}

Recent Vitals:
${report.patient.vitalRecords
  .map(
    (v: any, i: number) => `
Reading ${i + 1}:
- Systolic BP: ${v.systolicBP || "N/A"} mmHg
- Diastolic BP: ${v.diastolicBP || "N/A"} mmHg  
- Heart Rate: ${v.heartRate || "N/A"} bpm
- Temperature: ${v.temperature || "N/A"}°C
- SpO2: ${v.oxygenSaturation || "N/A"}%
`
  )
  .join("")}

Generate a professional medical summary (3-5 paragraphs) that:
1. Synthesizes the key points from the report
2. Highlights clinical significance
3. Notes any concerning patterns in vitals
4. Suggests recommended follow-up actions

Keep the summary concise but comprehensive.`;

    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const aiSummary =
      message.content[0].type === "text" ? message.content[0].text : "";

    await prisma.situationReport.update({
      where: { id: reportId },
      data: { aiSummary },
    });

    return { success: true, summary: aiSummary };
  } catch (error) {
    console.error("Error generating AI summary:", error);
    return { success: false, error: "Failed to generate summary" };
  }
}

// ============================================
// IMPROVE TEXT WITH AI
// ============================================

export async function improveTextWithAI(reportId: string, instruction: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "DOCTOR") {
      return { success: false, error: "Unauthorized" };
    }

    const report = await prisma.situationReport.findUnique({
      where: { id: reportId },
    });

    if (!report || report.doctorId !== user.id) {
      return { success: false, error: "Forbidden" };
    }

    const prompt = `You are a medical writing assistant. Improve the following clinical report text based on this instruction:

Instruction: ${instruction}

Original Text:
${report.content}

Provide an improved version of the text that:
1. Maintains medical accuracy
2. Improves clarity and professionalism
3. Follows the given instruction
4. Uses proper medical terminology

Return ONLY the improved text, without explanations.`;

    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const improvedContent =
      message.content[0].type === "text" ? message.content[0].text : "";

    return { success: true, improvedContent };
  } catch (error) {
    console.error("Error improving text with AI:", error);
    return { success: false, error: "Failed to improve text" };
  }
}

// ============================================
// GET SITUATION REPORTS
// ============================================

export async function getSituationReports(patientId: string, status?: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "DOCTOR") {
      return { success: false, error: "Unauthorized", reports: [] };
    }

    const reports = await prisma.situationReport.findMany({
      where: {
        patientId,
        doctorId: user.id,
        ...(status && { status: status as any }),
      },
      orderBy: { createdAt: "desc" },
      include: {
        versions: {
          select: {
            versionNumber: true,
            createdAt: true,
          },
        },
      },
    });

    return { success: true, reports };
  } catch (error) {
    console.error("Error fetching situation reports:", error);
    return { success: false, error: "Failed to fetch reports", reports: [] };
  }
}

// ============================================
// GET SINGLE SITUATION REPORT
// ============================================

export async function getSituationReport(reportId: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "DOCTOR") {
      return { success: false, error: "Unauthorized" };
    }

    const report = await prisma.situationReport.findUnique({
      where: { id: reportId },
      include: {
        patient: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            diagnosis: true,
            medicalRecordNumber: true,
          },
        },
        versions: {
          orderBy: { versionNumber: "desc" },
        },
      },
    });

    if (!report || report.doctorId !== user.id) {
      return { success: false, error: "Forbidden" };
    }

    return { success: true, report };
  } catch (error) {
    console.error("Error fetching situation report:", error);
    return { success: false, error: "Failed to fetch report" };
  }
}

// ============================================
// DELETE SITUATION REPORT
// ============================================

export async function deleteSituationReport(reportId: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "DOCTOR") {
      return { success: false, error: "Unauthorized" };
    }

    const report = await prisma.situationReport.findUnique({
      where: { id: reportId },
    });

    if (!report || report.doctorId !== user.id) {
      return { success: false, error: "Forbidden" };
    }

    await prisma.situationReport.delete({
      where: { id: reportId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting situation report:", error);
    return { success: false, error: "Failed to delete report" };
  }
}

// ============================================
// PUBLISH SITUATION REPORT
// ============================================

export async function publishSituationReport(reportId: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "DOCTOR") {
      return { success: false, error: "Unauthorized" };
    }

    const report = await prisma.situationReport.findUnique({
      where: { id: reportId },
    });

    if (!report || report.doctorId !== user.id) {
      return { success: false, error: "Forbidden" };
    }

    const published = await prisma.situationReport.update({
      where: { id: reportId },
      data: {
        status: "PUBLISHED",
        isPublished: true,
        publishedAt: new Date(),
      },
      include: {
        patient: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return { success: true, report: published };
  } catch (error) {
    console.error("Error publishing situation report:", error);
    return { success: false, error: "Failed to publish report" };
  }
}
