/**
 * Symptom utility functions (client-safe)
 * These are just helper functions for display
 */

export const SYMPTOM_TYPES = [
  { id: "pain", label: "Douleur", icon: "🩹" },
  { id: "fatigue", label: "Fatigue", icon: "😴" },
  { id: "shortness_of_breath", label: "Essoufflement", icon: "😤" },
  { id: "nausea", label: "Nausée", icon: "🤢" },
  { id: "other", label: "Autre", icon: "❓" },
];

/**
 * Get symptom label by type
 */
export function getSymptomLabel(symptomType: string): string {
  const symptom = SYMPTOM_TYPES.find((s) => s.id === symptomType);
  return symptom ? symptom.label : symptomType;
}

/**
 * Get symptom icon by type
 */
export function getSymptomIcon(symptomType: string): string {
  const symptom = SYMPTOM_TYPES.find((s) => s.id === symptomType);
  return symptom ? symptom.icon : "❓";
}

/**
 * Format severity level
 */
export function formatSeverity(severity: string): string {
  switch (severity) {
    case "MILD":
      return "Light";
    case "MODERATE":
      return "Modéré";
    case "SEVERE":
      return "Sévère";
    default:
      return severity;
  }
}

/**
 * Get severity color class
 */
export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "MILD":
      return "text-green-600";
    case "MODERATE":
      return "text-orange-600";
    case "SEVERE":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
}

/**
 * Get severity background color
 */
export function getSeverityBgColor(severity: string): string {
  switch (severity) {
    case "MILD":
      return "bg-green-50";
    case "MODERATE":
      return "bg-orange-50";
    case "SEVERE":
      return "bg-red-50";
    default:
      return "bg-gray-50";
  }
}
