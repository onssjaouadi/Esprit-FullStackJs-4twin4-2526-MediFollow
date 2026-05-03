import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Activity,
  AlertCircle,
  Calendar,
  Phone,
  MapPin,
  Droplets,
  Heart,
  Thermometer,
  Wind,
  User,
  FileText,
} from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getPatientWithRelations } from "@/lib/actions/patient.actions";
import { getPatientAnalyses } from "@/lib/actions/analysis.actions";
import { Badge } from "@/components/ui/badge";
import PatientDocumentsViewer from "@/components/PatientDocumentsViewer";
import DoctorNotesSection from "@/components/DoctorNotesSection";
import PatientAISummary from "@/components/PatientAISummary";

export default async function PatientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "DOCTOR") {
    redirect("/login");
  }

  const patient = await getPatientWithRelations(params.id);

  if (!patient) {
    notFound();
  }

  // Fetch patient analyses
  const { analyses } = await getPatientAnalyses(params.id);

  const fullName = `${patient.user.firstName} ${patient.user.lastName}`;
  const age =
    new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
  const activeAlerts = patient.alerts?.filter((a) => a.status === "OPEN") || [];
  const latestVital =
    patient.vitalRecords && patient.vitalRecords.length > 0
      ? patient.vitalRecords[0]
      : null;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/doctor/patients"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl">
              {patient.user.firstName.charAt(0)}
              {patient.user.lastName.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{fullName}</h1>
              <p className="text-gray-600">
                MRN: {patient.medicalRecordNumber}
              </p>
            </div>
          </div>

          {activeAlerts.length > 0 && (
            <Badge variant="destructive" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {activeAlerts.length} alerte(s) active(s)
            </Badge>
          )}
        </div>
      </div>

      {/* AI Summary Section */}
      <div className="mb-8">
        <PatientAISummary
          patientId={patient.id}
          patientName={fullName}
          diagnosis={patient.diagnosis || undefined}
          age={age}
          gender={patient.gender}
          vitalRecords={patient.vitalRecords}
          analyses={analyses || []}
          alerts={patient.alerts}
          symptoms={patient.symptoms}
          medications={patient.medications}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Patient Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Informations</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Âge:</span>
                <span className="font-medium text-gray-900">{age} ans</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Sexe:</span>
                <span className="font-medium text-gray-900">
                  {patient.gender}
                </span>
              </div>

              {patient.bloodType && (
                <div className="flex items-center gap-3 text-sm">
                  <Droplets className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Groupe sanguin:</span>
                  <span className="font-medium text-gray-900">
                    {patient.bloodType}
                  </span>
                </div>
              )}

              {patient.user.phoneNumber && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Téléphone:</span>
                  <span className="font-medium text-gray-900">
                    {patient.user.phoneNumber}
                  </span>
                </div>
              )}

              {patient.address && (
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <span className="text-gray-600 block">Adresse:</span>
                    <span className="font-medium text-gray-900">
                      {patient.address.street}
                      <br />
                      {patient.address.postalCode} {patient.address.city}
                      <br />
                      {patient.address.country}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Medical Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="font-semibold text-gray-900 mb-4">
              Informations Médicales
            </h2>
            <div className="space-y-3">
              {patient.diagnosis && (
                <div>
                  <span className="text-sm text-gray-600 block mb-1">
                    Diagnostic:
                  </span>
                  <p className="text-sm font-medium text-gray-900">
                    {patient.diagnosis}
                  </p>
                </div>
              )}

              {patient.dischargeDate && (
                <div>
                  <span className="text-sm text-gray-600 block mb-1">
                    Date de sortie:
                  </span>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(patient.dischargeDate).toLocaleDateString(
                      "fr-FR"
                    )}
                  </p>
                </div>
              )}

              {patient.medications && patient.medications.length > 0 && (
                <div>
                  <span className="text-sm text-gray-600 block mb-2">
                    Médicaments:
                  </span>
                  <div className="space-y-2">
                    {patient.medications.map((med, idx) => (
                      <div
                        key={idx}
                        className="bg-blue-50 border border-blue-200 rounded p-2"
                      >
                        <p className="text-sm font-medium text-blue-900">
                          {med.name}
                        </p>
                        <p className="text-xs text-blue-700">
                          {med.dosage} - {med.frequency}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          {patient.emergencyContact && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-5">
              <h2 className="font-semibold text-red-900 mb-4">
                Contact d'Urgence
              </h2>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-red-900">
                  {patient.emergencyContact.name}
                </p>
                <p className="text-red-700">
                  {patient.emergencyContact.relationship}
                </p>
                <p className="text-red-700">
                  {patient.emergencyContact.phoneNumber}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Latest Vitals */}
          {latestVital && (
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h2 className="font-semibold text-gray-900 mb-4">
                Dernières Mesures Vitales
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                {new Date(latestVital.recordedAt).toLocaleString("fr-FR")}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {latestVital.heartRate && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-5 h-5 text-red-600" />
                      <span className="text-xs text-red-600 font-medium">
                        FC
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-red-700">
                      {latestVital.heartRate}
                    </p>
                    <p className="text-xs text-red-600">bpm</p>
                  </div>
                )}

                {latestVital.systolicBP && latestVital.diastolicBP && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-5 h-5 text-purple-600" />
                      <span className="text-xs text-purple-600 font-medium">
                        TA
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-purple-700">
                      {latestVital.systolicBP}/{latestVital.diastolicBP}
                    </p>
                    <p className="text-xs text-purple-600">mmHg</p>
                  </div>
                )}

                {latestVital.temperature && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer className="w-5 h-5 text-orange-600" />
                      <span className="text-xs text-orange-600 font-medium">
                        Temp
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-orange-700">
                      {latestVital.temperature}
                    </p>
                    <p className="text-xs text-orange-600">°C</p>
                  </div>
                )}

                {latestVital.oxygenSaturation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Wind className="w-5 h-5 text-blue-600" />
                      <span className="text-xs text-blue-600 font-medium">
                        SpO2
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">
                      {latestVital.oxygenSaturation}
                    </p>
                    <p className="text-xs text-blue-600">%</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Active Alerts */}
          {activeAlerts.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h2 className="font-semibold text-gray-900 mb-4">
                Alertes Actives
              </h2>
              <div className="space-y-3">
                {activeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`border rounded-lg p-4 ${
                      alert.severity === "CRITICAL"
                        ? "bg-red-50 border-red-300"
                        : "bg-yellow-50 border-yellow-300"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900">
                        {alert.message}
                      </h3>
                      <Badge
                        className={
                          alert.severity === "CRITICAL"
                            ? "bg-red-600"
                            : "bg-yellow-600"
                        }
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {alert.alertType}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(alert.createdAt).toLocaleString("fr-FR")}
                    </p>
                    <Link
                      href={`/dashboard/doctor/alerts/${alert.id}`}
                      className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                    >
                      Gérer cette alerte →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vital Records History */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="font-semibold text-gray-900 mb-4">
              Historique des Signes Vitaux
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-2 text-gray-600 font-medium">
                      Date
                    </th>
                    <th className="text-center py-2 text-gray-600 font-medium">
                      FC
                    </th>
                    <th className="text-center py-2 text-gray-600 font-medium">
                      TA
                    </th>
                    <th className="text-center py-2 text-gray-600 font-medium">
                      Temp
                    </th>
                    <th className="text-center py-2 text-gray-600 font-medium">
                      SpO2
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {patient.vitalRecords?.slice(0, 10).map((vital) => (
                    <tr key={vital.id} className="hover:bg-gray-50">
                      <td className="py-3 text-gray-900">
                        {new Date(vital.recordedAt).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </td>
                      <td className="py-3 text-center text-gray-900">
                        {vital.heartRate || "-"}
                      </td>
                      <td className="py-3 text-center text-gray-900">
                        {vital.systolicBP && vital.diastolicBP
                          ? `${vital.systolicBP}/${vital.diastolicBP}`
                          : "-"}
                      </td>
                      <td className="py-3 text-center text-gray-900">
                        {vital.temperature || "-"}
                      </td>
                      <td className="py-3 text-center text-gray-900">
                        {vital.oxygenSaturation || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Symptoms */}
          {patient.symptoms && patient.symptoms.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h2 className="font-semibold text-gray-900 mb-4">
                Symptômes Récents
              </h2>
              <div className="space-y-3">
                {patient.symptoms.map((symptom) => (
                  <div
                    key={symptom.id}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">
                        {symptom.symptomType}
                      </span>
                      <Badge className="bg-orange-100 text-orange-800">
                        Sévérité: {symptom.severity}
                      </Badge>
                    </div>
                    {symptom.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {symptom.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(symptom.occurredAt).toLocaleString("fr-FR")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medical Documents */}
          <PatientDocumentsViewer
            patientId={patient.id}
            doctorUserId={user.id}
          />

          {/* Situation Reports */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="font-semibold text-gray-900">
                    Rapports de Situation
                  </h2>
                  <p className="text-sm text-gray-600">
                    Créer et gérer les rapports cliniques avec assistance IA
                  </p>
                </div>
              </div>
              <Link
                href={`/dashboard/doctor/patients/${patient.id}/situation-reports`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Accéder →
              </Link>
            </div>
            <p className="text-sm text-gray-600">
              Rédiger, améliorer et publier des rapports de situation cliniques.
              Claude AI vous aide à générer des résumés et améliorer la qualité
              du texte.
            </p>
          </div>

          {/* Doctor Notes */}
          <DoctorNotesSection patientId={patient.id} doctorId={user.id} />
        </div>
      </div>
    </div>
  );
}
