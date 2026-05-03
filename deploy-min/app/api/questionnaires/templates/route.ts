import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/actions/auth.actions";

// GET - List all templates (doctor's own or can filter by specialty)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "DOCTOR") {
      return NextResponse.json(
        { error: "Only doctors can access questionnaire templates" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const specialty = searchParams.get("specialty");

    const where: any = {
      doctorId: user.id,
    };

    if (specialty) {
      where.specialty = specialty;
    }

    const templates = await prisma.questionnaireTemplate.findMany({
      where,
      include: {
        questions: {
          orderBy: { questionNumber: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

// POST - Create new template
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "DOCTOR") {
      return NextResponse.json(
        { error: "Only doctors can create questionnaire templates" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, specialty, questions } = body;

    if (!title || !specialty) {
      return NextResponse.json(
        { error: "Title and specialty are required" },
        { status: 400 }
      );
    }

    // Create template with questions
    const template = await prisma.questionnaireTemplate.create({
      data: {
        doctorId: user.id,
        title,
        description,
        specialty,
        questions: {
          create:
            questions?.map((q: any, index: number) => {
              const questionData: any = {
                questionNumber: index + 1,
                questionText: q.questionText,
                questionType: q.questionType,
                required: q.isRequired !== false,
              };
              if (q.helpText) questionData.helpText = q.helpText;
              if (q.options && Array.isArray(q.options)) {
                // Convert options array to array of JSON strings
                questionData.options = q.options.map((opt: any) =>
                  typeof opt === "string" ? opt : JSON.stringify(opt)
                );
              }
              if (q.minLength !== undefined)
                questionData.minLength = q.minLength;
              if (q.maxLength !== undefined)
                questionData.maxLength = q.maxLength;
              if (q.minValue !== undefined) questionData.minValue = q.minValue;
              if (q.maxValue !== undefined) questionData.maxValue = q.maxValue;
              return questionData;
            }) || [],
        },
      },
      include: {
        questions: {
          orderBy: { questionNumber: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}
