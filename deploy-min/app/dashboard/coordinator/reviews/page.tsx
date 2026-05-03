"use client";

import { useEffect, useState } from "react";
import { Loader2, Bot, FileWarning } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import {
  getUnifiedReviews,
  closeUnifiedReview,
  escalateCoordinatorAlert,
  requestPatientReMeasure,
} from "@/lib/actions/coordinator.actions";
import { formatDateTime } from "@/lib/utils";

// Composant Interne pour afficher et gérer chaque carte de signalement.
function ReviewCard({
  review,
  onUpdate,
}: {
  review: any;
  onUpdate: () => void;
}) {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [remeasureSent, setRemeasureSent] = useState(false);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [notificationRecipient, setNotificationRecipient] = useState<
    "ADMIN" | "NURSE"
  >("ADMIN");
  const [notificationNote, setNotificationNote] = useState("");
  const [notificationSent, setNotificationSent] = useState(false);

  const runAiAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/coordinator/review-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: review.title,
          note: review.note,
          vitalRecord: review.vitalRecord,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiAnalysis(data.analysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleClose = async () => {
    setBusy(true);
    await closeUnifiedReview(review.id, review.sourceType);
    onUpdate();
    setBusy(false);
  };

  const handleEscalate = async () => {
    setBusy(true);
    if (review.sourceType === "ALERT") {
      const enrichment = aiAnalysis ? `\n\nAnalyse IA : ${aiAnalysis}` : "";
      await escalateCoordinatorAlert(
        review.id,
        "Expertise médicale demandée par le coordinateur." + enrichment
      );
    }
    await handleClose(); // On clôture la révision après escalade
  };

  const handleRequestReMeasure = async () => {
    setBusy(true);
    // Use AI analysis results as the note for the patient if available
    const customNote = aiAnalysis
      ? `Analyse experte : ${aiAnalysis}`
      : review.note;

    const res = await requestPatientReMeasure(review.patientId, customNote);
    if (res.success) {
      setRemeasureSent(true);
      setTimeout(() => setRemeasureSent(false), 3000);
    }
    setBusy(false);
  };

  const handleSendNotification = async () => {
    if (!notificationNote.trim() && !aiAnalysis) {
      alert("Veuillez ajouter une note ou générer une analyse IA");
      return;
    }

    setBusy(true);
    try {
      const message = `Alerte du patient ${review.patientName}: ${review.title}\n\n${
        notificationNote ? `Note: ${notificationNote}\n` : ""
      }${aiAnalysis ? `Analyse IA: ${aiAnalysis}` : ""}`;

      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientRole: notificationRecipient,
          title: `Alerte patient: ${review.patientName}`,
          message: message,
          type: "ALERT",
          relatedAlertId: review.id,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNotificationSent(true);
        setNotificationDialogOpen(false);
        setTimeout(() => setNotificationSent(false), 3000);
      } else {
        alert(
          "Erreur: " + (data.error || "Impossible d'envoyer la notification")
        );
      }
    } catch (error) {
      console.error("Erreur d'envoi:", error);
      alert("Erreur lors de l'envoi de la notification");
    } finally {
      setBusy(false);
    }
  };

  const isCritique = review.reviewType === "Critique";
  const borderCol = isCritique
    ? "border-l-4 border-l-red-500 border-gray-200 dark:border-gray-800"
    : review.reviewType === "Suspect"
      ? "border-l-4 border-l-amber-500 border-gray-200 dark:border-gray-800"
      : "border-l-4 border-l-blue-500 border-gray-200 dark:border-gray-800";

  const priorityCol =
    review.priority === "haute"
      ? "text-red-500"
      : review.priority === "moyenne"
        ? "text-amber-500"
        : "text-blue-500";

  return (
    <div
      className={`bg-white dark:bg-[#1a1a1a] rounded-xl p-5 shadow-sm border ${borderCol} flex flex-col gap-3 relative`}
    >
      <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1 rounded-full text-xs font-bold text-gray-800 dark:text-gray-200">
        {review.reviewType}
      </div>

      <div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/coordinator/patients/${review.patientId}`}
            className="font-bold text-lg text-gray-900 dark:text-white hover:underline"
          >
            {review.patientName}
          </Link>
          <span className="text-gray-500">•</span>
          <span className={`text-xs font-semibold ${priorityCol}`}>
            Priorité {review.priority}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {formatDateTime(review.createdAt)} • Protocole de suivi
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          📧 {review.patientEmail}
        </p>

        {/* Status and Doctor Info */}
        <div className="flex flex-col gap-2 mt-3">
          {/* Alert Treatment Status */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                review.isResolved
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
              }`}
            >
              {review.isResolved ? "✓ Traitée" : "⏳ En attente"}
            </span>
            {review.isResolved && review.resolvedBy && (
              <span className="text-xs text-gray-600 dark:text-gray-400">
                par {review.resolvedBy.firstName} {review.resolvedBy.lastName}
              </span>
            )}
          </div>

          {/* Assigned Doctor */}
          {review.assignedDoctor ? (
            <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                👨‍⚕️ Médecin :
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-blue-900 dark:text-blue-300">
                  {review.assignedDoctor.firstName}{" "}
                  {review.assignedDoctor.lastName}
                </span>
                <span className="text-xs text-blue-700 dark:text-blue-400">
                  {review.assignedDoctor.email}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-900/30 rounded-lg border border-gray-300 dark:border-gray-700">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                ℹ️ Aucun médecin assigné
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-1">
        <h4 className="text-[15px] font-semibold text-gray-900 dark:text-white">
          {review.title}
        </h4>
        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1.5">
          {review.vitalRecord && (
            <span>
              ⏱ Mesure liée : {formatDateTime(review.vitalRecord.recordedAt)}
            </span>
          )}
          <span>♡ {review.note}</span>
        </div>
      </div>

      {review.vitalRecord && (
        <div className="flex flex-wrap gap-2 mt-2">
          {review.vitalRecord.temperature && (
            <span className="bg-gray-100 dark:bg-[#252525] text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold">
              Temp. {review.vitalRecord.temperature}°C
            </span>
          )}
          {review.vitalRecord.heartRate && (
            <span className="bg-gray-100 dark:bg-[#252525] text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
              FC {review.vitalRecord.heartRate} bpm
            </span>
          )}
          {review.vitalRecord.systolicBP && (
            <span className="bg-gray-100 dark:bg-[#252525] text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
              TA {review.vitalRecord.systolicBP}/
              {review.vitalRecord.diastolicBP}
            </span>
          )}
          {review.vitalRecord.oxygenSaturation && (
            <span className="bg-gray-100 dark:bg-[#252525] text-amber-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold">
              SpO₂ {review.vitalRecord.oxygenSaturation}%
            </span>
          )}
          {review.vitalRecord.symptoms?.respiratoryRate && (
            <span className="bg-gray-100 dark:bg-[#252525] text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold">
              F.R. {review.vitalRecord.symptoms.respiratoryRate} rpm
            </span>
          )}
          {review.vitalRecord.weight && (
            <span className="bg-gray-100 dark:bg-[#252525] text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full text-xs font-bold">
              Poids {review.vitalRecord.weight} kg
            </span>
          )}
        </div>
      )}

      {/* Advanced Clinical Data (Glycemia, CRP, etc.) */}
      {review.vitalRecord?.symptoms?.advanced &&
        Object.values(review.vitalRecord.symptoms.advanced).some(
          (v) => v !== null
        ) && (
          <div className="mt-4 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/10 dark:bg-blue-900/5">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
              Analyses complémentaires
            </p>
            <div className="flex flex-wrap gap-4">
              {review.vitalRecord.symptoms.advanced.glycemia && (
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 uppercase">
                    Glycémie
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {review.vitalRecord.symptoms.advanced.glycemia} g/L
                  </span>
                </div>
              )}
              {review.vitalRecord.symptoms.advanced.crp && (
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 uppercase">
                    CRP
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {review.vitalRecord.symptoms.advanced.crp} mg/L
                  </span>
                </div>
              )}
              {review.vitalRecord.symptoms.advanced.diuresis && (
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 uppercase">
                    Diurèse
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {review.vitalRecord.symptoms.advanced.diuresis} ml
                  </span>
                </div>
              )}
              {review.vitalRecord.symptoms.advanced.hydration && (
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 uppercase">
                    Hydratation
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white capitalize">
                    {review.vitalRecord.symptoms.advanced.hydration}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

      <div className="mt-3 bg-gray-50 dark:bg-[#1f2922] border border-emerald-100 dark:border-emerald-900/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Bot className="size-4 text-emerald-600 dark:text-emerald-500" />
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-500">
            Analyse IA
          </span>
          {!aiAnalysis && !analyzing && (
            <button
              onClick={runAiAnalysis}
              className="ml-auto text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-0.5 rounded font-bold transition-colors"
            >
              Lancer l'analyse
            </button>
          )}
        </div>
        {analyzing ? (
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300/70 text-sm">
            <Loader2 className="size-4 animate-spin" /> Analyse des variables en
            cours...
          </div>
        ) : (
          <p className="text-sm text-gray-800 dark:text-emerald-100/90 leading-relaxed font-medium">
            {aiAnalysis || "Analyse indisponible."}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mt-4">
        {isCritique && (
          <button
            onClick={handleEscalate}
            disabled={busy}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {busy ? "En cours..." : "Escalader au médecin"}
          </button>
        )}
        {!isCritique && (
          <button
            onClick={handleRequestReMeasure}
            disabled={busy || remeasureSent}
            className={`px-4 py-2 border rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
              remeasureSent
                ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                : "border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {busy
              ? "En cours..."
              : remeasureSent
                ? "Demande envoyée ✓"
                : "Demander re-mesure"}
          </button>
        )}
        <button
          onClick={() => setNotificationDialogOpen(true)}
          disabled={busy || notificationSent}
          className={`px-4 py-2 border rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
            notificationSent
              ? "bg-blue-50 border-blue-500 text-blue-700"
              : "border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          }`}
        >
          {notificationSent
            ? "Notification envoyée ✓"
            : "📧 Envoyer notification"}
        </button>
        <button
          onClick={handleClose}
          disabled={busy}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {busy ? "..." : "Acquitter"}
        </button>
      </div>

      {/* Notification Dialog */}
      {notificationDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              📧 Envoyer une notification
            </h3>

            {/* AI Analysis Preview */}
            {aiAnalysis && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                  Analyse IA à inclure:
                </p>
                <p className="text-sm text-emerald-900 dark:text-emerald-100">
                  {aiAnalysis}
                </p>
              </div>
            )}

            {/* Recipient Selection */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Envoyer à:
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setNotificationRecipient("ADMIN")}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${
                    notificationRecipient === "ADMIN"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
                  }`}
                >
                  👨‍💼 Admin
                </button>
                <button
                  onClick={() => setNotificationRecipient("NURSE")}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${
                    notificationRecipient === "NURSE"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
                  }`}
                >
                  👩‍⚕️ Nurse
                </button>
              </div>
            </div>

            {/* Note Input */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Note supplémentaire:
              </label>
              <textarea
                value={notificationNote}
                onChange={(e) => setNotificationNote(e.target.value)}
                placeholder="Ajouter une note..."
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setNotificationDialogOpen(false)}
                disabled={busy}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSendNotification}
                disabled={busy}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {busy ? "Envoi..." : "Envoyer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Page Principale
export default function CoordinatorReviewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState("Tous");

  async function load() {
    const res = await getUnifiedReviews();
    if (res.success) {
      setReviews(res.reviews);
      setStats(res.stats);
    }
  }

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (!user || user.role !== "COORDINATOR") {
        router.push("/login");
        return;
      }
      await load();
      setLoading(false);
    })();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Loader2 className="size-10 animate-spin text-red-600" />
        <p className="font-semibold text-gray-600 dark:text-gray-400">
          Chargement de la console...
        </p>
      </div>
    );
  }

  const filteredReviews = reviews.filter((r) => {
    if (filter === "Tous") return true;
    if (filter === "Critiques") return r.reviewType === "Critique";
    if (filter === "Suspects") return r.reviewType === "Suspect";
    if (filter === "Incomplets") return r.reviewType === "Incomplet";
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        {/* STATS BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 border-b-4 border-b-red-500 flex flex-col justify-between">
            <span className="text-3xl font-bold text-red-500">
              {stats?.critiques || 0}
            </span>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mt-2">
              Critiques
            </span>
          </div>
          <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 border-b-4 border-b-amber-500 flex flex-col justify-between">
            <span className="text-3xl font-bold text-amber-500">
              {stats?.suspects || 0}
            </span>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mt-2">
              Suspects
            </span>
          </div>
          <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 border-b-4 border-b-blue-500 flex flex-col justify-between">
            <span className="text-3xl font-bold text-blue-500">
              {stats?.incomplets || 0}
            </span>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mt-2">
              Incomplets
            </span>
          </div>
          <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 border-b-4 border-b-emerald-600 flex flex-col justify-between">
            <span className="text-3xl font-bold text-emerald-600">
              {stats?.closedToday || 0}
            </span>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mt-2">
              Clôturés aujourd'hui
            </span>
          </div>
        </div>

        {/* FILTERS & SORT */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {["Tous", "Critiques", "Suspects", "Incomplets"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${
                  filter === f
                    ? "bg-gray-900 border-gray-900 text-white dark:bg-white dark:border-white dark:text-black"
                    : "bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-500"
                }`}
              >
                {f}{" "}
                {f === "Tous"
                  ? `(${stats?.total})`
                  : f === "Critiques"
                    ? `(${stats?.critiques})`
                    : f === "Suspects"
                      ? `(${stats?.suspects})`
                      : `(${stats?.incomplets})`}
              </button>
            ))}
          </div>

          <select className="bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block px-4 py-2.5 font-semibold appearance-none">
            <option>Trier: Plus récent</option>
            <option>Trier: Plus ancien</option>
          </select>
        </div>

        {/* LIST */}
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <FileWarning className="mx-auto size-10 text-gray-400 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Aucun élément
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Vous êtes à jour dans vos revues.
              </p>
            </div>
          ) : (
            filteredReviews.map((r) => (
              <ReviewCard key={r.id} review={r} onUpdate={load} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
