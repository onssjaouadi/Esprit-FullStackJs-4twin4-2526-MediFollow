"use client";

import { Volume2, Check, X } from "lucide-react";

interface TranscriptDisplayProps {
  transcript: string;
  interimTranscript: string;
  parsedVitals?: {
    systolicBP?: number | null;
    diastolicBP?: number | null;
    heartRate?: number | null;
    temperature?: number | null;
    oxygenSaturation?: number | null;
    weight?: number | null;
    notes?: string;
  } | null;
  isListening: boolean;
}

export function TranscriptDisplay({
  transcript,
  interimTranscript,
  parsedVitals,
  isListening,
}: TranscriptDisplayProps) {
  if (!transcript && !interimTranscript && !isListening) {
    return null;
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-4">
      {/* Live Transcription */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Volume2 className="text-blue-600 dark:text-blue-400" size={16} />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {isListening ? "Listening..." : "Transcription"}
          </h3>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-lg p-3 min-h-[60px]">
          <p className="text-gray-900 dark:text-white">
            {transcript}
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              {interimTranscript}
            </span>
            {isListening && !transcript && !interimTranscript && (
              <span className="text-gray-400 italic">
                Speak now...
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Parsed Vitals Preview */}
      {parsedVitals && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Valeurs détectées
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <VitalPill
              label="TA Systolique"
              value={parsedVitals.systolicBP}
              unit="mmHg"
            />
            <VitalPill
              label="TA Diastolique"
              value={parsedVitals.diastolicBP}
              unit="mmHg"
            />
            <VitalPill
              label="Fréquence"
              value={parsedVitals.heartRate}
              unit="bpm"
            />
            <VitalPill
              label="Température"
              value={parsedVitals.temperature}
              unit="°C"
            />
            <VitalPill
              label="SpO2"
              value={parsedVitals.oxygenSaturation}
              unit="%"
            />
            <VitalPill
              label="Poids"
              value={parsedVitals.weight}
              unit="kg"
            />
          </div>
          
          {parsedVitals.notes && (
            <div className="mt-3 bg-white dark:bg-gray-900 rounded-lg p-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Notes:</strong> {parsedVitals.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function VitalPill({
  label,
  value,
  unit,
}: {
  label: string;
  value?: number | null;
  unit: string;
}) {
  const hasValue = value !== null && value !== undefined;

  return (
    <div
      className={`
        flex items-center justify-between px-3 py-2 rounded-lg border
        ${
          hasValue
            ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
            : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        }
      `}
    >
      <div className="flex-1">
        <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {hasValue ? `${value} ${unit}` : "—"}
        </p>
      </div>
      {hasValue ? (
        <Check className="text-green-600 dark:text-green-400" size={16} />
      ) : (
        <X className="text-gray-400" size={16} />
      )}
    </div>
  );
}
