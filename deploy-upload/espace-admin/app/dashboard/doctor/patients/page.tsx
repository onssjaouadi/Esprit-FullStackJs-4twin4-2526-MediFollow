import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Activity, Calendar, Phone } from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getAllPatients } from "@/lib/actions/patient.actions";
import { Badge } from "@/components/ui/badge";

export default async function DoctorPatientsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "DOCTOR") {
    redirect("/login");
  }

  const patients = await getAllPatients();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
        <p className="text-gray-600 mt-1">Gérez et surveillez vos patients</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Rechercher par nom ou numéro de dossier..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="critical">Critique</option>
          <option value="stable">Stable</option>
        </select>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.map((patient) => {
          const fullName = `${patient.user.firstName} ${patient.user.lastName}`;
          const activeAlerts =
            patient.alerts?.filter((a) => a.status === "OPEN").length || 0;

          return (
            <Link
              key={patient.id}
              href={`/dashboard/doctor/patients/${patient.id}`}
              className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              {/* Patient Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-lg">
                    {patient.user.firstName.charAt(0)}
                    {patient.user.lastName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{fullName}</h3>
                    <p className="text-sm text-gray-500">
                      MRN: {patient.medicalRecordNumber}
                    </p>
                  </div>
                </div>
                {activeAlerts > 0 && (
                  <Badge
                    variant="destructive"
                    className="flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {activeAlerts}
                  </Badge>
                )}
              </div>

              {/* Patient Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date().getFullYear() -
                      new Date(patient.dateOfBirth).getFullYear()}{" "}
                    ans
                  </span>
                  <span className="text-gray-400">•</span>
                  <span>{patient.gender}</span>
                </div>

                {patient.user.phoneNumber && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{patient.user.phoneNumber}</span>
                  </div>
                )}

                {patient.diagnosis && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Diagnostic:</span>{" "}
                    {patient.diagnosis}
                  </div>
                )}
              </div>

              {/* Latest Vitals */}
              {patient.vitalRecords && patient.vitalRecords.length > 0 && (
                <div className="border-t pt-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Activity className="w-4 h-4" />
                    <span>Derniers signes vitaux</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {patient.vitalRecords[0].heartRate && (
                      <div>
                        <span className="text-gray-500">FC:</span>{" "}
                        <span className="font-medium">
                          {patient.vitalRecords[0].heartRate} bpm
                        </span>
                      </div>
                    )}
                    {patient.vitalRecords[0].systolicBP &&
                      patient.vitalRecords[0].diastolicBP && (
                        <div>
                          <span className="text-gray-500">TA:</span>{" "}
                          <span className="font-medium">
                            {patient.vitalRecords[0].systolicBP}/
                            {patient.vitalRecords[0].diastolicBP}
                          </span>
                        </div>
                      )}
                    {patient.vitalRecords[0].temperature && (
                      <div>
                        <span className="text-gray-500">Temp:</span>{" "}
                        <span className="font-medium">
                          {patient.vitalRecords[0].temperature}°C
                        </span>
                      </div>
                    )}
                    {patient.vitalRecords[0].oxygenSaturation && (
                      <div>
                        <span className="text-gray-500">SpO2:</span>{" "}
                        <span className="font-medium">
                          {patient.vitalRecords[0].oxygenSaturation}%
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(
                      patient.vitalRecords[0].recordedAt
                    ).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}

              {/* Status Badge */}
              <div className="mt-4 pt-3 border-t">
                <Badge
                  variant={activeAlerts > 0 ? "destructive" : "secondary"}
                  className="w-full justify-center"
                >
                  {activeAlerts > 0
                    ? `${activeAlerts} alerte(s) active(s)`
                    : "Stable"}
                </Badge>
              </div>
            </Link>
          );
        })}
      </div>

      {patients.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Aucun patient trouvé</p>
        </div>
      )}
    </div>
  );
}
