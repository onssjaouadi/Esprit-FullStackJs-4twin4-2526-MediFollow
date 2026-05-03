"use client";

import {
  Send,
  Search,
  MessageSquare,
  User,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getAllPatients } from "@/lib/actions/patient.actions";
import {
  sendReminderToPatient,
  sendGuidanceToPatient,
} from "@/lib/actions/coordinator.actions";

export default function CommunicationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [messageType, setMessageType] = useState<"REMINDER" | "GUIDANCE">("REMINDER");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser || currentUser.role !== "COORDINATOR") {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      const patientsResult = await getAllPatients();
      if (patientsResult) {
        setPatients(patientsResult);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;

    const query = searchQuery.toLowerCase();
    return patients.filter((patient) => {
      const fullName =
        `${patient.user.firstName} ${patient.user.lastName}`.toLowerCase();
      const mrn = patient.medicalRecordNumber.toLowerCase();
      return fullName.includes(query) || mrn.includes(query);
    });
  }, [patients, searchQuery]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !selectedPatient || sending) return;

    setSending(true);
    setError("");
    setSuccess("");

    try {
      const result =
        messageType === "REMINDER"
          ? await sendReminderToPatient(
              selectedPatient.id,
              user.id,
              message,
              subject || undefined
            )
          : await sendGuidanceToPatient(
              selectedPatient.id,
              user.id,
              message,
              subject || undefined
            );

      if (result.success) {
        setSuccess(
          `Message envoyé à ${selectedPatient.user.firstName} ${selectedPatient.user.lastName}`
        );
        setMessage("");
        setSubject("");
        setTimeout(() => {
          setSuccess("");
          setSelectedPatient(null);
        }, 3000);
      } else {
        setError(result.error || "Erreur lors de l'envoi du message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Erreur lors de l'envoi du message");
    } finally {
      setSending(false);
    }
  }

  const messageTemplates = {
    REMINDER: [
      {
        title: "Rappel quotidien",
        subject: "Rappel de suivi médical",
        message:
          "Bonjour, veuillez ne pas oublier de soumettre vos constantes vitales aujourd'hui pour votre suivi médical. Merci.",
      },
      {
        title: "Questionnaire en attente",
        subject: "Questionnaire à compléter",
        message:
          "Vous avez un questionnaire de suivi en attente. Merci de le compléter dès que possible.",
      },
      {
        title: "Suivi hebdomadaire",
        subject: "Rappel de suivi hebdomadaire",
        message:
          "Cette semaine, n'oubliez pas de soumettre vos données de santé régulièrement. Votre suivi est important pour nous.",
      },
    ],
    GUIDANCE: [
      {
        title: "Comment mesurer la tension",
        subject: "Guide de mesure de la tension artérielle",
        message:
          "Pour mesurer correctement votre tension artérielle: 1) Restez assis au calme pendant 5 minutes. 2) Placez le brassard au niveau du cœur. 3) Ne parlez pas pendant la mesure. 4) Prenez 2-3 mesures espacées d'une minute.",
      },
      {
        title: "Conseils généraux",
        subject: "Conseils pour votre suivi",
        message:
          "Pour un suivi optimal: soumettez vos données à la même heure chaque jour, notez tout symptôme inhabituel, et contactez votre médecin en cas d'inquiétude.",
      },
      {
        title: "Assistance technique",
        subject: "Aide pour l'utilisation de l'application",
        message:
          "Si vous rencontrez des difficultés avec l'application, n'hésitez pas à nous contacter. Nous sommes là pour vous aider.",
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <div className="relative mb-4 mx-auto">
            <div className="size-12 animate-spin rounded-full border-3 border-gray-200 border-t-gray-900"></div>
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Centre de communication
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Envoyez des rappels et des conseils aux patients
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Selection */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Sélectionner un patient
            </h2>

            <div className="mb-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedPatient?.id === patient.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold">
                      {patient.user.firstName.charAt(0)}
                      {patient.user.lastName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {patient.user.firstName} {patient.user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        MRN: {patient.medicalRecordNumber}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Message Form */}
          <div className="lg:col-span-2">
            {!selectedPatient ? (
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
                <MessageSquare
                  className="mx-auto text-gray-400 mb-4"
                  size={48}
                />
                <p className="text-gray-500 dark:text-gray-400">
                  Sélectionnez un patient pour envoyer un message
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-6">
                {/* Patient Info */}
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl">
                      {selectedPatient.user.firstName.charAt(0)}
                      {selectedPatient.user.lastName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {selectedPatient.user.firstName}{" "}
                        {selectedPatient.user.lastName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        MRN: {selectedPatient.medicalRecordNumber}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Message Type */}
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Type de message
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setMessageType("REMINDER")}
                      className={`p-4 rounded-lg border text-center transition-colors ${
                        messageType === "REMINDER"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Calendar className="mx-auto mb-2" size={24} />
                      <p className="font-medium">Rappel</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMessageType("GUIDANCE")}
                      className={`p-4 rounded-lg border text-center transition-colors ${
                        messageType === "GUIDANCE"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <User className="mx-auto mb-2" size={24} />
                      <p className="font-medium">Conseil</p>
                    </button>
                  </div>
                </div>

                {/* Templates */}
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Modèles (optionnel)
                  </label>
                  <div className="space-y-2">
                    {messageTemplates[messageType].map((template, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setSubject(template.subject);
                          setMessage(template.message);
                        }}
                        className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                          {template.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {template.message.substring(0, 60)}...
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Content */}
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sujet (optionnel)
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Sujet du message"
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Message *
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={6}
                        placeholder="Écrivez votre message ici..."
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Messages */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-4 text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg p-4 text-green-600 dark:text-green-400 flex items-center gap-2">
                    <CheckCircle size={20} />
                    {success}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={sending || !message.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                  {sending ? "Envoi en cours..." : "Envoyer le message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
