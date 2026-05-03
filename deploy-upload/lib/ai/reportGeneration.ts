/**
 * AI Report Generation Module
 * Automated nursing report generation using OpenAI
 */

import { chatCompletion } from './openai.service';
import { getReportGenerationPrompt } from './prompts';

export interface PatientReportData {
  patientName: string;
  age: number;
  mrn: string;
  conditions: string[];
  vitalData: {
    systolicBP?: number;
    diastolicBP?: number;
    heartRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
    weight?: number;
    notes?: string;
  };
  previousVitals: Array<{
    recordedAt: Date;
    systolicBP?: number;
    diastolicBP?: number;
    heartRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
    weight?: number;
  }>;
  alerts: Array<{
    severity: string;
    message: string;
    createdAt: Date;
  }>;
  enteredBy: string;
}

/**
 * Generate comprehensive nursing report using AI
 */
export async function generateNursingReport(
  data: PatientReportData
): Promise<{ success: boolean; report?: string; error?: string }> {
  try {
    // Generate prompt
    const prompt = getReportGenerationPrompt(data);

    // Get AI-generated report
    const messages = [{ role: 'user' as const, content: prompt }];

    const result = await chatCompletion(messages, {
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5, // Balanced creativity and consistency
      maxTokens: 2000,
    });

    if (!result.success || !result.content) {
      return {
        success: false,
        error: result.error || 'Failed to generate report',
      };
    }

    return {
      success: true,
      report: result.content,
    };
  } catch (error: any) {
    console.error('Report generation error:', error);
    return {
      success: false,
      error: error.message || 'Report generation failed',
    };
  }
}

/**
 * Generate a quick summary (shorter version)
 */
export async function generateQuickSummary(data: {
  patientName: string;
  vitalData: any;
  concerns: string[];
}): Promise<{ success: boolean; summary?: string; error?: string }> {
  try {
    const prompt = `Generate a brief 2-3 sentence clinical summary for:

Patient: ${data.patientName}
Vitals: ${JSON.stringify(data.vitalData)}
Concerns: ${data.concerns.join(', ')}

Focus on immediate status and any critical observations.`;

    const messages = [{ role: 'user' as const, content: prompt }];

    const result = await chatCompletion(messages, {
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      maxTokens: 200,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return {
      success: true,
      summary: result.content,
    };
  } catch (error: any) {
    console.error('Summary generation error:', error);
    return {
      success: false,
      error: error.message || 'Summary generation failed',
    };
  }
}
