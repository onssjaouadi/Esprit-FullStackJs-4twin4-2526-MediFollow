"use client";

import { useEffect, useState } from "react";
import { Loader2, Bot, FileWarning } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getUnifiedReviews, closeUnifiedReview, escalateCoordinatorAlert } from "@/lib/actions/coordinator.actions";
import { formatDateTime } from "@/lib/utils";

// Composant Interne pour afficher et gérer chaque carte de signalement.
function ReviewCard({ review, onUpdate }: { review: any, onUpdate: () => void }) {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchAnalysis = async () => {
      setAnalyzing(true);
      try {
        const res = await fetch("/api/coordinator/review-analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: review.title,
            note: review.note,
            vitalRecord: review.vitalRecord
          })
        });
        const data = await res.json();
        if (mounted && data.success) {
          setAiAnalysis(data.analysis);
        }
      } catch (err) {
        // Ignorer silencieusement pour le client
      } finally {
        if (mounted) setAnalyzing(false);
      }
    };
    fetchAnalysis();
    return () => { mounted = false; };
  }, [review]);

  const handleClose = async () => {
    setBusy(true);
    await closeUnifiedReview(review.id, review.sourceType);
    onUpdate();
    setBusy(false);
  };

  const handleEscalate = async () => {
     setBusy(true);
     if (review.sourceType === "ALERT") {
         await escalateCoordinatorAlert(review.id, "Escalade depuis Revues & signalements (Analyse IA)");
     }
     await handleClose(); // On clôture la révision après escalade
  };

  const isCritique = review.reviewType === "Critique";
  const borderCol = isCritique 
      ? "border-l-4 border-l-red-500 border-gray-200 dark:border-gray-800" 
      : review.reviewType === "Suspect" 
          ? "border-l-4 border-l-amber-500 border-gray-200 dark:border-gray-800"
          : "border-l-4 border-l-blue-500 border-gray-200 dark:border-gray-800";
  
  const priorityCol = review.priority === "haute" ? "text-red-500" : review.priority === "moyenne" ? "text-amber-500" : "text-blue-500";
  
  return (
    <div className={`bg-white dark:bg-[#1a1a1a] rounded-xl p-5 shadow-sm border ${borderCol} flex flex-col gap-3 relative`}>
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1 rounded-full text-xs font-bold text-gray-800 dark:text-gray-200">
           {review.reviewType}
        </div>
        
        <div>
            <div className="flex items-center gap-2">
                <Link href={`/dashboard/coordinator/patients/${review.patientId}`} className="font-bold text-lg text-gray-900 dark:text-white hover:underline">
                    {review.patientName}
                </Link>
                <span className="text-gray-500">•</span>
                <span className={`text-xs font-semibold ${priorityCol}`}>Priorité {review.priority}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
                {formatDateTime(review.createdAt)} • Protocole de suivi
            </p>
        </div>

        <div className="mt-1">
            <h4 className="text-[15px] font-semibold text-gray-900 dark:text-white">{review.title}</h4>
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1.5">
               {review.vitalRecord && <span>⏱ Mesure liée : {formatDateTime(review.vitalRecord.recordedAt)}</span>}
               <span>♡ {review.note}</span>
            </div>
        </div>

        {review.vitalRecord && (
            <div className="flex flex-wrap gap-2 mt-2">
               {review.vitalRecord.temperature && <span className="bg-gray-100 dark:bg-[#252525] text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold">Temp. {review.vitalRecord.temperature}°C</span>}
               {review.vitalRecord.heartRate && <span className="bg-gray-100 dark:bg-[#252525] text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">FC {review.vitalRecord.heartRate} bpm</span>}
               {review.vitalRecord.systolicBP && <span className="bg-gray-100 dark:bg-[#252525] text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">TA {review.vitalRecord.systolicBP}/{review.vitalRecord.diastolicBP}</span>}
               {review.vitalRecord.oxygenSaturation && <span className="bg-gray-100 dark:bg-[#252525] text-amber-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold">SpO₂ {review.vitalRecord.oxygenSaturation}%</span>}
            </div>
        )}

        <div className="mt-3 bg-gray-50 dark:bg-[#1f2922] border border-emerald-100 dark:border-emerald-900/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
                <Bot className="size-4 text-emerald-600 dark:text-emerald-500" />
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-500">Analyse IA</span>
            </div>
            {analyzing ? (
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300/70 text-sm">
                    <Loader2 className="size-4 animate-spin" /> Analyse des variables en cours...
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
                 disabled={busy}
                 className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                  Demander re-mesure
              </button>
            )}
            <button 
                disabled={busy}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
                Contacter le patient
            </button>
            <button 
                onClick={handleClose} 
                disabled={busy}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
                {busy ? "..." : "Clôturer"}
            </button>
        </div>
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
        <p className="font-semibold text-gray-600 dark:text-gray-400">Chargement de la console...</p>
      </div>
    );
  }

  const filteredReviews = reviews.filter(r => {
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
                <span className="text-3xl font-bold text-red-500">{stats?.critiques || 0}</span>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mt-2">Critiques</span>
            </div>
            <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 border-b-4 border-b-amber-500 flex flex-col justify-between">
                <span className="text-3xl font-bold text-amber-500">{stats?.suspects || 0}</span>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mt-2">Suspects</span>
            </div>
            <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 border-b-4 border-b-blue-500 flex flex-col justify-between">
                <span className="text-3xl font-bold text-blue-500">{stats?.incomplets || 0}</span>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mt-2">Incomplets</span>
            </div>
            <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 border-b-4 border-b-emerald-600 flex flex-col justify-between">
                <span className="text-3xl font-bold text-emerald-600">{stats?.closedToday || 0}</span>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mt-2">Clôturés aujourd'hui</span>
            </div>
        </div>

        {/* FILTERS & SORT */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
                {["Tous", "Critiques", "Suspects", "Incomplets"].map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${
                            filter === f 
                            ? "bg-gray-900 border-gray-900 text-white dark:bg-white dark:border-white dark:text-black" 
                            : "bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-500"
                        }`}
                    >
                        {f} {f === "Tous" ? `(${stats?.total})` : f === "Critiques" ? `(${stats?.critiques})` : f === "Suspects" ? `(${stats?.suspects})` : `(${stats?.incomplets})`}
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
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Aucun élément</h3>
                    <p className="text-gray-500 text-sm mt-1">Vous êtes à jour dans vos revues.</p>
                </div>
            ) : (
                filteredReviews.map(r => <ReviewCard key={r.id} review={r} onUpdate={load} />)
            )}
        </div>

      </div>
    </div>
  );
}
