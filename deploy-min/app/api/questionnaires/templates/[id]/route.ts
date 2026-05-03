import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/actions/auth.actions";

// DELETE specific template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "DOCTOR") {
      return NextResponse.json(
        { error: "Only doctors can delete questionnaires" },
        { status: 403 }
      );
    }

    const { id } = params;

    // Verify template belongs to this doctor
    const template = await prisma.questionnaireTemplate.findUnique({
      where: { id },
    });

    if (!template || template.doctorId !== user.id) {
      return NextResponse.json(
        { error: "Template not found or access denied" },
        { status: 403 }
      );
    }

    // Delete template and cascading relations
    await prisma.questionnaireTemplate.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Questionnaire deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}

// GET specific template
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const template = await prisma.questionnaireTemplate.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { questionNumber: "asc" },
        },
        _count: {
          select: { assignments: true },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Verify access if doctor
    if (user.role === "DOCTOR" && template.doctorId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json(
      { error: "Failed to fetch template" },
      { status: 500 }
    );
  }
}
