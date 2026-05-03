"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Mail,
  Phone,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  UserPlus,
} from "lucide-react";

import {
  getPendingPatients,
  approvePatient,
  banPatient,
} from "@/lib/actions/admin.actions";
import {
  getAllServices,
  getAssignableCareTeam,
  updateService,
} from "@/lib/actions/service.actions";

interface PendingUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  createdAt: string | Date;
}

interface ServiceOption {
  id: string;
  serviceName: string;
  patientIds?: string[];
  teamIds?: string[];
}

interface DoctorOption {
  id: string;
  label: string;
  email: string;
  role: string;
}

export default function PendingPatientsPage() {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<PendingUser[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Approval modal state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PendingUser | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [pendingData, servicesResult, teamResult] = await Promise.all([
        getPendingPatients(),
        getAllServices(),
        getAssignableCareTeam(),
      ]);
      setPatients(pendingData as PendingUser[]);
      if (servicesResult.success) {
        setServices(servicesResult.services as ServiceOption[]);
      }
      if (teamResult.success) {
        setDoctors(
          (teamResult.team as DoctorOption[]).filter((m) => m.role === "DOCTOR")
        );
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenApprove = (patient: PendingUser) => {
    setSelectedPatient(patient);
    setSelectedServiceId("");
    setSelectedDoctorId("");
    setShowApproveModal(true);
  };

  const handleApprove = async () => {
    if (!selectedPatient) return;
    if (!selectedServiceId || !selectedDoctorId) {
      alert("Veuillez sélectionner un service et un médecin.");
      return;
    }

    setProcessingId(selectedPatient.id);
    try {
      const result = await approvePatient(selectedPatient.id);
      if (result.success) {
        // Assign the patient to the selected service and doctor
        const selectedService = services.find((s) => s.id === selectedServiceId);
        const existingPatientIds = Array.isArray(selectedService?.patientIds)
          ? selectedService.patientIds
          : [];
        const existingTeamIds = Array.isArray(selectedService?.teamIds)
          ? selectedService.teamIds
          : [];

        await updateService(selectedServiceId, {
          patientIds: Array.from(new Set([...existingPatientIds, selectedPatient.id])),
          teamIds: Array.from(new Set([...existingTeamIds, selectedDoctorId])),
        });

        setPatients((prev) => prev.filter((p) => p.id !== selectedPatient.id));
        setShowApproveModal(false);
        setSelectedPatient(null);
      }
    } catch (error) {
      console.error("Error approving patient:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleBan = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir refuser ce patient ?")) return;

    setProcessingId(userId);
    try {
      const result = await banPatient(userId);
      if (result.success) {
        setPatients((prev) => prev.filter((p) => p.id !== userId));
      }
    } catch (error) {
      console.error("Error banning patient:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-yellow-500/20 rounded-xl">
            <Clock className="text-yellow-400" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              Patients en attente d&apos;approbation
            </h1>
            <p className="text-slate-500 dark:text-gray-400 text-sm">
              {patients.length} patient{patients.length !== 1 ? "s" : ""} en
              attente
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-500 dark:text-blue-400" size={32} />
          <span className="ml-3 text-slate-500 dark:text-gray-400">Chargement...</span>
        </div>
      ) : patients.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-slate-200 dark:border-cyan-300/20">
          <CheckCircle className="mx-auto text-green-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold mb-2">
            Aucun patient en attente
          </h3>
          <p className="text-slate-500 dark:text-slate-500 dark:text-gray-400">
            Tous les patients ont été traités.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {patients.map((patient) => (
            <div
              key={patient.id}
              className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-cyan-300/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              {/* Patient Info */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400 font-bold text-lg">
                  {patient.firstName?.[0]}
                  {patient.lastName?.[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {patient.firstName} {patient.lastName}
                  </h3>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 text-sm mt-1">
                    <Mail size={14} />
                    <span>{patient.email}</span>
                  </div>
                  {patient.phoneNumber && (
                    <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 text-sm mt-1">
                      <Phone size={14} />
                      <span>{patient.phoneNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 text-sm mt-1">
                    <Clock size={14} />
                    <span>Inscrit le {formatDate(patient.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleOpenApprove(patient)}
                  disabled={processingId === patient.id}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {processingId === patient.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  Approuver
                </button>
                <button
                  onClick={() => handleBan(patient.id)}
                  disabled={processingId === patient.id}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {processingId === patient.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <XCircle size={16} />
                  )}
                  Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approve Modal with Doctor Assignment */}
      {showApproveModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg mx-4 border border-slate-200 dark:border-cyan-300/20 shadow-xl">
            <div className="p-6 border-b border-slate-200 dark:border-cyan-300/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <UserPlus className="text-green-400" size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-lg">
                    Approuver {selectedPatient.firstName}{" "}
                    {selectedPatient.lastName}
                  </h2>
                  <p className="text-slate-500 dark:text-gray-400 text-sm">
                    Assignez un service et un médecin au patient
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* Service Selection */}
              <div>
                <label className="block text-sm text-slate-600 dark:text-gray-300 mb-2 font-medium">
                  Service *
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Sélectionner un service</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.serviceName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor Selection */}
              <div>
                <label className="block text-sm text-slate-600 dark:text-gray-300 mb-2 font-medium">
                  Médecin traitant *
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Sélectionner un médecin</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label} — {d.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-cyan-300/20 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedPatient(null);
                }}
                className="px-5 py-2.5 text-slate-500 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleApprove}
                disabled={processingId === selectedPatient.id}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {processingId === selectedPatient.id ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCircle size={16} />
                )}
                Approuver et assigner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
