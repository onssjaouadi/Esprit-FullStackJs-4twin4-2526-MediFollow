"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Users,
  User,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
import {
  assignPatientToDoctor,
  getAllDoctors,
  getUnassignedPatients,
} from "@/lib/actions/doctor.actions";

interface Patient {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  diagnosis?: string;
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  doctorProfile?: {
    specialty: string | null;
  };
}

export default function AssignPatientPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [patientsRes, doctorsRes] = await Promise.all([
        getUnassignedPatients(),
        getAllDoctors(),
      ]);

      if (patientsRes.success && patientsRes.data) {
        setPatients(patientsRes.data);
      }
      if (doctorsRes.success && doctorsRes.data) {
        setDoctors(doctorsRes.data);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Erreur lors du chargement des données",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAssign() {
    if (!selectedPatient || !selectedDoctor) {
      setMessage({
        type: "error",
        text: "Veuillez sélectionner un patient et un médecin",
      });
      return;
    }

    try {
      setAssigning(true);
      const result = await assignPatientToDoctor(
        selectedPatient,
        selectedDoctor
      );

      if (result.success) {
        setMessage({
          type: "success",
          text: result.message || "Patient assigné avec succès",
        });
        setSelectedPatient("");
        setSelectedDoctor("");

        // Reload data after assignment
        setTimeout(() => {
          loadData();
          setMessage(null);
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: result.error || "Erreur lors de l'assignation",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Une erreur est survenue",
      });
    } finally {
      setAssigning(false);
    }
  }

  const selectedPatientData = patients.find((p) => p.id === selectedPatient);
  const selectedDoctorData = doctors.find((d) => d.id === selectedDoctor);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Users className="size-8 text-blue-600" />
          Assigner Patient au Médecin
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Sélectionnez un patient et assignez-le à un médecin
        </p>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`rounded-lg border p-4 flex items-start gap-3 ${
            message.type === "success"
              ? "border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800"
              : "border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="size-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="size-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          )}
          <p
            className={
              message.type === "success"
                ? "text-green-800 dark:text-green-200"
                : "text-red-800 dark:text-red-200"
            }
          >
            {message.text}
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="size-6 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Patient Selection */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <User className="size-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Sélectionnez un Patient
              </h2>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {patients.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 py-4 text-center">
                  Aucun patient disponible
                </p>
              ) : (
                patients.map((patient) => (
                  <label
                    key={patient.id}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedPatient === patient.id
                        ? "bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700"
                        : "bg-gray-50 dark:bg-gray-800 border border-transparent hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="patient"
                      value={patient.id}
                      checked={selectedPatient === patient.id}
                      onChange={(e) => setSelectedPatient(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {patient.user.firstName} {patient.user.lastName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {patient.user.email}
                      </p>
                      {patient.diagnosis && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Diagnostic: {patient.diagnosis}
                        </p>
                      )}
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Doctor Selection */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <User className="size-5 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Sélectionnez un Médecin
              </h2>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {doctors.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 py-4 text-center">
                  Aucun médecin disponible
                </p>
              ) : (
                doctors.map((doctor) => (
                  <label
                    key={doctor.id}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedDoctor === doctor.id
                        ? "bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700"
                        : "bg-gray-50 dark:bg-gray-800 border border-transparent hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="doctor"
                      value={doctor.id}
                      checked={selectedDoctor === doctor.id}
                      onChange={(e) => setSelectedDoctor(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {doctor.firstName} {doctor.lastName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {doctor.email}
                      </p>
                      {doctor.doctorProfile?.specialty && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Spécialité: {doctor.doctorProfile.specialty}
                        </p>
                      )}
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assignment Summary */}
      {selectedPatientData && selectedDoctorData && (
        <div className="rounded-2xl border-2 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950 p-6 space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">
            Résumé de l'assignation
          </h3>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Patient
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {selectedPatientData.user.firstName}{" "}
                {selectedPatientData.user.lastName}
              </p>
            </div>
            <ArrowRight className="size-6 text-blue-600" />
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Médecin
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {selectedDoctorData.firstName} {selectedDoctorData.lastName}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={handleAssign}
          disabled={!selectedPatient || !selectedDoctor || assigning}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
            !selectedPatient || !selectedDoctor || assigning
              ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
          }`}
        >
          {assigning ? (
            <>
              <Loader className="size-5 animate-spin" />
              Assignation en cours...
            </>
          ) : (
            <>
              <CheckCircle className="size-5" />
              Assigner le Patient
            </>
          )}
        </button>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
