"use client";

import {
  AlertTriangle,
  Loader2,
  Shield,
  Sparkles,
  CheckCircle2,
  Clock,
  User,
  Info
} from "lucide-react";
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
  ACKNOWLEDGED: "En cours (Acquittée)",
  RESOLVED: "Résolue",
  CLOSED: "Fermée",
};

export default function CoordinatorAlertsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Escalation state
  const [escNote, setEscNote] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = useState<Record<string, boolean>>({});
  const [aiMotifError, setAiMotifError] = useState<Record<string, string>>({});
  
  // Triage AI state
  const [aiTriageText, setAiTriageText] = useState("");
  const [aiTriageLoading, setAiTriageLoading] = useState(false);
  const [aiTriageResult, setAiTriageResult] = useState<any>(null);
  const [aiTriageError, setAiTriageError] = useState<string | null>(null);
  
  // Tabs
  const [activeTab, setActiveTab] = useState<"OPEN" | "ACKNOWLEDGED" | "HISTORY">("OPEN");

  async function load() {
    const alertsRes = await getCoordinatorAlerts();
    
    if (alertsRes.success && Array.isArray(alertsRes.alerts)) {
      setAlerts(alertsRes.alerts);
      setLoadError(null);
    } else {
      setAlerts([]);
      setLoadError(alertsRes.error ?? "Impossible de charger les alertes.");
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
        await load();
      } catch (err) {
        setLoadError("Une erreur inattendue s'est produite.");
      } finally {
        setLoading(false);
      }
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
        credentials: "include",
        body: JSON.stringify({ text: t }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAiTriageError((data.detail || data.error || "Erreur") as string);
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
    const targetAlert = alerts.find(a => a.id === id);
    const docId = targetAlert?.assignedDoctor?.id;
    await escalateCoordinatorAlert(id, note, docId);
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
          <Loader2 className="size-8 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">
          Chargement des alertes...
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-8 mt-8 mx-auto max-w-2xl rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-center text-red-700 dark:text-red-300">
        <AlertTriangle className="size-8 mx-auto mb-3" />
        <p className="font-medium">{loadError}</p>
      </div>
    );
  }

  const openAlerts = alerts.filter((a) => a.status === "OPEN");
  const ackAlerts = alerts.filter((a) => a.status === "ACKNOWLEDGED");
  const historyAlerts = alerts.filter((a) => a.status === "RESOLVED" || a.status === "CLOSED");

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800 dark:bg-red-900/50 dark:text-red-200 border border-red-200 dark:border-red-800/50">Critique</span>;
      case "HIGH":
        return <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-800 dark:bg-orange-900/50 dark:text-orange-200 border border-orange-200 dark:border-orange-800/50">Élevée</span>;
      case "MEDIUM":
        return <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800/50">Moyenne</span>;
      default:
        return <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 border border-blue-200 dark:border-blue-800/50">Basse</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#0a0a0a] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <AlertTriangle className="size-6" />
            </div>
            Suivi des Alertes Actives
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400 max-w-3xl">
            Surveillez les alertes non traitées, suivez les prises en charge par les médecins, et escaladez manuellement les situations critiques.
          </p>
        </div>

        {/* AI Triage Section */}
        <section className="rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10 p-5 sm:p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-sm font-bold tracking-wide text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <Sparkles className="size-4" />
                Assistant IA de Triage Clinique
              </h2>
              <p className="text-xs text-blue-600/80 dark:text-blue-400/80">
                Collez un résumé clinique ou des symptômes pour évaluer l'urgence (via BiomedBERT ou Mistral 7B).
              </p>
            </div>
          </div>
          
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <textarea
              value={aiTriageText}
              onChange={(e) => setAiTriageText(e.target.value)}
              rows={2}
              placeholder="Ex. Patient 72 ans, douleur thoracique, TA 170/95, SpO₂ 91%…"
              className="flex-1 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
            />
            <button
              type="button"
              disabled={aiTriageLoading || !aiTriageText.trim()}
              onClick={runAiTriage}
              className="inline-flex h-11 sm:h-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {aiTriageLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              Analyser
            </button>
          </div>
          
          {aiTriageError && (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertTriangle className="size-4" />
              {aiTriageError}
            </div>
          )}
          
          {aiTriageResult && (
            <div className="mt-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-white dark:bg-[#111] p-4 text-sm space-y-2 shadow-sm animate-in fade-in slide-in-from-top-2">
              {aiTriageResult.source && (
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100 dark:border-gray-800/60">
                  <span className="text-xs font-medium text-gray-500">Moteur d'analyse :</span>
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    {aiTriageResult.source === "biomed" ? "BiomedBERT (Spécialisé)" : "Mistral 7B (Général)"}
                  </span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="block text-xs font-medium text-gray-500 mb-1">Alerte Probable</span>
                  <span className={`font-semibold ${aiTriageResult.alerteProbable ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {aiTriageResult.alerteProbable ? "Oui, urgente" : "Non, normal"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500 mb-1">Niveau de Priorité</span>
                  <span className="font-semibold text-gray-900 dark:text-white capitalize">
                    {aiTriageResult.priorite}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500 mb-1">Indice de Confiance</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {typeof aiTriageResult.confiance === "number"
                      ? `${Math.round(aiTriageResult.confiance * 100)}%`
                      : "—"}
                  </span>
                </div>
              </div>
              {aiTriageResult.labelBrut && (
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800/60">
                  <span className="text-xs text-gray-500">Détail brut : {aiTriageResult.labelBrut}</span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Workflow Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab("OPEN")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
              activeTab === "OPEN"
                ? "border-red-600 text-red-600 dark:border-red-500 dark:text-red-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <AlertTriangle className="size-4" />
            Non traitées
            <span className={`ml-1 rounded-full px-2 py-0.5 text-xs ${activeTab === "OPEN" ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
              {openAlerts.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("ACKNOWLEDGED")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
              activeTab === "ACKNOWLEDGED"
                ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Clock className="size-4" />
            En cours (Médecins)
            <span className={`ml-1 rounded-full px-2 py-0.5 text-xs ${activeTab === "ACKNOWLEDGED" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
              {ackAlerts.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("HISTORY")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
              activeTab === "HISTORY"
                ? "border-gray-900 text-gray-900 dark:border-gray-100 dark:text-white"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <CheckCircle2 className="size-4" />
            Historique
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          
          {/* TAB: OPEN */}
          {activeTab === "OPEN" && (
            <>
              {openAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 dark:border-gray-800 py-16 text-center bg-white dark:bg-[#111]">
                  <div className="flex size-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/20">
                    <CheckCircle2 className="size-6 text-emerald-500" />
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-gray-900 dark:text-white">Tout est sous contrôle</h3>
                  <p className="mt-1 text-sm text-gray-500">Aucune alerte en attente de traitement.</p>
                </div>
              ) : (
                openAlerts.map((a) => (
                  <div
                    key={a.id}
                    className="group rounded-2xl border border-red-200 dark:border-red-900/40 bg-white dark:bg-[#111] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {getSeverityBadge(a.severity)}
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                            {a.alertType}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="size-3" />
                            {formatDateTime(a.createdAt)}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                          {a.patient?.user?.firstName || "Patient inconnu"} {a.patient?.user?.lastName || ""}
                        </h3>
                        <div className="rounded-xl bg-red-50/50 dark:bg-red-950/20 p-3 border border-red-100 dark:border-red-900/30">
                          <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                            {a.message}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Escalation Action Area */}
                    <div className="border-t border-gray-100 dark:border-gray-800/60 bg-gray-50/50 dark:bg-gray-900/20 px-5 py-4 sm:px-6">
                      <p className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                        <Shield className="size-3.5" />
                        Action Requise : Escalader l'alerte au médecin
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        {a.assignedDoctor ? (
                          <div className="flex items-center gap-2 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-900/20 px-3 py-2.5 text-sm font-medium text-blue-700 dark:text-blue-300 whitespace-nowrap">
                            <User className="size-4" />
                            Dr. {a.assignedDoctor.firstName} {a.assignedDoctor.lastName}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-900/20 px-3 py-2.5 text-sm font-medium text-red-700 dark:text-red-300 whitespace-nowrap">
                            <AlertTriangle className="size-4" />
                            Aucun médecin assigné
                          </div>
                        )}
                        <input
                          value={escNote[a.id] ?? ""}
                          onChange={(e) =>
                            setEscNote((s) => ({ ...s, [a.id]: e.target.value }))
                          }
                          placeholder="Saisissez le motif de l'escalade..."
                          className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111] px-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={aiGenerating[a.id]}
                            onClick={() => generateMotif(a.id)}
                            title="Générer un motif structuré avec l'IA"
                            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111] px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors shadow-sm whitespace-nowrap"
                          >
                            {aiGenerating[a.id] ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Sparkles className="size-4" />
                            )}
                            <span className="hidden sm:inline">IA Auto</span>
                          </button>
                          <button
                            type="button"
                            disabled={busy === a.id || !(escNote[a.id] || "").trim() || !a.assignedDoctor}
                            onClick={() => escalate(a.id)}
                            className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600 transition-colors shadow-sm whitespace-nowrap"
                          >
                            {busy === a.id ? <Loader2 className="size-4 animate-spin" /> : <Shield className="size-4" />}
                            Escalader
                          </button>
                        </div>
                      </div>
                      {aiMotifError[a.id] && (
                        <p className="mt-2 text-xs font-medium text-red-600 flex items-center gap-1.5">
                          <Info className="size-3" />
                          {aiMotifError[a.id]}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* TAB: ACKNOWLEDGED */}
          {activeTab === "ACKNOWLEDGED" && (
            <>
              {ackAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 dark:border-gray-800 py-16 text-center bg-white dark:bg-[#111]">
                  <div className="flex size-14 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                    <Clock className="size-6 text-blue-500" />
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-gray-900 dark:text-white">Aucune alerte en cours</h3>
                  <p className="mt-1 text-sm text-gray-500">Toutes les alertes sont soit traitées, soit en attente.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {ackAlerts.map((a) => (
                    <div
                      key={a.id}
                      className="rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-white dark:bg-[#111] p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-3">
                        {getSeverityBadge(a.severity)}
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                          En cours
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white truncate">
                        {a.patient?.user?.firstName || "Patient"} {a.patient?.user?.lastName || ""}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Créée le {formatDateTime(a.createdAt)}
                      </p>
                      <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                        {a.message}
                      </p>
                      {a.acknowledgedBy && (
                        <div className="mt-4 flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                          <div className="flex size-6 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                            <User className="size-3 text-gray-500" />
                          </div>
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Prise en charge par <span className="font-bold">{a.acknowledgedBy.firstName} {a.acknowledgedBy.lastName}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* TAB: HISTORY */}
          {activeTab === "HISTORY" && (
            <>
              {historyAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 dark:border-gray-800 py-16 text-center bg-white dark:bg-[#111]">
                  <div className="flex size-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900">
                    <History className="size-6 text-gray-500" />
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-gray-900 dark:text-white">Historique vide</h3>
                  <p className="mt-1 text-sm text-gray-500">Aucune alerte résolue pour le moment.</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] overflow-hidden">
                  <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
                    {historyAlerts.map((a) => (
                      <div key={a.id} className="p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                a.status === "RESOLVED" 
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" 
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                              }`}>
                                {statusLabel[a.status] || a.status}
                              </span>
                              <span className="text-xs text-gray-500 font-medium">
                                {formatDateTime(a.createdAt)}
                              </span>
                            </div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {a.patient?.user?.firstName || "Patient"} {a.patient?.user?.lastName || ""}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                              {a.message}
                            </p>
                          </div>
                          
                          {/* Resolution info */}
                          {a.resolvedBy && (
                            <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-1 text-xs">
                              <span className="text-gray-500">Résolue par</span>
                              <span className="font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                                {a.resolvedBy.firstName} {a.resolvedBy.lastName}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
