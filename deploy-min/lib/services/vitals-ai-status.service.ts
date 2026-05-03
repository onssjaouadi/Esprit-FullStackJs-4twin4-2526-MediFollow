import type { VitalData, SymptomData } from "./vitals-alert.service";

export interface HealthStatus {
  severity: "EXCELLENT" | "GOOD" | "FAIR" | "POOR" | "CRITICAL";
  classification: string;
  insights: string;
  recommendations: string[];
  riskFactors: string[];
  correlations: string[];
}

/**
 * Use Azure OpenAI to intelligently classify vital signs status
 * Goes beyond simple thresholds to provide contextual health analysis
 */
export async function classifyVitalsWithAI(
  vitals: VitalData,
  symptoms: SymptomData,
  patientContext?: {
    age?: number;
    specialty?: string;
    medicalHistory?: string[];
    currentMedications?: string[];
  }
): Promise<HealthStatus> {
  try {
    const AZURE_KEY = process.env.AZURE_OPENAI_API_KEY;
    const AZURE_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
    const AZURE_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";
    const AZURE_VERSION =
      process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview";

    if (!AZURE_KEY || !AZURE_ENDPOINT) {
      console.warn(
        "[VitalsAI] Azure OpenAI configuration missing, returning default status"
      );
      return getDefaultHealthStatus(vitals, symptoms);
    }

    // Prepare vitals summary
    const vitalsSummary = `
Temperature: ${vitals.temperature ?? "N/A"}°C
Heart Rate: ${vitals.heartRate ?? "N/A"} bpm
Systolic BP: ${vitals.systolicBP ?? "N/A"} mmHg
Diastolic BP: ${vitals.diastolicBP ?? "N/A"} mmHg
Oxygen Saturation: ${vitals.oxygenSaturation ?? "N/A"}%
Respiratory Rate: ${vitals.respiratoryRate ?? "N/A"} breaths/min
    `.trim();

    // Prepare symptoms summary
    const symptomsSummary = [
      symptoms?.general?.fatigue &&
        `Fatigue level: ${symptoms.general.fatigue}/10`,
      symptoms?.general?.fever && "Fever reported",
      symptoms?.general?.lossOfAppetite &&
        `Loss of appetite: ${symptoms.general.lossOfAppetite}/10`,
      symptoms?.specialty?.chestPain &&
        `Chest pain: ${symptoms.specialty.chestPain}/10`,
      symptoms?.specialty?.palpitations && "Palpitations reported",
      symptoms?.specialty?.shortness &&
        `Shortness of breath: ${symptoms.specialty.shortness}/10`,
      symptoms?.specialty?.cough && "Cough reported",
      symptoms?.specialty?.nausea && `Nausea: ${symptoms.specialty.nausea}/10`,
      symptoms?.specialty?.vomiting && "Vomiting reported",
      symptoms?.specialty?.diarrhea && "Diarrhea reported",
      symptoms?.specialty?.dizziness && "Dizziness reported",
      symptoms?.specialty?.confusion && "Confusion reported",
    ]
      .filter(Boolean)
      .join("\n");

    const systemPrompt = `You are an expert AI Health Status Analyzer integrated in the MediFollow patient monitoring platform.

Your task is to analyze the patient's vital signs and symptoms and provide an intelligent health status classification.

IMPORTANT: You MUST respond with ONLY a valid JSON object with NO additional text before or after.

The JSON must have exactly these fields:
{
  "severity": "EXCELLENT|GOOD|FAIR|POOR|CRITICAL",
  "classification": "Brief health status name (e.g., 'Stable - Normal Vitals', 'Mild Fever - Monitor', 'Severe Hypertension - Urgent')",
  "insights": "2-3 sentence description of patient's current health state and what the vitals indicate",
  "recommendations": ["Action 1", "Action 2", "Action 3"],
  "riskFactors": ["Risk factor 1", "Risk factor 2"],
  "correlations": ["How vital A relates to vital B", "Pattern observed"]
}

Severity rules:
- EXCELLENT: All vitals normal, no symptoms
- GOOD: Minor variations, well-controlled
- FAIR: Moderate anomalies, requires monitoring
- POOR: Multiple concerning values, needs attention
- CRITICAL: Dangerous values, immediate intervention needed

Consider vital thresholds, symptom patterns, and holistic health picture.`;

    const userPrompt = `Analyze this patient's health:

VITAL SIGNS:
${vitalsSummary}

SYMPTOMS REPORTED:
${symptomsSummary || "None reported"}

PATIENT CONTEXT:
Age: ${patientContext?.age ?? "Not provided"}
Specialty: ${patientContext?.specialty ?? "General Medicine"}
Medical History: ${patientContext?.medicalHistory?.join(", ") ?? "None provided"}
Current Medications: ${patientContext?.currentMedications?.join(", ") ?? "None provided"}

Provide comprehensive health status classification and insights.`;

    console.log("[VitalsAI] Sending vitals to Azure OpenAI for analysis...");

    const url = `${AZURE_ENDPOINT}/openai/deployments/${AZURE_DEPLOYMENT}/chat/completions?api-version=${AZURE_VERSION}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "api-key": AZURE_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[VitalsAI Azure Error]", response.status, errorText);
      return getDefaultHealthStatus(vitals, symptoms);
    }

    const data = await response.json();
    const rawContent = data.choices[0]?.message?.content || "{}";

    try {
      const aiResponse = JSON.parse(rawContent);
      console.log(
        "[VitalsAI] AI classification successful:",
        aiResponse.severity
      );

      // Validate response structure
      if (
        aiResponse.severity &&
        aiResponse.classification &&
        aiResponse.insights &&
        Array.isArray(aiResponse.recommendations) &&
        Array.isArray(aiResponse.riskFactors) &&
        Array.isArray(aiResponse.correlations)
      ) {
        return {
          severity: aiResponse.severity,
          classification: aiResponse.classification,
          insights: aiResponse.insights,
          recommendations: aiResponse.recommendations,
          riskFactors: aiResponse.riskFactors,
          correlations: aiResponse.correlations,
        };
      }
    } catch (parseError) {
      console.error("[VitalsAI] JSON parse error:", rawContent);
    }

    return getDefaultHealthStatus(vitals, symptoms);
  } catch (error) {
    console.error("[VitalsAI] Error during classification:", error);
    return getDefaultHealthStatus();
  }
}

/**
 * Rule-based fallback when AI is unavailable
 */
function getDefaultHealthStatus(
  vitals?: VitalData,
  symptoms?: SymptomData
): HealthStatus {
  if (!vitals) {
    return {
      severity: "FAIR",
      classification: "Data Unavailable",
      insights: "Vital signs data is required for assessment.",
      recommendations: ["Submit vital signs for health assessment"],
      riskFactors: [],
      correlations: [],
    };
  }

  // Simple rule-based classification
  const anomalies = [];
  const risks: string[] = [];

  if (vitals.temperature && vitals.temperature >= 38.5) {
    anomalies.push("High fever");
    risks.push("Possible infection");
  }
  if (vitals.heartRate && vitals.heartRate > 120) {
    anomalies.push("Elevated heart rate");
    risks.push("Cardiac stress");
  }
  if (vitals.oxygenSaturation && vitals.oxygenSaturation < 90) {
    anomalies.push("Low oxygen levels");
    risks.push("Respiratory compromise");
  }
  if (vitals.systolicBP && vitals.systolicBP > 140) {
    anomalies.push("Elevated blood pressure");
    risks.push("Hypertensive state");
  }

  let severity: HealthStatus["severity"] = "GOOD";
  if (anomalies.length >= 2) severity = "POOR";
  if (anomalies.length >= 3) severity = "CRITICAL";
  if (anomalies.length === 0) severity = "EXCELLENT";

  return {
    severity,
    classification:
      anomalies.length === 0
        ? "All Vitals Normal"
        : `${anomalies.length} Anomalies Detected`,
    insights:
      anomalies.length === 0
        ? "All vital signs are within normal ranges."
        : `Detected ${anomalies.length} anomalies: ${anomalies.join(", ")}.`,
    recommendations:
      anomalies.length === 0
        ? ["Continue regular monitoring", "Maintain current health practices"]
        : [
            "Contact healthcare provider",
            "Increase monitoring frequency",
            "Review medications",
          ],
    riskFactors: risks,
    correlations: [],
  };
}
