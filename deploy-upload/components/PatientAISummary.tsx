"use client";

import { useEffect, useState } from "react";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Copy,
  Download,
} from "lucide-react";

interface PatientAISummaryProps {
  patientId: string;
  patientName: string;
  diagnosis?: string;
  age: number;
  gender: string;
  vitalRecords?: any[];
  analyses?: any[];
  alerts?: any[];
  symptoms?: any[];
  medications?: any[];
}

export default function PatientAISummary({
  patientId,
  patientName,
  diagnosis,
  age,
  gender,
  vitalRecords = [],
  analyses = [],
  alerts = [],
  symptoms = [],
  medications = [],
}: PatientAISummaryProps) {
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateSummary();
  }, [patientId]);

  async function generateSummary() {
    setLoading(true);

    try {
      // Analyze vital records
      const latestVitals = vitalRecords?.[0];
      const vitalTrends = analyzeVitalTrends(vitalRecords || []);

      // Analyze latest analyses
      const recentAnalyses = analyses?.slice(0, 5) || [];
      const abnormalAnalyses = recentAnalyses.filter((a: any) => a.isAbnormal);

      // Count alerts and symptoms
      const criticalAlerts =
        alerts?.filter((a: any) => a.severity === "CRITICAL") || [];
      const activeAlerts =
        alerts?.filter((a: any) => a.status === "OPEN") || [];

      // Generate comprehensive summary
      const summaryText = generateComprehensiveSummary(
        patientName,
        age,
        gender,
        diagnosis,
        latestVitals,
        vitalTrends,
        recentAnalyses,
        abnormalAnalyses,
        activeAlerts,
        criticalAlerts,
        symptoms,
        medications
      );

      setSummary(summaryText);
    } catch (error) {
      console.error("Error generating summary:", error);
      setSummary("Erreur lors de la génération du résumé");
    }

    setLoading(false);
  }

  function analyzeVitalTrends(vitals: any[]) {
    if (vitals.length < 2) return { status: "Données insuffisantes" };

    const recent = vitals.slice(0, 5);
    const avgHeartRate =
      recent.reduce((sum: number, v: any) => sum + (v.heartRate || 0), 0) /
      recent.length;
    const avgSystolic =
      recent.reduce((sum: number, v: any) => sum + (v.systolicBP || 0), 0) /
      recent.length;
    const avgDiastolic =
      recent.reduce((sum: number, v: any) => sum + (v.diastolicBP || 0), 0) /
      recent.length;

    return {
      avgHeartRate: Math.round(avgHeartRate),
      avgSystolic: Math.round(avgSystolic),
      avgDiastolic: Math.round(avgDiastolic),
      trend:
        vitals[0].heartRate > vitals[1]?.heartRate
          ? "Augmentation"
          : "Diminution",
    };
  }

  function generateComprehensiveSummary(
    name: string,
    age: number,
    gender: string,
    diagnosis: string | undefined,
    latestVitals: any,
    vitalTrends: any,
    recentAnalyses: any[],
    abnormalAnalyses: any[],
    activeAlerts: any[],
    criticalAlerts: any[],
    symptoms: any[],
    medications: any[]
  ): string {
    let text = `RÉSUMÉ CLINIQUE COMPLET - ${name.toUpperCase()}\n`;
    text += `${"=".repeat(70)}\n\n`;

    // Patient Demographics
    text += `📋 INFORMATIONS DU PATIENT\n`;
    text += `${"─".repeat(70)}\n`;
    text += `• Âge: ${age} ans | Sexe: ${gender}\n`;
    if (diagnosis) {
      text += `• Diagnostic Principal: ${diagnosis}\n`;
    }
    text += `\n`;

    // Current Vital Signs
    if (latestVitals) {
      text += `💓 SIGNES VITAUX ACTUELS\n`;
      text += `${"─".repeat(70)}\n`;
      text += `• Fréquence Cardiaque: ${latestVitals.heartRate || "N/A"} bpm`;
      if (latestVitals.heartRate) {
        text +=
          latestVitals.heartRate > 100
            ? " (↑ Tachycardie)"
            : latestVitals.heartRate < 60
              ? " (↓ Bradycardie)"
              : " (✓ Normal)";
      }
      text += `\n`;
      if (latestVitals.systolicBP && latestVitals.diastolicBP) {
        text += `• Tension Artérielle: ${latestVitals.systolicBP}/${latestVitals.diastolicBP} mmHg`;
        const systolic = latestVitals.systolicBP;
        if (systolic >= 140) text += " (↑ Hypertension)";
        else if (systolic < 90) text += " (↓ Hypotension)";
        else text += " (✓ Normal)";
        text += `\n`;
      }
      if (latestVitals.temperature) {
        text += `• Température: ${latestVitals.temperature}°C`;
        text += latestVitals.temperature > 37.5 ? " (↑ Fièvre)" : " (✓ Normal)";
        text += `\n`;
      }
      if (latestVitals.oxygenSaturation) {
        text += `• Saturation O2: ${latestVitals.oxygenSaturation}%`;
        text +=
          latestVitals.oxygenSaturation < 95 ? " (↓ Basse)" : " (✓ Normal)";
        text += `\n`;
      }
      text += `\n`;
    }

    // Vital Trends
    if (vitalTrends && vitalTrends.avgHeartRate) {
      text += `📊 TENDANCES (Dernières 5 mesures)\n`;
      text += `${"─".repeat(70)}\n`;
      text += `• FC Moyenne: ${vitalTrends.avgHeartRate} bpm (${vitalTrends.trend})\n`;
      text += `• TA Moyenne: ${vitalTrends.avgSystolic}/${vitalTrends.avgDiastolic} mmHg\n`;
      text += `\n`;
    }

    // Recent Analyses
    if (recentAnalyses.length > 0) {
      text += `🧪 ANALYSES MÉDICALES RÉCENTES\n`;
      text += `${"─".repeat(70)}\n`;
      recentAnalyses.slice(0, 3).forEach((analysis: any) => {
        const statusIcon = analysis.isAbnormal ? "⚠️" : "✓";
        text += `• ${statusIcon} ${analysis.testName} (${new Date(analysis.analysisDate).toLocaleDateString("fr-FR")})\n`;
        if (analysis.resultSummary) {
          text += `  └─ ${analysis.resultSummary.substring(0, 100)}...\n`;
        }
        text += `  Statut: ${
          analysis.status === "COMPLETED"
            ? "Terminé"
            : analysis.status === "PENDING"
              ? "En attente"
              : analysis.status
        }\n`;
      });
      if (abnormalAnalyses.length > 0) {
        text += `\n⚠️  ANALYSES ANORMALES: ${abnormalAnalyses.length} détectée(s)\n`;
        abnormalAnalyses.forEach((analysis: any) => {
          text += `  • ${analysis.testName}\n`;
        });
      }
      text += `\n`;
    }

    // Current Medications
    if (medications && medications.length > 0) {
      text += `💊 TRAITEMENTS EN COURS\n`;
      text += `${"─".repeat(70)}\n`;
      medications.forEach((med: any) => {
        text += `• ${med.name} - ${med.dosage}\n`;
        text += `  Fréquence: ${med.frequency}\n`;
      });
      text += `\n`;
    }

    // Symptoms
    if (symptoms && symptoms.length > 0) {
      text += `🔔 SYMPTÔMES SIGNALÉS\n`;
      text += `${"─".repeat(70)}\n`;
      symptoms.slice(0, 5).forEach((symptom: any) => {
        const severityIcon =
          symptom.severity === "HIGH"
            ? "🔴"
            : symptom.severity === "MEDIUM"
              ? "🟠"
              : "🟡";
        text += `${severityIcon} ${symptom.symptomType} (${symptom.severity})\n`;
        if (symptom.description) {
          text += `  └─ ${symptom.description}\n`;
        }
      });
      text += `\n`;
    }

    // Alerts Summary
    if (activeAlerts && activeAlerts.length > 0) {
      text += `🚨 ALERTES ACTIVES\n`;
      text += `${"─".repeat(70)}\n`;
      text += `Alertes Critiques: ${criticalAlerts.length}\n`;
      text += `Total Alertes Ouvertes: ${activeAlerts.length}\n`;
      activeAlerts.slice(0, 3).forEach((alert: any) => {
        text += `• [${alert.severity}] ${alert.message}\n`;
      });
      text += `\n`;
    }

    // Clinical Recommendations
    text += `💡 OBSERVATIONS CLINIQUES\n`;
    text += `${"─".repeat(70)}\n`;

    const recommendations = [];

    if (criticalAlerts.length > 0) {
      recommendations.push(
        `⚠️  Alertes critiques détectées: Action immédiate recommandée`
      );
    }

    if (abnormalAnalyses.length > 0) {
      recommendations.push(
        `📌 ${abnormalAnalyses.length} analyse(s) anormale(s) nécessite(nt) suivi`
      );
    }

    if (
      latestVitals?.heartRate &&
      (latestVitals.heartRate > 100 || latestVitals.heartRate < 60)
    ) {
      recommendations.push(
        `💓 Fréquence cardiaque anormale: Rythme à surveiller`
      );
    }

    if (latestVitals?.systolicBP && latestVitals.systolicBP >= 140) {
      recommendations.push(
        `🩺 Tension artérielle élevée: Vérifier le traitement`
      );
    }

    if (medications && medications.length === 0) {
      recommendations.push(`💊 Aucun médicament en cours: Évaluer si besoin`);
    }

    if (symptoms && symptoms.length > 0) {
      recommendations.push(`🔔 Symptômes actifs: Consulter avec le patient`);
    }

    if (recommendations.length === 0) {
      text += `✓ Patient stable avec signes vitaux normaux et analyses satisfaisantes\n`;
    } else {
      recommendations.forEach((rec: string) => {
        text += `${rec}\n`;
      });
    }

    text += `\n`;
    text += `${"=".repeat(70)}\n`;
    text += `Généré le: ${new Date().toLocaleString("fr-FR")}\n`;

    return text;
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadAsText() {
    const element = document.createElement("a");
    const file = new Blob([summary], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `resume-patient-${patientName}-${new Date().getTime()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
            <Brain className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Résumé Clinique IA
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Analyse complète du patient basée sur ses analyses et signes
              vitaux
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          <span className="ml-3 text-gray-600 dark:text-gray-300">
            Génération du résumé...
          </span>
        </div>
      ) : (
        <>
          {/* Summary Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-4 border border-gray-200 dark:border-gray-700">
            <pre className="text-sm text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap break-words overflow-auto max-h-96">
              {summary}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={copyToClipboard}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              <Copy className="w-4 h-4" />
              {copied ? "Copié ✓" : "Copier"}
            </button>
            <button
              onClick={downloadAsText}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Télécharger
            </button>
          </div>

          {/* Key Metrics */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Analyses
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyses?.length || 0}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Anormales
              </div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {(analyses || []).filter((a: any) => a.isAbnormal).length}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Alertes
              </div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {(alerts || []).filter((a: any) => a.status === "OPEN").length}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Traitements
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {medications?.length || 0}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
