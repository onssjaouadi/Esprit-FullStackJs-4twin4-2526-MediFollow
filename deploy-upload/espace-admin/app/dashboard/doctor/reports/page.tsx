import { redirect } from "next/navigation";
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Users,
  AlertCircle,
} from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getAllPatients } from "@/lib/actions/patient.actions";
import { getAllAlerts } from "@/lib/actions/alert.actions";

export default async function DoctorReportsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "DOCTOR") {
    redirect("/login");
  }

  const patients = await getAllPatients();
  const { alerts } = await getAllAlerts();

  // Generate report data
  const totalPatients = patients.length;
  const totalAlerts = alerts?.length || 0;
  const activeAlerts = alerts?.filter((a) => a.status === "OPEN").length || 0;
  const criticalAlerts =
    alerts?.filter((a) => a.severity === "CRITICAL").length || 0;

  const allVitals = patients.flatMap((p) => p.vitalRecords || []);
  const totalVitals = allVitals.length;

  // Get today's date range
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - 7);
  const startOfMonth = new Date(today);
  startOfMonth.setDate(1);

  const vitalsThisWeek = allVitals.filter(
    (v) => new Date(v.recordedAt) >= startOfWeek
  ).length;

  const vitalsThisMonth = allVitals.filter(
    (v) => new Date(v.recordedAt) >= startOfMonth
  ).length;

  const alertsThisWeek =
    alerts?.filter((a) => new Date(a.createdAt) >= startOfWeek).length || 0;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Rapports</h1>
        <p className="text-gray-600 mt-1">
          Générez et téléchargez des rapports détaillés
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-600 text-sm font-medium mb-1">
            Total Patients
          </p>
          <p className="text-3xl font-bold text-blue-700">{totalPatients}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-600 text-sm font-medium mb-1">
            Mesures Vitales
          </p>
          <p className="text-3xl font-bold text-green-700">{totalVitals}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-orange-600 text-sm font-medium mb-1">
            Alertes Actives
          </p>
          <p className="text-3xl font-bold text-orange-700">{activeAlerts}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm font-medium mb-1">
            Alertes Critiques
          </p>
          <p className="text-3xl font-bold text-red-700">{criticalAlerts}</p>
        </div>
      </div>

      {/* Report Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Report */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Rapport Hebdomadaire
                </h3>
                <p className="text-sm text-gray-500">
                  Résumé des 7 derniers jours
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Mesures vitales</span>
              <span className="font-semibold text-gray-900">
                {vitalsThisWeek}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Nouvelles alertes</span>
              <span className="font-semibold text-gray-900">
                {alertsThisWeek}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Patients surveillés</span>
              <span className="font-semibold text-gray-900">
                {totalPatients}
              </span>
            </div>
          </div>

          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Télécharger (PDF)
          </button>
        </div>

        {/* Monthly Report */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Rapport Mensuel</h3>
                <p className="text-sm text-gray-500">Résumé du mois en cours</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Mesures vitales</span>
              <span className="font-semibold text-gray-900">
                {vitalsThisMonth}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total alertes</span>
              <span className="font-semibold text-gray-900">{totalAlerts}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Patients actifs</span>
              <span className="font-semibold text-gray-900">
                {totalPatients}
              </span>
            </div>
          </div>

          <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Télécharger (PDF)
          </button>
        </div>

        {/* Patient Report */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Rapport Patient</h3>
                <p className="text-sm text-gray-500">
                  Détails d'un patient spécifique
                </p>
              </div>
            </div>
          </div>

          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4">
            <option value="">Sélectionner un patient...</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.user.firstName} {patient.user.lastName} -{" "}
                {patient.medicalRecordNumber}
              </option>
            ))}
          </select>

          <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Télécharger (PDF)
          </button>
        </div>

        {/* Alert Report */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Rapport d'Alertes
                </h3>
                <p className="text-sm text-gray-500">Historique des alertes</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="all">Toutes les alertes</option>
              <option value="open">Ouvertes uniquement</option>
              <option value="critical">Critiques uniquement</option>
              <option value="resolved">Résolues uniquement</option>
            </select>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Date début"
              />
              <input
                type="date"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Date fin"
              />
            </div>
          </div>

          <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Télécharger (PDF)
          </button>
        </div>
      </div>

      {/* Custom Report Builder */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <Filter className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Rapport Personnalisé
            </h2>
            <p className="text-sm text-gray-500">
              Créez un rapport avec des critères spécifiques
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de données
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="vitals">Signes vitaux</option>
              <option value="alerts">Alertes</option>
              <option value="patients">Patients</option>
              <option value="all">Toutes les données</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Période
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
              <option value="quarter">3 derniers mois</option>
              <option value="year">Année en cours</option>
              <option value="custom">Personnalisé</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format d'export
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="pdf">PDF</option>
              <option value="excel">Excel (XLSX)</option>
              <option value="csv">CSV</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tri
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="date-desc">Date (plus récent)</option>
              <option value="date-asc">Date (plus ancien)</option>
              <option value="severity">Sévérité</option>
              <option value="patient">Patient</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium">
            <Download className="w-5 h-5" />
            Générer et Télécharger
          </button>
          <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700">
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Rapports Récents
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Rapport Hebdomadaire - Mars 2026
                </p>
                <p className="text-xs text-gray-500">Généré le 2 mars 2026</p>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Télécharger
            </button>
          </div>

          <div className="text-center py-8 text-gray-500 text-sm">
            Aucun rapport généré récemment
          </div>
        </div>
      </div>
    </div>
  );
}
