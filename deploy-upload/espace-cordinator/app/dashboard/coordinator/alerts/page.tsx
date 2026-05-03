"use client";

import { AlertTriangle, Loader2, Shield, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import {
  getCoordinatorAlerts,
  escalateCoordinatorAlert,
  generateEscalationMotif,
} from "@/lib/actions/coordinator.actions";
import { formatDateTime } from "@/lib/utils";

const statusLabel: Record<string, string> = {
  OPEN: "Ouverte",
  ACKNOWLEDGED: "Acquittée",
  RESOLVED: "Résolue",
  CLOSED: "Fermée",
};

export default function CoordinatorAlertsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [escNote, setEscNote] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = useState<Record<string, boolean>>({});
  const [aiMotifError, setAiMotifError] = useState<Record<string, string>>({});
  const [aiTriageText, setAiTriageText] = useState("");
  const [aiTriageLoading, setAiTriageLoading] = useState(false);
  const [aiTriageResult, setAiTriageResult] = useState<any>(null);
  const [aiTriageError, setAiTriageError] = useState<string | null>(null);

  async function load() {
    const res = await getCoordinatorAlerts();
    if (res.success && Array.isArray(res.alerts)) {
      setAlerts(res.alerts);
      setLoadError(null);
    } else {
      setAlerts([]);
      setLoadError(res.error ?? "Impossible de charger les alertes.");
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

  async function runAiTriage() {
    const t = aiTriageText.trim();
    if (!t) return;
    setAiTriageLoading(true);
    setAiTriageError(null);
    setAiTriageResult(null);
    try {
      const res = await fetch("/api/coordinator/ai/alert-triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: t }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAiTriageError(
          (data.detail || data.error || "Erreur") as string
        );
        return;
      }
      setAiTriageResult(data.triage);
    } catch (e: any) {
      setAiTriageError(String(e?.message ?? e));
    } finally {
      setAiTriageLoading(false);
    }
  }

  async function escalate(id: string) {
    const note = (escNote[id] || "").trim();
    if (!note) return;
    setBusy(id);
    await escalateCoordinatorAlert(id, note);
    setEscNote((s) => ({ ...s, [id]: "" }));
    await load();
    setBusy(null);
  }

  async function generateMotif(id: string) {
    setAiGenerating((s) => ({ ...s, [id]: true }));
    setAiMotifError((s) => ({ ...s, [id]: "" }));
    try {
      const res = await generateEscalationMotif(id);
      if (res.success && res.motif) {
        setEscNote((s) => ({ ...s, [id]: res.motif }));
        setAiMotifError((s) => ({ ...s, [id]: "" }));
      } else {
        const errMsg = res.error || "Erreur inconnue lors de la génération";
        setAiMotifError((s) => ({ ...s, [id]: errMsg }));
      }
    } catch (error: any) {
      const errMsg = error?.message || "Erreur lors de l'appel API";
      setAiMotifError((s) => ({ ...s, [id]: errMsg }));
    } finally {
      setAiGenerating((s) => ({ ...s, [id]: false }));
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-8 text-center text-red-700 dark:text-red-300">
        {loadError}
      </div>
    );
  }

  const open = alerts.filter((a) => a.status === "OPEN");
  const other = alerts.filter((a) => a.status !== "OPEN");

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="size-7 text-blue-600" />
          Alertes — patients assignés
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Suivez les alertes actives et l&apos;acquittement par les médecins.
          Vous pouvez escalader une alerte non traitée.
        </p>

        <section className="mt-8 rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/20 p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-blue-600 flex items-center gap-2">
            <Sparkles className="size-4" />
            Triage automatique (IA)
          </h2>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Collez un résumé clinique ou des symptômes. Le serveur tente d’abord le modèle
            BiomedBERT si compatible ; sinon le triage est fait par Mistral 7B (JSON).
          </p>
          <textarea
            value={aiTriageText}
            onChange={(e) => setAiTriageText(e.target.value)}
            rows={3}
            placeholder="Ex. Patient 72 ans, douleur thoracique, TA 170/95, SpO₂ 91%…"
            className="mt-3 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-3 text-sm"
          />
          <button
            type="button"
            disabled={aiTriageLoading || !aiTriageText.trim()}
            onClick={runAiTriage}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {aiTriageLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Analyser
          </button>
          {aiTriageError && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">{aiTriageError}</p>
          )}
          {aiTriageResult && (
            <div className="mt-4 rounded-xl border border-blue-200/80 dark:border-blue-900/50 bg-white/80 dark:bg-gray-950/80 p-4 text-sm space-y-1">
              {aiTriageResult.source && (
                <p className="text-xs text-gray-500 mb-2">
                  Moteur :{" "}
                  <span className="font-semibold text-blue-700 dark:text-blue-300">
                    {aiTriageResult.source === "biomed" ? "BiomedBERT" : "Mistral 7B"}
                  </span>
                </p>
              )}
              <p>
                <span className="font-semibold text-gray-900 dark:text-white">Alerte probable :</span>{" "}
                {aiTriageResult.alerteProbable ? "oui" : "non"}
              </p>
              <p>
                <span className="font-semibold text-gray-900 dark:text-white">Priorité :</span>{" "}
                {aiTriageResult.priorite}
              </p>
              <p>
                <span className="font-semibold text-gray-900 dark:text-white">Confiance :</span>{" "}
                {typeof aiTriageResult.confiance === "number"
                  ? `${Math.round(aiTriageResult.confiance * 100)}%`
                  : "—"}
              </p>
              {aiTriageResult.labelBrut && (
                <p className="text-xs text-gray-500">{aiTriageResult.labelBrut}</p>
              )}
            </div>
          )}
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-blue-600">
            Ouvertes ({open.length})
          </h2>
          {open.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune alerte ouverte.</p>
          ) : (
            open.map((a) => (
              <div
                key={a.id}
                className="rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/20 p-5"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {a.patient?.user?.firstName || "Patient inconnu"} {a.patient?.user?.lastName || ""}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(a.createdAt)} · {a.alertType} ·{" "}
                      {a.severity}
                    </p>
                    <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">
                      {a.message}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 w-fit">
                    {statusLabel[a.status] ?? a.status}
                  </span>
                </div>
                <div className="mt-4 border-t border-blue-200/50 dark:border-blue-900/30 pt-4">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                    <Shield className="size-3" />
                    Escalade (nouvelle alerte système)
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      value={escNote[a.id] ?? ""}
                      onChange={(e) =>
                        setEscNote((s) => ({ ...s, [a.id]: e.target.value }))
                      }
                      placeholder="Motif d'escalade…"
                      className="flex-1 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      disabled={aiGenerating[a.id]}
                      onClick={() => generateMotif(a.id)}
                      title="Générer automatiquement avec l'IA"
                      className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50"
                    >
                      {aiGenerating[a.id] ? (
                        <Loader2 className="size-4 animate-spin inline" />
                      ) : (
                        <Sparkles className="size-4 inline" />
                      )}
                      {aiGenerating[a.id] ? " …" : " Auto"}
                    </button>
                    <button
                      type="button"
                      disabled={busy === a.id || !(escNote[a.id] || "").trim()}
                      onClick={() => escalate(a.id)}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {busy === a.id ? "…" : "Escalader"}
                    </button>
                  </div>
                  {aiMotifError[a.id] && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      ⚠️ {aiMotifError[a.id]}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </section>

        <section className="mt-12 space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
            Historique ({other.length})
          </h2>
          {other.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-sm"
            >
              <div className="flex justify-between gap-4">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {a.patient.user.firstName} {a.patient.user.lastName}
                </span>
                <span className="text-xs text-gray-500">
                  {statusLabel[a.status]}
                </span>
              </div>
              <p className="mt-1 text-gray-600 dark:text-gray-400 line-clamp-2">
                {a.message}
              </p>
              {a.acknowledgedBy && (
                <p className="mt-2 text-xs text-gray-500">
                  Acquittée par {a.acknowledgedBy.firstName}{" "}
                  {a.acknowledgedBy.lastName} ({a.acknowledgedBy.role})
                </p>
              )}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
