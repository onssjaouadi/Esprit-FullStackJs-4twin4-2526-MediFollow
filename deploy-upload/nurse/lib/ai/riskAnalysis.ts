/**
 * AI Risk Analysis Module
 * Intelligent patient risk scoring using OpenAI
 */

import { chatCompletionJSON } from './openai.service';
import { getRiskAnalysisPrompt } from './prompts';

export interface RiskAnalysisResult {
  riskScore: number;
  riskLevel: string;
  trendIndicator: 'improving' | 'stable' | 'declining';
  concerns: string[];
  recommendations: string[];
  summary: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Analyze patient vital signs and calculate AI-powered risk score
 */
export async function analyzePatientRisk(data: {
  patientName: string;
  age: number;
  conditions: string[];
  baseline: {
    systolicBP?: number;
    diastolicBP?: number;
    heartRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
  };
  vitalHistory: Array<{
    recordedAt: Date;
    systolicBP?: number;
    diastolicBP?: number;
    heartRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
    weight?: number;
  }>;
  latestVitals: {
    systolicBP?: number;
    diastolicBP?: number;
    heartRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
    weight?: number;
  };
}): Promise<{ success: boolean; analysis?: RiskAnalysisResult; error?: string }> {
  try {
    // Generate prompt
    const prompt = getRiskAnalysisPrompt(data);

    // Get AI analysis
    const messages = [{ role: 'user' as const, content: prompt }];

    const result = await chatCompletionJSON<RiskAnalysisResult>(messages, {
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3, // Lower temperature for more consistent medical analysis
      maxTokens: 1000,
    });

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to analyze patient risk',
      };
    }

    // Validate the response structure
    const analysis = result.data;
    if (
      typeof analysis.riskScore !== 'number' ||
      !analysis.trendIndicator ||
      !Array.isArray(analysis.concerns) ||
      !Array.isArray(analysis.recommendations)
    ) {
      return {
        success: false,
        error: 'Invalid AI response structure',
      };
    }

    // Ensure risk score is within bounds
    analysis.riskScore = Math.max(0, Math.min(100, analysis.riskScore));

    return {
      success: true,
      analysis,
    };
  } catch (error: any) {
    console.error('Risk analysis error:', error);
    return {
      success: false,
      error: error.message || 'Risk analysis failed',
    };
  }
}

/**
 * Calculate rule-based fallback risk score (if AI fails)
 */
export function calculateFallbackRiskScore(vitals: {
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
}): number {
  let riskScore = 0;

  // Blood Pressure risks
  if (vitals.systolicBP) {
    if (vitals.systolicBP >= 180 || vitals.systolicBP < 90) riskScore += 30;
    else if (vitals.systolicBP >= 160 || vitals.systolicBP < 100) riskScore += 20;
    else if (vitals.systolicBP >= 140 || vitals.systolicBP < 110) riskScore += 10;
  }

  if (vitals.diastolicBP) {
    if (vitals.diastolicBP >= 120 || vitals.diastolicBP < 60) riskScore += 30;
    else if (vitals.diastolicBP >= 100 || vitals.diastolicBP < 70) riskScore += 20;
    else if (vitals.diastolicBP >= 90 || vitals.diastolicBP < 75) riskScore += 10;
  }

  // Heart Rate risks
  if (vitals.heartRate) {
    if (vitals.heartRate >= 120 || vitals.heartRate < 50) riskScore += 25;
    else if (vitals.heartRate >= 100 || vitals.heartRate < 60) riskScore += 15;
  }

  // Temperature risks
  if (vitals.temperature) {
    if (vitals.temperature >= 39 || vitals.temperature < 35.5) riskScore += 25;
    else if (vitals.temperature >= 38 || vitals.temperature < 36) riskScore += 15;
  }

  // Oxygen Saturation risks
  if (vitals.oxygenSaturation) {
    if (vitals.oxygenSaturation < 90) riskScore += 30;
    else if (vitals.oxygenSaturation < 95) riskScore += 15;
  }

  return Math.min(100, riskScore);
}

/**
 * Get risk level from score
 */
export function getRiskLevel(
  score: number
): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 80) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

/**
 * Get risk color for UI
 */
export function getRiskColor(score: number): string {
  if (score >= 80) return 'red';
  if (score >= 50) return 'orange';
  if (score >= 30) return 'yellow';
  return 'green';
}
