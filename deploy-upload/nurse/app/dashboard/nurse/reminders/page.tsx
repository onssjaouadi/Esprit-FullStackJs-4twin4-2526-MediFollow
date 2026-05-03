"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Plus,
  Search,
  Calendar,
  User,
  Trash2,
  Send,
  CheckCircle2,
  AlertCircle,
  Activity,
} from "lucide-react";
import {
  getNurseReminders,
  createPatientReminder,
  sendPatientReminder,
  getNursePatients,
} from "@/lib/actions/nurse.actions";
import { getCurrentUser } from "@/lib/actions/auth.actions";

export default function NurseRemindersPage() {
  const router = useRouter();
  const [reminders, setReminders] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewReminderModal, setShowNewReminderModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentNurseId, setCurrentNurseId] = useState<string | null>(null);
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(
    null
  );
  const [creatingReminder, setCreatingReminder] = useState(false);
  const [formData, setFormData] = useState({
    patientId: "",
    title: "",
    message: "",
    reminderType: "MEDICATION",
    priority: "NORMAL",
    scheduledFor: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      // Get current user
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        console.error("User not authenticated, redirecting to login");
        setError("Session expirée. Veuillez vous reconnecter pour continuer.");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
        return;
      }

      setCurrentNurseId(currentUser.id);

      // Fetch reminders
      const remindersResult = await getNurseReminders(currentUser.id);
      if (remindersResult.success && remindersResult.reminders) {
        setReminders(remindersResult.reminders);
      } else {
        setError(
          remindersResult.error || "Erreur lors du chargement des rappels"
        );
      }

      // Fetch patients
      const patientsResult = await getNursePatients(currentUser.id);
      if (patientsResult.success && patientsResult.patients) {
        setPatients(patientsResult.patients);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }

  const filteredReminders = reminders.filter((r) => {
    const patientName = `${r.patient?.user?.firstName} ${r.patient?.user?.lastName}`;
    return (
      patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleSendReminder = async (reminderId: string) => {
    try {
      setSendingReminderId(reminderId);
      const result = await sendPatientReminder(reminderId);
      if (result.success) {
        setReminders(
          reminders.map((r) =>
            r.id === reminderId ? { ...r, isSent: true } : r
          )
        );
        setSuccessMessage("Rappel envoyé");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(result.error || "Erreur lors de l'envoi");
      }
    } catch (err) {
      console.error("Error sending reminder:", err);
      setError("Erreur lors de l'envoi du rappel");
    } finally {
      setSendingReminderId(null);
    }
  };

  const handleCreateReminder = async () => {
    if (
      !formData.patientId ||
      !formData.title ||
      !formData.scheduledFor ||
      !currentNurseId
    ) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    try {
      setCreatingReminder(true);
      const result = await createPatientReminder(
        currentNurseId,
        formData.patientId,
        {
          title: formData.title,
          message: formData.message || formData.title,
          reminderType: formData.reminderType as any,
          scheduledFor: new Date(formData.scheduledFor),
          priority: formData.priority as any,
        }
      );

      if (result.success) {
        setReminders([...reminders, result.reminder]);
        setSuccessMessage("Rappel créé avec succès");
        setTimeout(() => setSuccessMessage(""), 3000);
        setFormData({
          patientId: "",
          title: "",
          message: "",
          reminderType: "MEDICATION",
          priority: "NORMAL",
          scheduledFor: "",
        });
        setShowNewReminderModal(false);
      } else {
        setError(result.error || "Erreur lors de la création");
      }
    } catch (err) {
      console.error("Error creating reminder:", err);
      setError("Erreur lors de la création du rappel");
    } finally {
      setCreatingReminder(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400";
      case "HIGH":
        return "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400";
      case "NORMAL":
        return "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "MEDICATION":
        return "💊";
      case "APPOINTMENT":
        return "📅";
      case "VITAL_CHECK":
        return "❤️";
      case "QUESTIONNAIRE":
        return "📋";
      case "FOLLOW_UP":
        return "🔍";
      default:
        return "📌";
    }
  };

  const pendingCount = reminders.filter((r) => !r.isSent).length;
  const unreadCount = reminders.filter((r) => r.isSent && !r.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Activity className="size-8 text-pink-600 dark:text-pink-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-4">
          <AlertCircle className="size-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Success Alert */}
      {successMessage && (
        <div className="flex items-center gap-3 rounded-lg bg-pink-50 dark:bg-pink-500/10 border border-pink-200 dark:border-pink-500/30 p-4">
          <Activity className="size-5 text-pink-600 dark:text-pink-400 flex-shrink-0" />
          <p className="text-pink-700 dark:text-pink-400 text-sm">
            {successMessage}
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Rappels aux patients
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez les rappels et envoyez des notifications à vos patients
          </p>
        </div>
        <button
          onClick={() => setShowNewReminderModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus size={18} />
          Nouveau rappel
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase">
            Rappels en attente
          </p>
          <p className="text-3xl font-bold text-pink-600 dark:text-pink-400 mt-2">
            {pendingCount}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase">
            Envoyés (non lus)
          </p>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {unreadCount}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase">
            Total des rappels
          </p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {reminders.length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Chercher un patient ou un rappel..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition-all"
        />
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {filteredReminders.length > 0 ? (
          filteredReminders.map((reminder) => {
            const scheduledDate = new Date(reminder.scheduledFor);
            const timeUntil = scheduledDate.getTime() - Date.now();
            const isOverdue = timeUntil < 0;
            const hoursUntil = Math.floor(
              Math.abs(timeUntil) / (60 * 60 * 1000)
            );
            const minutesUntil = Math.floor(
              (Math.abs(timeUntil) % (60 * 60 * 1000)) / (60 * 1000)
            );

            return (
              <div
                key={reminder.id}
                className={`rounded-lg border p-4 transition-all ${
                  reminder.isSent
                    ? "bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600"
                    : "bg-white dark:bg-gray-800 border-pink-200 dark:border-pink-500/30"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-2xl mt-1">
                      {getTypeIcon(reminder.reminderType)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                          {reminder.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(reminder.priority)}`}
                        >
                          {reminder.priority === "URGENT"
                            ? "🔴 Urgent"
                            : reminder.priority === "HIGH"
                              ? "🟠 Élevée"
                              : reminder.priority === "NORMAL"
                                ? "🔵 Normal"
                                : "⚪ Basse"}
                        </span>
                        {reminder.isSent && !reminder.isRead && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">
                            Non lu
                          </span>
                        )}
                        {reminder.isRead && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-400">
                            ✓ Lu
                          </span>
                        )}
                      </div>

                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <p className="font-medium">
                          {reminder.patient?.user?.firstName}{" "}
                          {reminder.patient?.user?.lastName}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 text-xs">
                            Patient
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white mt-1">
                            {reminder.patientName}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 text-xs">
                            Prévu pour
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white mt-1">
                            {scheduledDate.toLocaleString("fr")}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`text-xs font-medium flex items-center gap-1 ${
                          isOverdue
                            ? "text-red-600 dark:text-red-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        <Clock size={14} />
                        {isOverdue
                          ? `⚠️ En retard de ${hoursUntil}h ${minutesUntil}m`
                          : `Prévu dans ${hoursUntil}h ${minutesUntil}m`}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    {!reminder.isSent && (
                      <button
                        onClick={() => handleSendReminder(reminder.id)}
                        disabled={sendingReminderId === reminder.id}
                        className="p-2 text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Envoyer"
                      >
                        <Send size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Clock className="size-12 text-gray-400 mx-auto mb-4 opacity-50" />
            <p className="text-gray-600 dark:text-gray-400">
              Aucun rappel trouvé
            </p>
          </div>
        )}
      </div>

      {/* New Reminder Modal */}
      {showNewReminderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Créer un nouveau rappel
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Patient
                </label>
                <select
                  value={formData.patientId}
                  onChange={(e) =>
                    setFormData({ ...formData, patientId: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none"
                  title="Sélectionner un patient"
                >
                  <option value="">-- Sélectionner un patient --</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.user?.firstName} {patient.user?.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Titre
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Titre du rappel"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={formData.reminderType}
                  onChange={(e) =>
                    setFormData({ ...formData, reminderType: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
                  title="Sélectionner un type"
                >
                  <option value="MEDICATION">💊 Médicament</option>
                  <option value="APPOINTMENT">📅 Rendez-vous</option>
                  <option value="VITAL_CHECK">❤️ Mesure vitale</option>
                  <option value="QUESTIONNAIRE">📋 Questionnaire</option>
                  <option value="FOLLOW_UP">🔍 Suivi</option>
                  <option value="GENERAL">📌 Général</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priorité
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
                  title="Sélectionner une priorité"
                >
                  <option value="LOW">⚪ Basse</option>
                  <option value="NORMAL">🔵 Normal</option>
                  <option value="HIGH">🟠 Élevée</option>
                  <option value="URGENT">🔴 Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Message du rappel (optionnel)"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prévu pour
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledFor}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledFor: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowNewReminderModal(false);
                    setFormData({
                      patientId: "",
                      title: "",
                      message: "",
                      reminderType: "MEDICATION",
                      priority: "NORMAL",
                      scheduledFor: "",
                    });
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateReminder}
                  disabled={creatingReminder}
                  className="flex-1 px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingReminder ? "Création..." : "Créer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
