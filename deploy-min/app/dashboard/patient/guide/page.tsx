"use client";

import {
  CheckCircle2,
  Heart,
  Thermometer,
  Loader2,
  UserCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import { ensurePatientLinkedToCoordinatorForGuide } from "@/lib/actions/coordinator.actions";
import PatientGuideChatbot from "@/components/PatientGuideChatbot";

export default function PatientGuidePage() {
  const router = useRouter();
  const [loadingUser, setLoadingUser] = useState(true);
  const [linkState, setLinkState] = useState<{
    coordinator?: { firstName: string; lastName: string; email: string | null };
    alreadyLinked?: boolean;
    error?: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (!user || user.role !== "PATIENT") {
        router.push("/login");
        return;
      }
      const res = await ensurePatientLinkedToCoordinatorForGuide();
      if (res.success) {
        setLinkState({
          coordinator: res.coordinator,
          alreadyLinked: res.alreadyLinked,
        });
      } else {
        setLinkState({ error: res.error });
      }
      setLoadingUser(false);
    })();
  }, [router]);

  if (loadingUser) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
          Votre guide de suivi
        </h1>
        <p className="mt-3 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          Comment remplir vos constantes et questionnaires dans MediFollow,
          étape par étape. Texte agrandi pour une lecture confortable.
        </p>

        {linkState?.coordinator && (
          <div className="mt-6 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/25 p-5 flex gap-3">
            <UserCircle className="size-10 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-200">
                Votre équipe de coordination
              </p>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                {linkState.coordinator.firstName}{" "}
                {linkState.coordinator.lastName}
              </p>
              {linkState.coordinator.email && (
                <p className="text-base text-gray-600 dark:text-gray-400 mt-1">
                  {linkState.coordinator.email}
                </p>
              )}
              <p className="text-sm text-emerald-800/90 dark:text-emerald-200/90 mt-2">
                {linkState.alreadyLinked
                  ? "Vous étiez déjà suivi par ce coordinateur."
                  : "Vous êtes maintenant relié(e) à votre coordinateur pour le suivi post-hospitalisation."}
              </p>
            </div>
          </div>
        )}

        {linkState?.error && (
          <div className="mt-6 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 p-4 text-amber-900 dark:text-amber-100 text-base">
            {linkState.error}
          </div>
        )}

        <section className="mt-12 mb-8">
          <div className="mb-6 flex flex-col gap-2">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <UserCircle className="size-8 text-red-600" />
              Assistant Virtuel (IA)
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Posez-moi vos questions sur la prise de vos constantes et
              l'utilisation de MediFollow.
            </p>
          </div>
          <PatientGuideChatbot />
        </section>

        <section className="mt-12 space-y-8 text-lg leading-relaxed text-gray-900 dark:text-gray-100">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Heart className="size-7 text-red-600 shrink-0" />
              Constantes vitales
            </h2>
            <ul className="mt-4 space-y-4">
              <li className="flex gap-3">
                <CheckCircle2 className="size-6 text-emerald-500 shrink-0 mt-1" />
                <span>
                  Renseignez la <strong>tension</strong> (deux chiffres) chaque
                  jour, de préférence à la même heure.
                </span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="size-6 text-emerald-500 shrink-0 mt-1" />
                <span>
                  Ajoutez la <strong>fréquence cardiaque</strong>, la{" "}
                  <strong>température</strong> et la <strong>SpO₂</strong> si
                  vous avez un oxymètre.
                </span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="size-6 text-emerald-500 shrink-0 mt-1" />
                <span>
                  Une courte <strong>note</strong> (symptômes, contexte) aide
                  votre médecin et votre coordinateur.
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Thermometer className="size-7 text-amber-600 shrink-0" />
              Symptômes
            </h2>
            <p className="mt-4 text-gray-800 dark:text-gray-200">
              Indiquez tout nouveau symptôme ou une aggravation, avec un niveau
              de gravité honnête (léger / modéré / sévère).
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-2xl font-bold">Questionnaires</h2>
            <p className="mt-4 text-gray-800 dark:text-gray-200">
              Complétez les questionnaires aux dates indiquées : ils servent à
              suivre votre bien-être dans le temps.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
