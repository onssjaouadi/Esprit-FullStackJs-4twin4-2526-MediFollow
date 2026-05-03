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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Rapports
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Générez et téléchargez des rapports détaillés
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:border-blue-300 dark:hover:border-green-500 hover:shadow-xl transition-all">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Total Patients
          </p>
          <p className="text-4xl font-black text-gray-900 dark:text-white">
            {totalPatients}
          </p>
        </div>
        <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:border-green-300 dark:hover:border-green-500 hover:shadow-xl transition-all">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Mesures Vitales
          </p>
          <p className="text-4xl font-black text-gray-900 dark:text-white">
            {totalVitals}
          </p>
        </div>
        <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:border-orange-300 dark:hover:border-orange-500 hover:shadow-xl transition-all">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Alertes Actives
          </p>
          <p className="text-4xl font-black text-gray-900 dark:text-white">
            {activeAlerts}
          </p>
        </div>
        <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:border-red-300 dark:hover:border-red-500 hover:shadow-xl transition-all">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Alertes Critiques
          </p>
          <p className="text-4xl font-black text-gray-900 dark:text-white">
            {criticalAlerts}
          </p>
        </div>
      </div>

      {/* Report Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Report */}
        <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:border-blue-300 dark:hover:border-green-500 hover:shadow-xl transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-blue-50 dark:bg-green-500/10 flex items-center justify-center">
                <FileText className="size-6 text-blue-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                  Rapport Hebdomadaire
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Résumé des 7 derniers jours
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Mesures vitales
              </span>
              <span className="font-bold text-gray-900 dark:text-white">
                {vitalsThisWeek}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Nouvelles alertes
              </span>
              <span className="font-bold text-gray-900 dark:text-white">
                {alertsThisWeek}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Patients surveillés
              </span>
              <span className="font-bold text-gray-900 dark:text-white">
                {totalPatients}
              </span>
            </div>
          </div>

          <button className="w-full bg-blue-600 dark:bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-semibold">
            <Download className="size-4" />
            Télécharger (PDF)
          </button>
        </div>

        {/* Monthly Report */}
        <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:border-green-300 dark:hover:border-green-500 hover:shadow-xl transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                <Calendar className="size-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                  Rapport Mensuel
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Résumé du mois en cours
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Mesures vitales
              </span>
              <span className="font-bold text-gray-900 dark:text-white">
                {vitalsThisMonth}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Total alertes
              </span>
              <span className="font-bold text-gray-900 dark:text-white">
                {totalAlerts}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Patients actifs
              </span>
              <span className="font-bold text-gray-900 dark:text-white">
                {totalPatients}
              </span>
            </div>
          </div>

          <button className="w-full bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-semibold">
            <Download className="size-4" />
            Télécharger (PDF)
          </button>
        </div>

        {/* Patient Report */}
        <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:border-purple-300 dark:hover:border-green-500 hover:shadow-xl transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-purple-50 dark:bg-green-500/10 flex items-center justify-center">
                <Users className="size-6 text-purple-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                  Rapport Patient
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Détails d'un patient spécifique
                </p>
              </div>
            </div>
          </div>

          <select
            title="Sélectionner un patient"
            className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500 mb-4"
          >
            <option value="">Sélectionner un patient...</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.user.firstName} {patient.user.lastName} -{" "}
                {patient.medicalRecordNumber}
              </option>
            ))}
          </select>

          <button className="w-full bg-purple-600 dark:bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-purple-700 dark:hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-semibold">
            <Download className="size-4" />
            Télécharger (PDF)
          </button>
        </div>

        {/* Alert Report */}
        <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:border-orange-300 dark:hover:border-orange-500 hover:shadow-xl transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                <AlertCircle className="size-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                  Rapport d'Alertes
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Historique des alertes
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <select
              title="Filtre des alertes"
              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-500"
            >
              <option value="all">Toutes les alertes</option>
              <option value="open">Ouvertes uniquement</option>
              <option value="critical">Critiques uniquement</option>
              <option value="resolved">Résolues uniquement</option>
            </select>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                className="px-3 py-2 border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-500"
                placeholder="Date début"
              />
              <input
                type="date"
                className="px-3 py-2 border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-500"
                placeholder="Date fin"
              />
            </div>
          </div>

          <button className="w-full bg-orange-600 text-white py-2.5 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 font-semibold">
            <Download className="size-4" />
            Télécharger (PDF)
          </button>
        </div>
      </div>

      {/* Custom Report Builder */}
      <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:shadow-xl transition-all">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-12 rounded-xl bg-purple-50 dark:bg-green-500/10 flex items-center justify-center">
            <Filter className="size-6 text-purple-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Rapport Personnalisé
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Créez un rapport avec des critères spécifiques
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Type de données
            </label>
            <select
              title="Type de données"
              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500"
            >
              <option value="vitals">Signes vitaux</option>
              <option value="alerts">Alertes</option>
              <option value="patients">Patients</option>
              <option value="all">Toutes les données</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Période
            </label>
            <select
              title="Période"
              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500"
            >
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
              <option value="quarter">3 derniers mois</option>
              <option value="year">Année en cours</option>
              <option value="custom">Personnalisé</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Format d'export
            </label>
            <select
              title="Format d'export"
              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel (XLSX)</option>
              <option value="csv">CSV</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Tri
            </label>
            <select
              title="Tri"
              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-green-500"
            >
              <option value="date-desc">Date (plus récent)</option>
              <option value="date-asc">Date (plus ancien)</option>
              <option value="severity">Sévérité</option>
              <option value="patient">Patient</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 bg-purple-600 dark:bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 dark:hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-semibold">
            <Download className="size-5" />
            Générer et Télécharger
          </button>
          <button className="px-6 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-semibold text-gray-900 dark:text-white">
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 mt-6 hover:shadow-xl transition-all">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-xl bg-blue-50 dark:bg-green-500/10 flex items-center justify-center">
            <FileText className="size-5 text-blue-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Rapports Récents
          </h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 rounded-xl hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
            <div className="flex items-center gap-3">
              <FileText className="size-5 text-blue-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  Rapport Hebdomadaire - Mars 2026
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Généré le 2 mars 2026
                </p>
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-600 dark:bg-green-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-green-700 transition-colors text-sm font-semibold flex items-center gap-2">
              Télécharger
            </button>
          </div>

          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
            Aucun rapport généré récemment
          </div>
        </div>
      </div>
    </div>
  );
}
