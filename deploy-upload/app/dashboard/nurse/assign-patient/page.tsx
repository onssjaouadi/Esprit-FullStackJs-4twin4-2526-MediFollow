"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface Doctor {
  id: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
  };
  specialty?: string;
  profile?: {
    specialty?: string;
  };
}

interface Patient {
  id: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email?: string;
  };
  diagnosis?: string;
  medicalRecordNumber?: string;
}

export default function AssignPatientPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
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
        fetch("/api/nurse/patients"),
        fetch("/api/nurse/doctors"),
      ]);

      if (!patientsRes.ok || !doctorsRes.ok) {
        throw new Error("Failed to load data");
      }

      const patientsData = await patientsRes.json();
      const doctorsData = await doctorsRes.json();

      setPatients(patientsData || []);
      setDoctors(doctorsData || []);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to load patients and doctors",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAssign() {
    if (!selectedPatient || !selectedDoctor) {
      setMessage({
        type: "error",
        text: "Please select both a patient and a doctor",
      });
      return;
    }

    try {
      setAssigning(true);
      const response = await fetch("/api/nurse/assign-patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          doctorUserId: selectedDoctor.userId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Assignment failed");
      }

      setMessage({
        type: "success",
        text: `${selectedPatient.user.firstName} assigned to Dr. ${selectedDoctor.user.firstName}`,
      });

      // Reset selections and reload data
      setSelectedPatient(null);
      setSelectedDoctor(null);
      setTimeout(() => loadData(), 1500);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Assignment failed",
      });
    } finally {
      setAssigning(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Assign to Doctor</h1>
        <p className="text-gray-600 mt-1">
          Assign patients to doctors for treatment
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patients List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Patients</h2>
              <p className="text-xs text-gray-600 mt-1">
                {patients.length} available
              </p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {patients.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No patients available
                </div>
              ) : (
                <div className="divide-y">
                  {patients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient)}
                      className={`w-full text-left px-6 py-4 hover:bg-gray-50 transition ${
                        selectedPatient?.id === patient.id
                          ? "bg-blue-50 border-l-4 border-blue-500"
                          : ""
                      }`}
                    >
                      <div className="font-medium text-gray-900">
                        {patient.user.firstName} {patient.user.lastName}
                      </div>
                      {patient.user.email && (
                        <div className="text-xs text-gray-500 mt-1">
                          {patient.user.email}
                        </div>
                      )}
                      {patient.medicalRecordNumber && (
                        <div className="text-xs text-gray-600 mt-1">
                          #{patient.medicalRecordNumber}
                        </div>
                      )}
                      {patient.diagnosis && (
                        <div className="text-xs text-gray-600 mt-1">
                          {patient.diagnosis}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="text-gray-400">
            <ChevronRight className="w-8 h-8" />
          </div>
        </div>

        {/* Doctors List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Doctors</h2>
              <p className="text-xs text-gray-600 mt-1">
                {doctors.length} available
              </p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {doctors.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No doctors available
                </div>
              ) : (
                <div className="divide-y">
                  {doctors.map((doctor) => (
                    <button
                      key={doctor.id}
                      onClick={() => setSelectedDoctor(doctor)}
                      className={`w-full text-left px-6 py-4 hover:bg-gray-50 transition ${
                        selectedDoctor?.id === doctor.id
                          ? "bg-blue-50 border-l-4 border-blue-500"
                          : ""
                      }`}
                    >
                      <div className="font-medium text-gray-900">
                        Dr. {doctor.user.firstName} {doctor.user.lastName}
                      </div>
                      {(doctor.specialty || doctor.profile?.specialty) && (
                        <div className="text-xs text-gray-600 mt-1">
                          {doctor.specialty || doctor.profile?.specialty}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Summary and Actions */}
      {(selectedPatient || selectedDoctor) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Selected Patient */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Selected Patient</p>
              {selectedPatient ? (
                <div className="bg-white p-4 rounded border border-blue-200">
                  <p className="font-medium text-gray-900">
                    {selectedPatient.user.firstName}{" "}
                    {selectedPatient.user.lastName}
                  </p>
                  {selectedPatient.diagnosis && (
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedPatient.diagnosis}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">None selected</p>
              )}
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center md:mb-4">
              <ChevronRight className="w-6 h-6 text-blue-500" />
            </div>

            {/* Selected Doctor */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Selected Doctor</p>
              {selectedDoctor ? (
                <div className="bg-white p-4 rounded border border-blue-200">
                  <p className="font-medium text-gray-900">
                    Dr. {selectedDoctor.user.firstName}{" "}
                    {selectedDoctor.user.lastName}
                  </p>
                  {(selectedDoctor.specialty ||
                    selectedDoctor.profile?.specialty) && (
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedDoctor.specialty ||
                        selectedDoctor.profile?.specialty}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">None selected</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3 justify-center">
            <button
              onClick={() => {
                setSelectedPatient(null);
                setSelectedDoctor(null);
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Clear
            </button>
            <button
              onClick={handleAssign}
              disabled={!selectedPatient || !selectedDoctor || assigning}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {assigning && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirm Assignment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
