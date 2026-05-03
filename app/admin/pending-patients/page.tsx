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
import { PatientWithUser } from "@/types/medifollow.types";
import { formatDateTime } from "@/lib/utils";

interface MedicalBackground {
  diabetes?: boolean;
  hypertension?: boolean;
  cardiacDisease?: boolean;
  asthmaOuBpco?: boolean;
  cancer?: boolean;
  otherConditions?: string;
}

interface MedicalProfile {
  hospital?: string;
  department?: string;
  specialty?: string;
  height?: number;
  weight?: number;
  medicalBackground?: MedicalBackground;
}

interface QuestionnaireResponseItem {
  id: string;
  answer?: string | null;
  question?: {
    id: string;
    questionText: string;
    questionType?: string;
    options?: string[];
  } | null;
}

interface QuestionnaireAssignmentInfo {
  id: string;
  status: string;
  template: {
    id: string;
    title: string;
    specialty?: string;
  };
  responses: QuestionnaireResponseItem[];
}

interface PendingUser extends PatientWithUser {
  questionnaireAssignments: QuestionnaireAssignmentInfo[];
  medicalProfile?: MedicalProfile | null;
  questionnaireCompleted?: boolean;
}

interface ServiceOption {
  id: string;
  serviceName: string;
  patientIds?: string[];
  teamIds?: string[];
  specializations?: string[];
}

interface DoctorOption {
  id: string;
  label: string;
  email: string;
  role: string;
}

export default function PendingPatientsPage() {
  const [patients, setPatients] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);

  // Modal state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PendingUser | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [patientsData, servicesData, doctorsData] = await Promise.all([
        getPendingPatients(),
        getAllServices(),
        getAssignableCareTeam(),
      ]);

      // Normalize patients data
      const normalizedPatients = patientsData
        ? patientsData.map((patient: any) => ({
            ...patient,
            questionnaireAssignments: patient.questionnaireAssignments
              ? patient.questionnaireAssignments.map((assignment: any) => ({
                  id: assignment.id,
                  status: assignment.status,
                  template: {
                    id: assignment.template?.id,
                    title: assignment.template?.title,
                    specialty: assignment.template?.specialty,
                  },
                  responses: assignment.responses
                    ? assignment.responses.map((response: any) => ({
                        id: response.id,
                        answer: response.answer,
                        question: response.question
                          ? {
                              id: response.question.id,
                              questionText: response.question.questionText,
                              questionType: response.question.questionType,
                              options: response.question.options,
                            }
                          : null,
                      }))
                    : [],
                }))
              : [],
            medicalProfile: patient.medicalProfile ?? null,
            questionnaireCompleted: Boolean(patient.questionnaireCompleted),
          }))
        : [];

      setPatients(normalizedPatients);
      setServices(
        servicesData?.success && Array.isArray(servicesData.services)
          ? (servicesData.services as ServiceOption[])
          : []
      );
      setDoctors(
        doctorsData?.success && Array.isArray(doctorsData.team)
          ? (doctorsData.team as DoctorOption[]).filter(
              (member) => member.role === "DOCTOR"
            )
          : []
      );
    } catch (error) {
      console.error("Error loading data:", error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpenApprove = (patient: PendingUser) => {
    const specialty =
      patient.questionnaireAssignments?.[0]?.template?.specialty ||
      patient.medicalProfile?.specialty;
    let matchedServiceId = "";

    if (specialty) {
      const normalizedSpecialty = specialty.toLowerCase();
      const match = services.find(
        (service) =>
          service.specializations?.some(
            (spec) => spec?.toLowerCase() === normalizedSpecialty
          ) ||
          service.serviceName?.toLowerCase().includes(normalizedSpecialty)
      );
      if (match) {
        matchedServiceId = match.id;
      }
    }

    setSelectedPatient(patient);
    setSelectedServiceId(matchedServiceId);
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
        const patientUserId = selectedPatient.userId || selectedPatient.user.id;
        const existingPatientIds = Array.isArray(selectedService?.patientIds)
          ? selectedService.patientIds
          : [];
        const existingTeamIds = Array.isArray(selectedService?.teamIds)
          ? selectedService.teamIds
          : [];

        await updateService(selectedServiceId, {
          patientIds: Array.from(new Set([...existingPatientIds, patientUserId])),
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

  const handleBanPatient = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir refuser ce patient ?")) return;

    setProcessingId(userId);
    try {
      const result = await banPatient(userId);
      if (result.success) {
        setPatients((prev) => prev.filter((p) => p.id !== userId));
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
  };

  const renderAnswer = (answer: any) => {
    if (typeof answer === "string") {
      return answer;
    }
    if (Array.isArray(answer)) {
      return answer.join(", ");
    }
    if (typeof answer === "object" && answer !== null) {
      return JSON.stringify(answer, null, 2);
    }
    return String(answer);
  };

  const renderMedicalProfile = (profile: MedicalProfile) => {
    return (
      <div className="space-y-3">
        {profile.hospital && (
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3">
            <p className="text-sm font-medium">Hôpital</p>
            <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">{profile.hospital}</p>
          </div>
        )}
        {profile.department && (
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3">
            <p className="text-sm font-medium">Département</p>
            <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">{profile.department}</p>
          </div>
        )}
        {profile.specialty && (
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3">
            <p className="text-sm font-medium">Spécialité</p>
            <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">{profile.specialty}</p>
          </div>
        )}
        {(profile.height || profile.weight) && (
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3">
            <p className="text-sm font-medium">Mesures</p>
            <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">
              {profile.height && `Hauteur: ${profile.height}cm`}
              {profile.height && profile.weight && " | "}
              {profile.weight && `Poids: ${profile.weight}kg`}
            </p>
          </div>
        )}
        {profile.medicalBackground && (
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3">
            <p className="text-sm font-medium">Antécédents médicaux</p>
            <div className="text-sm text-slate-600 dark:text-gray-400 mt-1 space-y-1">
              {profile.medicalBackground.diabetes && <p>• Diabète</p>}
              {profile.medicalBackground.hypertension && <p>• Hypertension</p>}
              {profile.medicalBackground.cardiacDisease && <p>• Maladie cardiaque</p>}
              {profile.medicalBackground.asthmaOuBpco && <p>• Asthme ou BPCO</p>}
              {profile.medicalBackground.cancer && <p>• Cancer</p>}
              {profile.medicalBackground.otherConditions && <p>• {profile.medicalBackground.otherConditions}</p>}
            </div>
          </div>
        )}
      </div>
    );
  };

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
                    onClick={() => handleOpenApprove(patient)}
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

        {/* Approval Modal */}
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
                      Approuver {selectedPatient.user.firstName}{" "}
                      {selectedPatient.user.lastName}
                    </h2>
                    <p className="text-slate-500 dark:text-gray-400 text-sm">
                      Assignez un service et un médecin au patient
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-5 max-h-96 overflow-y-auto">
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <p className="font-semibold text-sm">Détails du questionnaire</p>
                    <span className="text-xs text-slate-500 dark:text-gray-400">
                      {selectedPatient.questionnaireAssignments.length > 0
                        ? `${selectedPatient.questionnaireAssignments.length} questionnaire${selectedPatient.questionnaireAssignments.length > 1 ? "s" : ""}`
                        : "Aucun questionnaire"}
                    </span>
                  </div>
                  {selectedPatient.questionnaireAssignments.length > 0 ? (
                    <div className="space-y-4">
                      {selectedPatient.questionnaireAssignments.map((assignment) => (
                        <div key={assignment.id} className="space-y-3">
                          <div className="flex items-center justify-between gap-2 text-sm text-slate-600 dark:text-gray-400">
                            <div>
                              <p className="font-medium">{assignment.template.title}</p>
                              <p className="text-xs text-slate-500 dark:text-gray-400">
                                Spécialité : {assignment.template.specialty ?? "Général"}
                              </p>
                            </div>
                            <span className="rounded-full px-2 py-1 text-[11px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                              {assignment.status}
                            </span>
                          </div>
                          {assignment.responses.length > 0 ? (
                            <div className="grid gap-3">
                              {assignment.responses.map((response) => (
                                <div
                                  key={response.id}
                                  className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3"
                                >
                                  <p className="text-sm font-medium">
                                    {response.question?.questionText ?? "Question inconnue"}
                                  </p>
                                  <p className="text-sm text-slate-600 dark:text-gray-400 mt-1 whitespace-pre-wrap">
                                    {renderAnswer(response.answer)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500 dark:text-gray-400">
                              Aucune réponse soumise.
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : selectedPatient.medicalProfile ? (
                    <div className="space-y-4">
                      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4">
                        <p className="text-sm font-medium mb-3">Profil médical rempli</p>
                        {renderMedicalProfile(selectedPatient.medicalProfile)}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-gray-400">
                      Aucun questionnaire rempli.
                    </p>
                  )}
                </div>

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
    </div>
  );
}
