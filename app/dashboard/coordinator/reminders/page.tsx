"use client";

import {
  History,
  Loader2,
  ArrowLeft,
  CheckCheck,
  Check,
  Clock,
  BellRing,
  Mail,
  MessageSquare,
  Smartphone
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getCoordinatorReminderHistory } from "@/lib/actions/coordinator.actions";
import { formatDateTime } from "@/lib/utils";

// Helper to render the appropriate icon for a channel
const ChannelIcon = ({ channel }: { channel: string }) => {
  switch (channel.toUpperCase()) {
    case "EMAIL":
      return <Mail className="size-3.5" />;
    case "SMS":
      return <Smartphone className="size-3.5" />;
    case "IN_APP":
    case "PUSH":
      return <BellRing className="size-3.5" />;
    default:
      return <MessageSquare className="size-3.5" />;
  }
};

export default function CoordinatorRemindersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const user = await getCurrentUser();
        if (!user || user.role !== "COORDINATOR") {
          router.push("/login");
          return;
        }
        const res = await getCoordinatorReminderHistory(80);
        if (res.success && res.reminders) {
          setReminders(res.reminders);
        } else {
          setError(res.error || "Impossible de charger les rappels.");
        }
      } catch (err) {
        setError("Une erreur inattendue s'est produite.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
          <Loader2 className="size-8 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">
          Chargement de l'historique...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#0a0a0a] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <Link
              href="/dashboard/coordinator/patients"
              className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 mb-4"
            >
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
              Retour aux patients
            </Link>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <History className="size-6" />
              </div>
              Historique des rappels
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
              Consultez l'ensemble des rappels envoyés manuellement aux patients, ainsi que leur statut de lecture.
            </p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 p-4 flex items-start gap-3">
            <div className="mt-0.5 text-red-600 dark:text-red-400">
              <span className="sr-only">Erreur</span>
              <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Reminders List */}
        <div className="space-y-4">
          {reminders.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 dark:border-gray-800 py-16 text-center bg-white dark:bg-[#111]">
              <div className="flex size-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900">
                <BellRing className="size-6 text-gray-400" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">Aucun rappel</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Vous n'avez envoyé aucun rappel pour le moment.
              </p>
            </div>
          ) : (
            reminders.map((r) => {
              const isOrphan = !r.patient;
              const patientName = r.patient?.user
                ? `${r.patient.user.firstName || ""} ${r.patient.user.lastName || ""}`.trim()
                : "Patient inconnu";
              const isRead = r.isRead;
              const channels = r.channels || [];

              return (
                <div
                  key={r.id}
                  className={`group relative overflow-hidden rounded-2xl border transition-all hover:shadow-md ${
                    isOrphan
                      ? "border-amber-200 bg-amber-50/30 hover:border-amber-300 dark:border-amber-900/30 dark:bg-amber-950/10 dark:hover:border-amber-900/50"
                      : "border-gray-200 bg-white hover:border-blue-300 dark:border-gray-800 dark:bg-[#111] dark:hover:border-blue-800/50"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-5 sm:p-6">
                    {/* Left: Patient Info & Message */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`flex size-10 shrink-0 items-center justify-center rounded-full font-bold shadow-sm ${
                        isOrphan 
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" 
                          : "bg-gradient-to-br from-blue-100 to-indigo-50 text-blue-700 dark:from-blue-900/40 dark:to-indigo-900/20 dark:text-blue-300"
                      }`}>
                        {isOrphan ? "?" : patientName.charAt(0).toUpperCase()}
                      </div>
                      
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold text-base ${isOrphan ? "text-amber-800 dark:text-amber-300" : "text-gray-900 dark:text-white"}`}>
                            {isOrphan ? "[Données orphelines]" : patientName}
                          </h3>
                          {isOrphan && (
                            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-400">
                              Patient supprimé
                            </span>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
                          {r.message || "(Aucun message)"}
                        </p>
                      </div>
                    </div>

                    {/* Right: Meta Info (Date, Channels, Status) */}
                    <div className="flex flex-col items-start sm:items-end gap-3 min-w-[140px] pl-14 sm:pl-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800/60 pt-3 sm:pt-0">
                      
                      {/* Date */}
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                        <Clock className="size-3.5" />
                        {r.createdAt ? formatDateTime(r.createdAt) : "Date inconnue"}
                      </div>
                      
                      {/* Channels */}
                      {channels.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {channels.map((channel: string) => (
                            <span 
                              key={channel} 
                              className="inline-flex items-center gap-1 rounded-md bg-gray-100 dark:bg-gray-800 px-2 py-1 text-[11px] font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider"
                            >
                              <ChannelIcon channel={channel} />
                              {channel}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Read Status */}
                      {!isOrphan && (
                        <div className="mt-1 flex items-center gap-1.5">
                          {isRead ? (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                              <CheckCheck className="size-4" />
                              Lu {r.readAt && <span className="font-normal opacity-80 ml-1">({new Date(r.readAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})</span>}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-gray-500">
                              <Check className="size-4" />
                              Non lu
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
