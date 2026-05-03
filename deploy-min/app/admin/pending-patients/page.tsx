"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  User,
} from "lucide-react";

import {
  getPendingPatients,
  approvePatient,
  banPatient,
} from "@/lib/actions/admin.actions";
import { PatientWithUser } from "@/types/medifollow.types";
import { formatDateTime } from "@/lib/utils";

export default function PendingPatientsPage() {
  const [patients, setPatients] = useState<PatientWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingPatients();
  }, []);

  const fetchPendingPatients = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPendingPatients();
      setPatients(data || []);
    } catch (error) {
      console.error("Error fetching pending patients:", error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleApprovePatient = useCallback(async (patientId: string) => {
    setProcessingId(patientId);
    try {
      const result = await approvePatient(patientId);
      if (result.success) {
        setPatients((prev) => prev.filter((p) => p.id !== patientId));
        console.log("✅ Patient approved successfully");
      } else {
        console.error("Error approving patient:", result.error);
        alert("Erreur lors de l'approbation du patient");
      }
    } catch (error) {
      console.error("Error approving patient:", error);
      alert("Erreur lors de l'approbation du patient");
    } finally {
      setProcessingId(null);
    }
  }, []);

  const handleBanPatient = useCallback(async (patientId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir rejeter ce patient ?")) {
      return;
    }

    setProcessingId(patientId);
    try {
      const result = await banPatient(patientId);
      if (result.success) {
        setPatients((prev) => prev.filter((p) => p.id !== patientId));
        console.log("✅ Patient rejected successfully");
      } else {
        console.error("Error rejecting patient:", result.error);
        alert("Erreur lors du rejet du patient");
      }
    } catch (error) {
      console.error("Error rejecting patient:", error);
      alert("Erreur lors du rejet du patient");
    } finally {
      setProcessingId(null);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
          <p className="text-slate-600 dark:text-slate-400">
            Chargement des patients en attente...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Patients en Attente d'Approbation
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 ml-11">
            {patients.length} patient{patients.length !== 1 ? "s" : ""} en
            attente de votre approbation
          </p>
        </div>

        {/* Empty State */}
        {patients.length === 0 ? (
          <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-green-100 dark:bg-green-500/20 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Aucun patient en attente
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Tous les patients en attente ont été traités
            </p>
          </div>
        ) : (
          /* Patients Grid */
          <div className="grid gap-4">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-indigo-500/10 transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-cyan-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-7 h-7 text-white" />
                    </div>

                    {/* Patient Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {patient.user.firstName} {patient.user.lastName}
                      </h3>
                      <div className="flex flex-col gap-2 mt-2 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 flex-shrink-0" />
                          <a
                            href={`mailto:${patient.user.email}`}
                            className="hover:text-indigo-600 dark:hover:text-indigo-400"
                          >
                            {patient.user.email}
                          </a>
                        </div>
                        {patient.user.phoneNumber && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 flex-shrink-0" />
                            <span>{patient.user.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="px-3 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded-full whitespace-nowrap ml-4">
                    En attente
                  </div>
                </div>

                {/* Patient Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-500 font-medium uppercase">
                      DPI
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {patient.medicalRecordNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-500 font-medium uppercase">
                      Groupe sanguin
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {patient.bloodType || "Non défini"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-500 font-medium uppercase">
                      Genre
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {patient.gender === "MALE"
                        ? "Homme"
                        : patient.gender === "FEMALE"
                          ? "Femme"
                          : "Autre"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-500 font-medium uppercase">
                      Inscription
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {formatDateTime(patient.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end pt-4">
                  <button
                    onClick={() => handleBanPatient(patient.id)}
                    disabled={processingId === patient.id}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-100 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/30 disabled:opacity-60 disabled:cursor-not-allowed text-red-700 dark:text-red-300 font-semibold rounded-xl transition-all"
                  >
                    {processingId === patient.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Rejet...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        Rejeter
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleApprovePatient(patient.id)}
                    disabled={processingId === patient.id}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all"
                  >
                    {processingId === patient.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Approbation...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Approuver
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
