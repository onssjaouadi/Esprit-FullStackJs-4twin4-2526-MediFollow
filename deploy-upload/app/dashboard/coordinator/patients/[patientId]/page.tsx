"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import VitalsAiAgent from "@/components/VitalsAiAgent";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import {
  getCoordinatorPatientDetail,
  sendCoordinatorReminder,
  flagCoordinatorEntry,
} from "@/lib/actions/coordinator.actions";
import { formatDateTime } from "@/lib/utils";

export default function CoordinatorPatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reminderMsg, setReminderMsg] = useState(
    "Bonjour, merci de compléter vos constantes vitales pour aujourd'hui dans MediFollow."
  );
  const [channels, setChannels] = useState({
    IN_APP: true,
    EMAIL: false,
    SMS: false,
  });
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [flagNote, setFlagNote] = useState("");
  const [flagType, setFlagType] = useState<
    "INCOMPLETE" | "SUSPICIOUS" | "OTHER"
  >("INCOMPLETE");
  const [flagVitalId, setFlagVitalId] = useState<string>("");
  const [flagging, setFlagging] = useState(false);
  const [flagError, setFlagError] = useState<string | null>(null);
  const [flagSuccess, setFlagSuccess] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  async function reload() {
    try {
      setLoadError(null);
      const res = await getCoordinatorPatientDetail(patientId);
      if (res.success && res.data) {
        setDetail(res.data);
      } else {
        setLoadError(
          res.error || "Impossible de charger les détails du patient"
        );
        router.push("/dashboard/coordinator/patients");
      }
    } catch (e) {
      console.error(e);
      setLoadError(String(e));
      setDetail(null);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const user = await getCurrentUser();
        if (!user || user.role !== "COORDINATOR") {
          router.push("/login");
          return;
        }
        await reload();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [patientId, router]);

  async function handleSendReminder() {
    setSending(true);
    setSendSuccess(false);
    setSendError(null);
    const ch: ("IN_APP" | "EMAIL" | "SMS")[] = [];
    if (channels.IN_APP) ch.push("IN_APP");
    if (channels.EMAIL) ch.push("EMAIL");
    if (channels.SMS) ch.push("SMS");
    const res = await sendCoordinatorReminder(patientId, reminderMsg, ch);
    if (res.success) {
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 3000);
      setReminderMsg(
        "Bonjour, merci de compléter vos constantes vitales pour aujourd'hui dans MediFollow."
      );
    } else {
      setSendError(
        res.error || "Une erreur est survenue lors de l'envoi du rappel."
      );
    }
    setSending(false);
  }

  async function handleFlag() {
    setFlagError(null);
    setFlagSuccess(false);
    if (!flagNote.trim()) return;

    const selectedVital = detail.vitalsWithCompleteness.find(
      (v: any) => v.id === flagVitalId
    );

    if (
      flagType === "INCOMPLETE" &&
      selectedVital?.completeness?.score === 100
    ) {
      setFlagError(
        "Impossible de signaler une entrée incomplète lorsque la complétude est déjà 100%."
      );
      return;
    }

    setFlagging(true);
    const res = await flagCoordinatorEntry(patientId, {
      vitalRecordId: flagVitalId || undefined,
      flagType,
      note:
        flagNote.trim() ||
        "Signalement interne — Suspicion d'anomalie ou incomplétude.",
    });

    if (res.success) {
      setFlagSuccess(true);
      setTimeout(() => setFlagSuccess(false), 3000);
      setFlagNote("");
      setFlagVitalId("");
      await reload();
    } else {
      setFlagError(res.error || "Une erreur est survenue.");
    }
    setFlagging(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="size-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Chargement impossible
        </h3>
        <p className="text-sm text-gray-500 mt-2">
          {loadError ||
            "Les données de ce patient sont introuvables ou une erreur est survenue."}
        </p>
        <button
          onClick={() => router.push("/dashboard/coordinator/patients")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Retour
        </button>
      </div>
    );
  }

  const { patient, compliance, vitalsWithCompleteness } = detail;

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard/coordinator/patients"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 mb-6"
        >
          ← Retour à la liste
        </Link>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              {patient.user.firstName} {patient.user.lastName}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {patient.medicalRecordNumber} · {patient.user.email}
            </p>
          </div>
          <div className="rounded-xl bg-gray-100 dark:bg-gray-900 px-4 py-2 text-right">
            <p className="text-xs text-gray-500 uppercase">Score global</p>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {compliance.overallScore}%
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-xs font-semibold text-gray-500">Const. (7 j.)</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {compliance.dailyCompliance7d}%
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-xs font-semibold text-gray-500">
              Symptômes (7 j.)
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {compliance.symptomCompliance7d}%
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-xs font-semibold text-gray-500">Quest. (7 j.)</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {compliance.questionnaireCount7d} ·{" "}
              {compliance.questionnaireScore7d}%
            </p>
          </div>
        </div>

        {/* Vitals - NOW FIRST AS REQUESTED */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Dernières mesures vitales
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/80">
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2">TA</th>
                  <th className="px-3 py-2">FC</th>
                  <th className="px-3 py-2">Temp</th>
                  <th className="px-3 py-2">SpO₂</th>
                  <th className="px-3 py-2">Poids</th>
                  <th className="px-3 py-2">F.R.</th>
                  <th className="px-3 py-2">Complétude</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {vitalsWithCompleteness.map((v: any) => (
                  <tr key={v.id}>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {formatDateTime(v.recordedAt)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {v.systolicBP ?? "—"}/{v.diastolicBP ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {v.heartRate ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {v.temperature ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {v.oxygenSaturation ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-center text-xs">
                      {v.weight ? `${v.weight}kg` : "—"}
                    </td>
                    <td className="px-3 py-2 text-center text-xs">
                      {v.symptoms?.respiratoryRate ?? "—"}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          v.completeness.isComplete
                            ? "text-emerald-600 font-semibold"
                            : "text-amber-600 font-semibold"
                        }
                      >
                        {v.completeness.score}%
                      </span>
                      {!v.completeness.isComplete && (
                        <span className="block text-xs text-gray-500">
                          {v.completeness.issues.join(", ")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <VitalsAiAgent
          vitals={vitalsWithCompleteness}
          patientContext={{
            age: patient.dateOfBirth
              ? Math.floor(
                  (Date.now() - new Date(patient.dateOfBirth).getTime()) /
                    (365.25 * 24 * 60 * 60 * 1000)
                )
              : undefined,
            pathology: patient.diagnosis,
          }}
        />

        {/* Rappel */}
        <section className="mt-10 rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            📧 Envoyer un rappel
          </h2>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() =>
                setReminderMsg(
                  "Bonjour, merci de compléter vos constantes vitales pour aujourd'hui dans MediFollow."
                )
              }
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${reminderMsg.includes("constantes vitales") ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-blue-400"}`}
            >
              Rappel Constantes
            </button>
            <button
              type="button"
              onClick={() =>
                setReminderMsg(
                  "Bonjour, n'oubliez pas de soumettre votre questionnaire de suivi avant la date limite. C'est important pour votre équipe médicale."
                )
              }
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${reminderMsg.includes("questionnaire") ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-blue-400"}`}
            >
              Rappel Questionnaire
            </button>
          </div>
          <textarea
            value={reminderMsg}
            onChange={(e) => setReminderMsg(e.target.value)}
            rows={3}
            className="mt-3 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-3 text-sm"
          />
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={channels.IN_APP}
                onChange={(e) =>
                  setChannels((c) => ({ ...c, IN_APP: e.target.checked }))
                }
              />
              Application
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={channels.EMAIL}
                onChange={(e) =>
                  setChannels((c) => ({ ...c, EMAIL: e.target.checked }))
                }
              />
              Email
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={channels.SMS}
                onChange={(e) =>
                  setChannels((c) => ({ ...c, SMS: e.target.checked }))
                }
              />
              SMS
            </label>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              disabled={sending}
              onClick={handleSendReminder}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {sending && (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
              )}
              Envoyer
            </button>
            {sendSuccess && (
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                Rappel envoyé avec succès !
              </span>
            )}
          </div>
          {sendError && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">
              {sendError}
            </p>
          )}
        </section>

        {/* Signalement */}
        <section className="mt-8 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            ⚠️ Signaler une entrée incomplète ou suspecte
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <select
              value={flagType}
              onChange={(e) => setFlagType(e.target.value as typeof flagType)}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-2 text-sm"
            >
              <option value="INCOMPLETE">Entrée incomplète</option>
              <option value="SUSPICIOUS">Valeur suspecte</option>
              <option value="OTHER">Autre</option>
            </select>
            <select
              value={flagVitalId}
              onChange={(e) => setFlagVitalId(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-2 text-sm"
            >
              <option value="">— Mesure vitale (optionnel) —</option>
              {vitalsWithCompleteness.map((v: any) => (
                <option key={v.id} value={v.id}>
                  {formatDateTime(v.recordedAt)} — compl. {v.completeness.score}
                  %
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={flagNote}
            onChange={(e) => setFlagNote(e.target.value)}
            placeholder="Note pour l'équipe soignante…"
            rows={2}
            className="mt-3 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-3 text-sm"
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              disabled={
                flagging ||
                !flagNote.trim() ||
                (flagType === "INCOMPLETE" &&
                  vitalsWithCompleteness.find((v: any) => v.id === flagVitalId)
                    ?.completeness?.score === 100)
              }
              onClick={handleFlag}
              className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700 disabled:opacity-50"
            >
              Enregistrer le signalement
            </button>
            {flagSuccess && (
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                Signalement enregistré avec succès !
              </span>
            )}
          </div>
          {flagError && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">
              {flagError}
            </p>
          )}
        </section>

        {/* Questionnaires */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Questionnaires récents
          </h2>
          <ul className="space-y-2">
            {patient.questionnaires?.length === 0 ? (
              <li className="text-sm text-gray-500">Aucun questionnaire.</li>
            ) : (
              patient.questionnaires.map((q: any) => (
                <li
                  key={q.id}
                  className="rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-3 flex justify-between gap-4"
                >
                  <span className="font-medium text-gray-900 dark:text-white">
                    {q.questionnaireType}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDateTime(q.completedAt)} · score{" "}
                    {q.overallScore != null ? q.overallScore : "—"}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
