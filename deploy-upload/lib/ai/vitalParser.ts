/**
 * AI Vital Signs Parser
 * Parse vital signs from voice transcriptions using OpenAI
 */

import { chatCompletionJSON } from './openai.service';
import { getVitalParserPrompt } from './prompts';

export interface ParsedVitals {
  systolicBP: number | null;
  diastolicBP: number | null;
  heartRate: number | null;
  temperature: number | null;
  oxygenSaturation: number | null;
  weight: number | null;
  notes: string;
}

/**
 * Parse vital signs from voice transcript using AI
 */
export async function parseVitalSigns(
  transcript: string
): Promise<{ success: boolean; vitals?: ParsedVitals; error?: string }> {
  try {
    if (!transcript || transcript.trim().length === 0) {
      return { success: false, error: 'Empty transcript' };
    }

    // Generate prompt
    const prompt = getVitalParserPrompt(transcript);

    // Get AI parsing
    const messages = [{ role: 'user' as const, content: prompt }];

    const result = await chatCompletionJSON<ParsedVitals>(messages, {
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3, // Very low temperature for precise extraction
      maxTokens: 500,
    });

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to parse vitals',
      };
    }

    return {
      success: true,
      vitals: result.data,
    };
  } catch (error: any) {
    console.error('Vital parsing error:', error);
    return {
      success: false,
      error: error.message || 'Vital parsing failed',
    };
  }
}

/**
 * Validate parsed vitals are within reasonable ranges
 */
export function validateParsedVitals(vitals: ParsedVitals): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (vitals.systolicBP !== null) {
    if (vitals.systolicBP < 50 || vitals.systolicBP > 250) {
      errors.push(
        `Pression systolique invalide: ${vitals.systolicBP} (doit être 50-250 mmHg)`
      );
    }
  }

  if (vitals.diastolicBP !== null) {
    if (vitals.diastolicBP < 30 || vitals.diastolicBP > 150) {
      errors.push(
        `Pression diastolique invalide: ${vitals.diastolicBP} (doit être 30-150 mmHg)`
      );
    }
  }

  if (vitals.heartRate !== null) {
    if (vitals.heartRate < 30 || vitals.heartRate > 220) {
      errors.push(
        `Fréquence cardiaque invalide: ${vitals.heartRate} (doit être 30-220 bpm)`
      );
    }
  }

  if (vitals.temperature !== null) {
    if (vitals.temperature < 30 || vitals.temperature > 45) {
      errors.push(
        `Température invalide: ${vitals.temperature} (doit être 30-45°C)`
      );
    }
  }

  if (vitals.oxygenSaturation !== null) {
    if (vitals.oxygenSaturation < 50 || vitals.oxygenSaturation > 100) {
      errors.push(
        `Saturation invalide: ${vitals.oxygenSaturation} (doit être 50-100%)`
      );
    }
  }

  if (vitals.weight !== null) {
    if (vitals.weight < 20 || vitals.weight > 300) {
      errors.push(
        `Poids invalide: ${vitals.weight} (doit être 20-300 kg)`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
