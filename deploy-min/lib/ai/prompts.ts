/**
 * AI Prompt Templates
 * Centralized prompt engineering for all AI features
 */

/**
 * System prompts for different AI tasks
 */
export const SYSTEM_PROMPTS = {
  MEDICAL_ASSISTANT: `You are a medical AI assistant specializing in vital sign analysis and patient monitoring.

IMPORTANT CONSTRAINTS:
- Do not make diagnoses
- Only analyze vital trends and flag concerns
- Provide observations, not medical advice
- Always recommend healthcare provider consultation for critical issues
- Use metric units (mmHg, bpm, °C, %, kg)
- Be concise and professional`,

  RISK_ANALYZER: `You are a clinical AI assistant specialized in patient risk assessment based on vital signs.

TASK: Analyze vital sign trends and calculate risk scores.

CONSTRAINTS:
- Output valid JSON only
- Risk score: 0-100 (0=stable, 100=critical)
- Consider baseline deviations
- Flag multi-parameter anomalies
- Do not diagnose, only assess risk`,

  REPORT_GENERATOR: `You are a professional nursing documentation AI assistant.

TASK: Generate comprehensive nursing reports based on vital signs and patient data.

STYLE:
- Clear, professional medical documentation
- Use standard nursing terminology
- Structured format with clear sections
- Concise yet thorough
- Focus on actionable observations`,

  VITAL_PARSER: `You are a clinical data extraction AI.

TASK: Extract vital sign values from natural language transcriptions.

RULES:
- Output valid JSON only
- Use null for missing values
- Handle French and English
- Parse variations: "120 over 80", "120/80", "tension 120 sur 80"
- Return structured data: BP, HR, Temp, SpO2, Weight`,
};

/**
 * Risk Analysis Prompt Template
 */
export function getRiskAnalysisPrompt(data: {
  patientName: string;
  age: number;
  conditions: string[];
  baseline: any;
  vitalHistory: any[];
  latestVitals: any;
}) {
  return `${SYSTEM_PROMPTS.RISK_ANALYZER}

Patient Profile:
- Name: ${data.patientName}
- Age: ${data.age} years
- Medical Conditions: ${data.conditions.join(', ') || 'None documented'}

Baseline Vitals:
${JSON.stringify(data.baseline, null, 2)}

Recent Vital History (Last 7 Days):
${JSON.stringify(data.vitalHistory, null, 2)}

Latest Vital Signs Entry:
${JSON.stringify(data.latestVitals, null, 2)}

ANALYZE and respond with valid JSON:
{
  "riskScore": <number 0-100>,
  "trendIndicator": "improving" | "stable" | "declining",
  "concerns": ["concern 1", "concern 2", ...],
  "recommendations": ["action 1", "action 2", ...],
  "summary": "<brief 2-3 sentence summary>",
  "urgency": "low" | "medium" | "high" | "critical"
}`;
}

/**
 * Report Generation Prompt Template
 */
export function getReportGenerationPrompt(data: {
  patientName: string;
  age: number;
  mrn: string;
  conditions: string[];
  vitalData: any;
  previousVitals: any[];
  alerts: any[];
  enteredBy: string;
}) {
  return `${SYSTEM_PROMPTS.REPORT_GENERATOR}

NURSING REPORT REQUEST

Patient Information:
- Name: ${data.patientName}
- Age: ${data.age}
- MRN: ${data.mrn}
- Known Conditions: ${data.conditions.join(', ') || 'None'}

Current Vital Signs Entry:
${JSON.stringify(data.vitalData, null, 2)}

Previous 3 Readings:
${JSON.stringify(data.previousVitals, null, 2)}

Active Alerts:
${data.alerts.length > 0 ? JSON.stringify(data.alerts, null, 2) : 'No active alerts'}

Entered by: ${data.enteredBy}

Generate a comprehensive nursing report in MARKDOWN format with these sections:

# Patient Status Report

## 1. Current Status Summary
[Brief overview of patient's current condition]

## 2. Vital Signs Analysis
[Detailed analysis of entered vitals with comparison to normal ranges]

## 3. Trend Observations
[Comparison with previous readings, identify improving/declining trends]

## 4. Risk Assessment
[Assessment of any concerning patterns or values]

## 5. Nursing Actions Recommended
[Specific actions the nurse should consider]

## 6. Doctor Notification
[Whether doctor should be notified and why]

Keep the report professional, concise, and actionable.`;
}

/**
 * Vital Signs Parser Prompt Template
 */
export function getVitalParserPrompt(transcript: string) {
  return `${SYSTEM_PROMPTS.VITAL_PARSER}

Extract vital signs from this transcription:

"${transcript}"

Expected vital signs to extract:
- Blood Pressure: systolic/diastolic (mmHg)
- Heart Rate (bpm)
- Temperature (°C)
- Oxygen Saturation (%)
- Weight (kg)
- Any notes/observations

Return ONLY valid JSON in this exact format:
{
  "systolicBP": <number or null>,
  "diastolicBP": <number or null>,
  "heartRate": <number or null>,
  "temperature": <number or null>,
  "oxygenSaturation": <number or null>,
  "weight": <number or null>,
  "notes": "<string or empty>"
}

Rules:
- Use null if value not mentioned
- Accept variations: "120 over 80", "120/80", "tension artérielle 120 sur 80"
- Temperature: accept both Celsius and convert if needed
- Notes: include any observations mentioned`;
}

/**
 * Cohort Analysis Prompt Template
 */
export function getCohortAnalysisPrompt(data: {
  nurseName: string;
  patientCount: number;
  patientSummaries: any[];
}) {
  return `${SYSTEM_PROMPTS.MEDICAL_ASSISTANT}

COHORT ANALYSIS REQUEST

Nurse: ${data.nurseName}
Assigned Patients: ${data.patientCount}

Patient Data Summary (Last 24 hours):
${JSON.stringify(data.patientSummaries, null, 2)}

Provide daily insights as valid JSON:
{
  "overallTrend": "stable" | "improving" | "concerning",
  "highPriorityPatients": [
    {
      "patientId": "<id>",
      "reason": "<why priority>",
      "recommendedAction": "<action>"
    }
  ],
  "predictiveAlerts": [
    {
      "patientId": "<id>",
      "prediction": "<what might happen>",
      "timeframe": "<when>",
      "confidence": "low" | "medium" | "high"
    }
  ],
  "workloadDistribution": "<suggestions for prioritizing care>",
  "insights": ["insight 1", "insight 2", ...]
}`;
}

/**
 * Alert Summarization Prompt Template
 */
export function getAlertSummaryPrompt(alerts: any[]) {
  return `${SYSTEM_PROMPTS.MEDICAL_ASSISTANT}

Summarize these related alerts into a cohesive clinical summary:

${JSON.stringify(alerts, null, 2)}

Provide a concise summary that:
1. Groups related alerts
2. Identifies patterns
3. Suggests priority level
4. Recommends immediate actions

Return valid JSON:
{
  "summary": "<concise clinical summary>",
  "pattern": "<identified pattern>",
  "priority": "low" | "medium" | "high" | "critical",
  "recommendedActions": ["action 1", "action 2"]
}`;
}

/**
 * Predictive Analysis Prompt Template
 */
export function getPredictiveAnalysisPrompt(data: {
  patientId: string;
  vitalTrends: any[];
  currentVitals: any;
}) {
  return `${SYSTEM_PROMPTS.RISK_ANALYZER}

PREDICTIVE ANALYSIS REQUEST

Patient ID: ${data.patientId}

Vital Sign Trends (Last 72 hours):
${JSON.stringify(data.vitalTrends, null, 2)}

Current Vitals:
${JSON.stringify(data.currentVitals, null, 2)}

Based on the trend, predict potential issues in the next 6-12 hours.

Return valid JSON:
{
  "predictions": [
    {
      "parameter": "<which vital>",
      "prediction": "<what might happen>",
      "timeframe": "<hours>",
      "confidence": 0-100,
      "recommendation": "<preventive action>"
    }
  ],
  "overallRisk": "low" | "medium" | "high",
  "earlyWarning": true | false
}`;
}
