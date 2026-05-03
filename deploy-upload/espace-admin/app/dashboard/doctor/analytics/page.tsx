import { redirect } from "next/navigation";
import { BarChart3, TrendingUp, Users, AlertCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getAllPatients } from "@/lib/actions/patient.actions";
import { getAllAlerts } from "@/lib/actions/alert.actions";

export default async function DoctorAnalyticsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "DOCTOR") {
    redirect("/login");
  }

  const patients = await getAllPatients();
  const { alerts } = await getAllAlerts();

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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">
          Statistiques et analyses de votre pratique
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-8 h-8 opacity-80" />
            <TrendingUp className="w-5 h-5 opacity-60" />
          </div>
          <h3 className="text-3xl font-bold mb-1">{totalPatients}</h3>
          <p className="text-blue-100 text-sm">Patients Totaux</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <AlertCircle className="w-8 h-8 opacity-80" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded">
              Urgent
            </span>
          </div>
          <h3 className="text-3xl font-bold mb-1">{criticalAlerts}</h3>
          <p className="text-red-100 text-sm">Alertes Critiques</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <BarChart3 className="w-8 h-8 opacity-80" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded">7j</span>
          </div>
          <h3 className="text-3xl font-bold mb-1">{vitalsThisWeek}</h3>
          <p className="text-green-100 text-sm">Mesures Cette Semaine</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded">%</span>
          </div>
          <h3 className="text-3xl font-bold mb-1">{resolutionRate}%</h3>
          <p className="text-purple-100 text-sm">Taux de Résolution</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Alerts by Severity */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Alertes par Sévérité
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Critique
                </span>
                <span className="text-sm font-semibold text-red-600">
                  {alertsBySeverity.CRITICAL}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
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
                <span className="text-sm font-medium text-gray-700">Haute</span>
                <span className="text-sm font-semibold text-orange-600">
                  {alertsBySeverity.HIGH}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
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
                <span className="text-sm font-medium text-gray-700">
                  Moyenne
                </span>
                <span className="text-sm font-semibold text-yellow-600">
                  {alertsBySeverity.MEDIUM}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
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
                <span className="text-sm font-medium text-gray-700">Basse</span>
                <span className="text-sm font-semibold text-blue-600">
                  {alertsBySeverity.LOW}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
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
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Statut des Patients
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-900">Stables</p>
                <p className="text-2xl font-bold text-green-700">
                  {stablePatients}
                </p>
              </div>
              <div className="text-green-600">
                {totalPatients > 0
                  ? ((stablePatients / totalPatients) * 100).toFixed(0)
                  : 0}
                %
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-yellow-900">
                  Avec Alertes
                </p>
                <p className="text-2xl font-bold text-yellow-700">
                  {patientsWithAlerts}
                </p>
              </div>
              <div className="text-yellow-600">
                {totalPatients > 0
                  ? ((patientsWithAlerts / totalPatients) * 100).toFixed(0)
                  : 0}
                %
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-red-900">
                  État Critique
                </p>
                <p className="text-2xl font-bold text-red-700">
                  {patientsWithCriticalAlerts}
                </p>
              </div>
              <div className="text-red-600">
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
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Alertes par Type
          </h2>
          <div className="space-y-3">
            {Object.entries(alertsByType)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{type}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${totalAlerts > 0 ? ((count as number) / totalAlerts) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Métriques de Performance
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Temps de Réponse Moyen</p>
                <p className="text-2xl font-bold text-gray-900">
                  {avgResponseTime}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Alertes Ouvertes</p>
                <p className="text-2xl font-bold text-gray-900">{openAlerts}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Alertes Résolues</p>
                <p className="text-2xl font-bold text-gray-900">
                  {resolvedAlerts}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
