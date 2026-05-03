import { redirect } from "next/navigation";
import {
  BarChart3,
  TrendingUp,
  Users,
  AlertCircle,
  FlaskConical,
} from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getPatientsByDoctorSpecialty } from "@/lib/actions/patient.actions";
import { getAlertsByDoctorSpecialty } from "@/lib/actions/alert.actions";
import { getAnalysesByDoctorSpecialty } from "@/lib/actions/analysis.actions";
import AddAnalysisButton from "@/components/AddAnalysisButton";
import AnalysisTableActions from "@/components/AnalysisTableActions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DoctorAnalyticsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "DOCTOR") {
    redirect("/login");
  }

  const patients = await getPatientsByDoctorSpecialty(user.id);
  const { alerts } = await getAlertsByDoctorSpecialty(user.id);
  const { analyses } = await getAnalysesByDoctorSpecialty(user.id);

  // Calculate analytics
  const totalPatients = patients.length;
  const activePatients = patients.filter((p) => p.isActive).length;
  const totalAlerts = alerts?.length || 0;
  const criticalAlerts =
    alerts?.filter((a) => a.severity === "CRITICAL" && a.status === "OPEN")
      .length || 0;
  const openAlerts = alerts?.filter((a) => a.status === "OPEN").length || 0;
  const resolvedAlerts =
    alerts?.filter((a) => a.status === "RESOLVED").length || 0;

  // Get vitals statistics
  const allVitals = patients.flatMap((p) => p.vitalRecords || []);
  const totalVitals = allVitals.length;
  const vitalsThisWeek = allVitals.filter((v) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(v.recordedAt) > weekAgo;
  }).length;

  // Alerts by severity
  const alertsBySeverity = {
    CRITICAL: alerts?.filter((a) => a.severity === "CRITICAL").length || 0,
    HIGH: alerts?.filter((a) => a.severity === "HIGH").length || 0,
    MEDIUM: alerts?.filter((a) => a.severity === "MEDIUM").length || 0,
    LOW: alerts?.filter((a) => a.severity === "LOW").length || 0,
  };

  // Alerts by type
  const alertsByType: Record<string, number> = {};
  alerts?.forEach((alert) => {
    alertsByType[alert.alertType] = (alertsByType[alert.alertType] || 0) + 1;
  });

  // Patient status distribution
  const patientsWithCriticalAlerts = new Set(
    alerts
      ?.filter((a) => a.severity === "CRITICAL" && a.status === "OPEN")
      .map((a) => a.patientId)
  ).size;

  const patientsWithAlerts = new Set(
    alerts?.filter((a) => a.status === "OPEN").map((a) => a.patientId)
  ).size;

  const stablePatients = totalPatients - patientsWithAlerts;

  // Response time (mock data - in real app, calculate from timestamps)
  const avgResponseTime = "2.5h";
  const resolutionRate =
    totalAlerts > 0 ? ((resolvedAlerts / totalAlerts) * 100).toFixed(1) : 0;

  return (
    <div className="p-6 dark:bg-black">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Statistiques et analyses de votre pratique
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:border-blue-300 dark:hover:border-green-500 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="size-12 rounded-xl bg-blue-50 dark:bg-green-500/10 flex items-center justify-center">
              <Users className="size-6 text-blue-600 dark:text-green-400" />
            </div>
            <TrendingUp className="size-5 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-1">
            {totalPatients}
          </h3>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            Patients Totaux
          </p>
        </div>

        <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:border-red-300 dark:hover:border-red-500 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="size-12 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="size-6 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-xs bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-1 rounded font-semibold">
              Urgent
            </span>
          </div>
          <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-1">
            {criticalAlerts}
          </h3>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            Alertes Critiques
          </p>
        </div>

        <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:border-green-300 dark:hover:border-green-500 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="size-12 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
              <BarChart3 className="size-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-1 rounded font-semibold">
              7j
            </span>
          </div>
          <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-1">
            {vitalsThisWeek}
          </h3>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            Mesures Cette Semaine
          </p>
        </div>

        <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:border-purple-300 dark:hover:border-green-500 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="size-12 rounded-xl bg-purple-50 dark:bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="size-6 text-purple-600 dark:text-green-400" />
            </div>
            <span className="text-xs bg-purple-50 dark:bg-green-500/10 text-purple-600 dark:text-green-400 px-2 py-1 rounded font-semibold">
              %
            </span>
          </div>
          <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-1">
            {resolutionRate}%
          </h3>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            Taux de Résolution
          </p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Alerts by Severity */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Alertes par Sévérité
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Critique
                </span>
                <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                  {alertsBySeverity.CRITICAL}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{
                    width: `${totalAlerts > 0 ? (alertsBySeverity.CRITICAL / totalAlerts) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Haute
                </span>
                <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                  {alertsBySeverity.HIGH}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full"
                  style={{
                    width: `${totalAlerts > 0 ? (alertsBySeverity.HIGH / totalAlerts) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Moyenne
                </span>
                <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                  {alertsBySeverity.MEDIUM}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{
                    width: `${totalAlerts > 0 ? (alertsBySeverity.MEDIUM / totalAlerts) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Basse
                </span>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {alertsBySeverity.LOW}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${totalAlerts > 0 ? (alertsBySeverity.LOW / totalAlerts) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Patient Status */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Statut des Patients
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-500/10 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-400">
                  Stables
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {stablePatients}
                </p>
              </div>
              <div className="text-green-600 dark:text-green-400">
                {totalPatients > 0
                  ? ((stablePatients / totalPatients) * 100).toFixed(0)
                  : 0}
                %
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-500/10 rounded-lg">
              <div>
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-400">
                  Avec Alertes
                </p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                  {patientsWithAlerts}
                </p>
              </div>
              <div className="text-yellow-600 dark:text-yellow-400">
                {totalPatients > 0
                  ? ((patientsWithAlerts / totalPatients) * 100).toFixed(0)
                  : 0}
                %
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-500/10 rounded-lg">
              <div>
                <p className="text-sm font-medium text-red-900 dark:text-red-400">
                  État Critique
                </p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                  {patientsWithCriticalAlerts}
                </p>
              </div>
              <div className="text-red-600 dark:text-red-400">
                {totalPatients > 0
                  ? (
                      (patientsWithCriticalAlerts / totalPatients) *
                      100
                    ).toFixed(0)
                  : 0}
                %
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts by Type */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Alertes par Type
          </h2>
          <div className="space-y-3">
            {Object.entries(alertsByType)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {type}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${totalAlerts > 0 ? ((count as number) / totalAlerts) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Métriques de Performance
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Temps de Réponse Moyen
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {avgResponseTime}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Alertes Ouvertes
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {openAlerts}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Alertes Résolues
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {resolvedAlerts}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Medical Analyses Section */}
      <div className="mt-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FlaskConical className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Analyses Médicales
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gestion des analyses de laboratoire et examens d'imagerie
              </p>
            </div>
          </div>
          <AddAnalysisButton patients={patients} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type d'analyse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nom du test
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Laboratoire
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {analyses?.map((analysis: any) => {
                const analysisTypeLabels: Record<string, string> = {
                  BLOOD_TEST: "Test sanguin",
                  URINE_TEST: "Test urinaire",
                  IMAGING_XRAY: "Radiographie",
                  IMAGING_CT_SCAN: "Scanner",
                  IMAGING_MRI: "IRM",
                  IMAGING_ULTRASOUND: "Échographie",
                  IMAGING_PET_SCAN: "TEP Scan",
                  ECG: "ECG",
                  ECHOCARDIOGRAPHY: "Échocardiographie",
                  SPIROMETRY: "Spirométrie",
                  BIOPSY: "Biopsie",
                  CULTURE: "Culture",
                  OTHER: "Autre",
                };

                const analysisTypeLabel =
                  analysisTypeLabels[analysis.analysisType] ||
                  analysis.analysisType;

                const statusLabels: Record<string, string> = {
                  PENDING: "En attente",
                  IN_PROGRESS: "En cours",
                  COMPLETED: "Terminé",
                  CANCELLED: "Annulé",
                };

                const statusLabel =
                  statusLabels[analysis.status] || analysis.status;

                const statusColors: Record<string, string> = {
                  PENDING: "bg-yellow-100 text-yellow-800",
                  IN_PROGRESS: "bg-blue-100 text-blue-800",
                  COMPLETED: "bg-green-100 text-green-800",
                  CANCELLED: "bg-gray-100 text-gray-800",
                };

                const statusColor =
                  statusColors[analysis.status] || "bg-gray-100 text-gray-800";

                return (
                  <tr
                    key={analysis.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${analysis.isAbnormal ? "bg-red-50 dark:bg-red-500/10" : ""}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {analysis.patient.user.firstName}{" "}
                          {analysis.patient.user.lastName}
                        </div>
                        {analysis.isAbnormal && (
                          <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                            ⚠️ Résultat anormal
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {analysisTypeLabel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {analysis.testName}
                      </div>
                      {analysis.resultSummary && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {analysis.resultSummary}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(analysis.analysisDate).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {analysis.laboratory || (
                        <span className="text-gray-400 dark:text-gray-500">
                          -
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}
                      >
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <AnalysisTableActions
                        analysis={analysis}
                        patientName={`${analysis.patient.user.firstName} ${analysis.patient.user.lastName}`}
                        patientId={analysis.patientId}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {(!analyses || analyses.length === 0) && (
          <div className="text-center py-12">
            <FlaskConical className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              Aucune analyse disponible
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Cliquez sur "Ajouter une analyse" pour commencer
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
