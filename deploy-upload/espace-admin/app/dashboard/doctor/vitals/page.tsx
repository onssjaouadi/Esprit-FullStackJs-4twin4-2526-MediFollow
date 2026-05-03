import { redirect } from "next/navigation";
import { Activity, Heart, Thermometer, Droplets, Wind } from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getAllPatients } from "@/lib/actions/patient.actions";

export default async function DoctorVitalsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "DOCTOR") {
    redirect("/login");
  }

  const patients = await getAllPatients();

  // Get all recent vitals from all patients
  const allVitals = patients
    .flatMap((patient) =>
      (patient.vitalRecords || []).map((vital) => ({
        ...vital,
        patient: {
          id: patient.id,
          name: `${patient.user.firstName} ${patient.user.lastName}`,
          mrn: patient.medicalRecordNumber,
        },
      }))
    )
    .sort(
      (a, b) =>
        new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    );

  const recentVitals = allVitals.slice(0, 50);

  // Calculate averages
  const calculateAverage = (field: keyof (typeof recentVitals)[0]) => {
    const values = recentVitals
      .map((v) => v[field])
      .filter((v) => typeof v === "number") as number[];

    if (values.length === 0) return 0;
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  };

  const avgHeartRate = calculateAverage("heartRate");
  const avgTemperature = calculateAverage("temperature");
  const avgOxygen = calculateAverage("oxygenSaturation");
  const avgSystolic = calculateAverage("systolicBP");

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Signes Vitaux</h1>
        <p className="text-gray-600 mt-1">
          Vue d'ensemble des signes vitaux de tous vos patients
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-sm text-gray-500">Moyenne</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{avgHeartRate}</h3>
          <p className="text-sm text-gray-600">Fréquence Cardiaque (bpm)</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Thermometer className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm text-gray-500">Moyenne</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {avgTemperature}°C
          </h3>
          <p className="text-sm text-gray-600">Température Corporelle</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Wind className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Moyenne</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{avgOxygen}%</h3>
          <p className="text-sm text-gray-600">Saturation en Oxygène</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Moyenne</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{avgSystolic}</h3>
          <p className="text-sm text-gray-600">Tension Systolique (mmHg)</p>
        </div>
      </div>

      {/* Recent Vitals Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Dernières Mesures
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date/Heure
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  FC (bpm)
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TA (mmHg)
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Temp (°C)
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SpO2 (%)
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Poids (kg)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentVitals.map((vital) => {
                const isAbnormal =
                  (vital.heartRate &&
                    (vital.heartRate < 60 || vital.heartRate > 100)) ||
                  (vital.temperature &&
                    (vital.temperature < 36 || vital.temperature > 38)) ||
                  (vital.oxygenSaturation && vital.oxygenSaturation < 95) ||
                  (vital.systolicBP &&
                    (vital.systolicBP < 90 || vital.systolicBP > 140));

                return (
                  <tr
                    key={vital.id}
                    className={`hover:bg-gray-50 ${isAbnormal ? "bg-red-50" : ""}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {vital.patient.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          MRN: {vital.patient.mrn}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(vital.recordedAt).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {vital.heartRate ? (
                        <span
                          className={`text-sm font-medium ${
                            vital.heartRate < 60 || vital.heartRate > 100
                              ? "text-red-600"
                              : "text-gray-900"
                          }`}
                        >
                          {vital.heartRate}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {vital.systolicBP && vital.diastolicBP ? (
                        <span
                          className={`text-sm font-medium ${
                            vital.systolicBP < 90 || vital.systolicBP > 140
                              ? "text-red-600"
                              : "text-gray-900"
                          }`}
                        >
                          {vital.systolicBP}/{vital.diastolicBP}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {vital.temperature ? (
                        <span
                          className={`text-sm font-medium ${
                            vital.temperature < 36 || vital.temperature > 38
                              ? "text-red-600"
                              : "text-gray-900"
                          }`}
                        >
                          {vital.temperature.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {vital.oxygenSaturation ? (
                        <span
                          className={`text-sm font-medium ${
                            vital.oxygenSaturation < 95
                              ? "text-red-600"
                              : "text-gray-900"
                          }`}
                        >
                          {vital.oxygenSaturation}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {vital.weight ? vital.weight.toFixed(1) : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {recentVitals.length === 0 && (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Aucune mesure disponible</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Les valeurs anormales sont affichées en rouge
          et la ligne est surlignée.
        </p>
      </div>
    </div>
  );
}
