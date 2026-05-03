import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/actions/auth.actions";

interface AnalysisResult {
  urgency: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  riskScore: number;
  keyFindings: string[];
  recommendations: string[];
  analysis: string;
}

// Helper to analyze responses and determine urgency
async function analyzeResponsesWithAI(
  responses: any[],
  questions: any[],
  specialty: string
): Promise<AnalysisResult> {
  try {
    // Map responses to readable format
    const responseData = responses.map((resp) => {
      const question = questions.find((q) => q.id === resp.questionId);
      return {
        question: question?.questionText || "Unknown question",
        questionType: question?.questionType || "UNKNOWN",
        answer: resp.answer || "No response",
      };
    });

    // Build analysis prompt based on specialty
    const analysisPrompt = buildAnalysisPrompt(specialty, responseData);

    // Call AI API (configure with your provider)
    const analysis = await callAnalysisAI(analysisPrompt);

    // Parse AI response and extract urgency level
    return parseAnalysisResponse(analysis);
  } catch (error) {
    console.error("Error analyzing responses:", error);
    // Return default analysis if AI fails
    return getDefaultAnalysis(responses, questions, specialty);
  }
}

function buildAnalysisPrompt(specialty: string, responses: any[]): string {
  const responseSummary = responses
    .map((r) => `Q: ${r.question}\nA: ${r.answer}`)
    .join("\n\n");

  return `You are an expert medical analyst specializing in ${specialty}.

Analyze the following patient's questionnaire responses and provide a comprehensive clinical assessment.

Patient Responses:
${responseSummary}

Based on the responses, provide a detailed JSON assessment with the following fields:

1. **urgency**: Set to one of: "CRITICAL" (immediate medical intervention needed), "HIGH" (urgent attention required), "MEDIUM" (follow-up needed), or "LOW" (routine care)
2. **riskScore**: Integer from 0-100 indicating overall risk level
3. **keyFindings**: Array of 3-5 critical clinical findings from the responses
4. **recommendations**: Array of 3-5 specific medical recommendations for this patient
5. **analysis**: Brief (2-3 sentences) clinical analysis summary

Consider the patient's symptoms, frequency, severity, and medical history when determining urgency levels.

Important: Respond ONLY with valid JSON, no other text or explanations.

Example JSON format:
{
  "urgency": "HIGH",
  "riskScore": 75,
  "keyFindings": ["Symptom 1", "Symptom 2", "Symptom 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "analysis": "Clinical summary here."
}`;
}

async function callAnalysisAI(prompt: string): Promise<string> {
  // Use Azure OpenAI for analysis
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion =
    process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview";

  // Fallback to heuristic analysis if Azure OpenAI is not configured
  if (!apiKey || !endpoint || !deployment) {
    console.warn(
      "Azure OpenAI not configured, using default heuristic analysis"
    );
    return JSON.stringify({
      urgency: "MEDIUM",
      riskScore: 50,
      keyFindings: ["Analysis requires AI integration"],
      recommendations: ["Configure Azure OpenAI for detailed analysis"],
      analysis: "Please configure Azure OpenAI for automatic response analysis",
    });
  }

  try {
    // Build the messages array for the API
    const messages = [
      {
        role: "system",
        content:
          "You are an expert medical analysis assistant specializing in patient questionnaire analysis. Provide clinical assessments based on patient responses.",
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    // Call Azure OpenAI API
    const url = `${endpoint}openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 0.95,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Azure OpenAI API error:", errorData);
      throw new Error(`Azure OpenAI API failed: ${response.status}`);
    }

    const data = await response.json();

    // Extract the analysis from the response
    let analysis = data.choices?.[0]?.message?.content;

    // If analysis is not valid, return a fallback
    if (!analysis) {
      console.error("No content in Azure OpenAI response:", data);
      analysis = JSON.stringify({
        urgency: "MEDIUM",
        riskScore: 50,
        keyFindings: ["Analysis generation failed"],
        recommendations: ["Please review responses manually"],
        analysis: "Unable to generate AI analysis",
      });
    }

    // Try to clean up the analysis if it has markdown markers
    if (analysis.includes("```json")) {
      analysis = analysis
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
    }

    return analysis;
  } catch (error) {
    console.error("Error calling Azure OpenAI:", error);
    // Return default analysis if API call fails
    return JSON.stringify({
      urgency: "MEDIUM",
      riskScore: 50,
      keyFindings: ["AI analysis unavailable"],
      recommendations: ["Please review responses manually"],
      analysis:
        error instanceof Error ? `Error: ${error.message}` : "Analysis failed",
    });
  }
}

function parseAnalysisResponse(response: string): AnalysisResult {
  try {
    let parsed: any;

    // Clean up the response if needed
    let cleanResponse = response.trim();

    // Remove markdown code blocks if present
    if (cleanResponse.includes("```json")) {
      cleanResponse = cleanResponse
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
    }

    // Try to parse the JSON
    parsed = JSON.parse(cleanResponse);

    return {
      urgency: parsed.urgency || "MEDIUM",
      riskScore: Math.min(100, Math.max(0, parsed.riskScore || 50)),
      keyFindings: Array.isArray(parsed.keyFindings)
        ? parsed.keyFindings.filter((f: any) => f)
        : ["Analysis complete"],
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations.filter((r: any) => r)
        : ["Review with healthcare provider"],
      analysis: parsed.analysis || "Analysis requires clinical review",
    };
  } catch (error) {
    console.error("Error parsing analysis response:", error);
    console.error("Response was:", response.substring(0, 200));

    return {
      urgency: "MEDIUM",
      riskScore: 50,
      keyFindings: ["Analysis parsing failed"],
      recommendations: ["Please review responses manually"],
      analysis:
        error instanceof Error
          ? `Parsing error: ${error.message}`
          : "Analysis could not be completed",
    };
  }
}

function getDefaultAnalysis(
  responses: any[],
  questions: any[],
  specialty: string
): AnalysisResult {
  // Apply specialty-specific heuristics if AI is not available
  let riskScore = 30;
  const keyFindings: string[] = [];

  // Cardiology-specific analysis
  if (
    specialty === "CARDIOLOGY" ||
    specialty.toLowerCase().includes("cardio")
  ) {
    responses.forEach((resp) => {
      const answer = resp.answer?.toLowerCase() || "";

      // Check for chest pain
      if (
        questions.some(
          (q) =>
            q.id === resp.questionId &&
            q.questionText?.includes("chest pain") &&
            answer.includes("yes")
        )
      ) {
        riskScore += 25;
        keyFindings.push("Chest pain or discomfort reported");
      }

      // Check for shortness of breath frequency
      if (
        answer.includes("often") ||
        answer.includes("frequently") ||
        answer === "daily"
      ) {
        riskScore += 15;
        keyFindings.push("Frequent shortness of breath");
      }

      // Check for palpitations
      if (
        questions.some(
          (q) =>
            q.id === resp.questionId &&
            q.questionText?.includes("palpitations") &&
            answer.includes("yes")
        )
      ) {
        riskScore += 20;
        keyFindings.push("Palpitations reported");
      }

      // Check for leg swelling
      if (
        questions.some(
          (q) =>
            q.id === resp.questionId &&
            q.questionText?.includes("swelling") &&
            answer.includes("yes")
        )
      ) {
        riskScore += 15;
        keyFindings.push("Peripheral swelling detected");
      }

      // Check exercise tolerance
      if (
        questions.some(
          (q) => q.id === resp.questionId && q.questionType === "NUMBER"
        )
      ) {
        const stairCount = parseInt(answer);
        if (stairCount < 2) {
          riskScore += 20;
          keyFindings.push("Poor exercise tolerance");
        }
      }
    });
  }

  // Cap risk score at 100
  riskScore = Math.min(100, riskScore);

  // Determine urgency based on risk score
  let urgency: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  if (riskScore >= 80) urgency = "CRITICAL";
  else if (riskScore >= 60) urgency = "HIGH";
  else if (riskScore >= 40) urgency = "MEDIUM";
  else urgency = "LOW";

  return {
    urgency,
    riskScore,
    keyFindings:
      keyFindings.length > 0 ? keyFindings : ["Standard assessment responses"],
    recommendations: [
      `Schedule follow-up appointment for ${specialty} consultation`,
      "Review all symptoms with healthcare provider",
      "Monitor for any changes in symptoms",
    ],
    analysis: `Based on questionnaire responses, patient shows ${urgency.toLowerCase()} risk profile requiring attention.`,
  };
}

// GET - Analyze responses for a questionnaire assignment
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId");

    if (!assignmentId) {
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 }
      );
    }

    // Get the assignment with responses and questions
    const assignment = await prisma.questionnaireAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        template: {
          include: {
            questions: true,
          },
        },
        responses: true,
        patient: {
          include: {
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

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Check access permissions
    if (user.role === "PATIENT") {
      const patientRecord = await prisma.patient.findUnique({
        where: { userId: user.id },
      });

      if (!patientRecord || assignment.patientId !== patientRecord.id) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    } else if (user.role === "DOCTOR") {
      const template = await prisma.questionnaireTemplate.findUnique({
        where: { id: assignment.templateId },
        select: { doctorId: true },
      });

      if (template?.doctorId !== user.id) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Analyze responses
    const analysis = await analyzeResponsesWithAI(
      assignment.responses,
      assignment.template.questions,
      assignment.template.specialty
    );

    return NextResponse.json({
      success: true,
      data: {
        assignmentId,
        analysis,
        patientName:
          `${assignment.patient?.user.firstName || ""} ${assignment.patient?.user.lastName || ""}`.trim(),
        specialty: assignment.template.specialty,
        responseCount: assignment.responses.length,
        completionStatus: assignment.status,
      },
    });
  } catch (error) {
    console.error("Error analyzing responses:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to analyze responses",
      },
      { status: 500 }
    );
  }
}
