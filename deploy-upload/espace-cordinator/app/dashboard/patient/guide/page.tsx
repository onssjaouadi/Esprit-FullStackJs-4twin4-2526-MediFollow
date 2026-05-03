"use client";

import {
  BookOpen,
  CheckCircle2,
  Heart,
  Thermometer,
  Loader2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  UserCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import { ensurePatientLinkedToCoordinatorForGuide } from "@/lib/actions/coordinator.actions";
import CoordinatorGuideVideoMaker from "@/components/CoordinatorGuideVideoMaker";
import PatientGuideChatbot from "@/components/PatientGuideChatbot";

export default function PatientGuidePage() {
  const router = useRouter();
  const [loadingUser, setLoadingUser] = useState(true);
  const [linkState, setLinkState] = useState<{
    coordinator?: { firstName: string; lastName: string; email: string | null };
    alreadyLinked?: boolean;
    error?: string;
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiScript, setAiScript] = useState<string | null>(null);
  const [videoPlan, setVideoPlan] = useState<{
    title: string;
    scenes: {
      title: string;
      voiceover: string;
      onScreen: string[];
      durationSec: number;
    }[];
  } | null>(null);
  const [sceneIdx, setSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [error, setError] = useState("");

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

  async function handleGenerateGuide() {
    try {
      setAiLoading(true);
      setError("");
      setAiScript(null);
      setVideoPlan(null);
      setSceneIdx(0);
      setIsPlaying(false);

      const res = await fetch("/api/coordinator/guide/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: "fr" }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(
          (data.detail ? `${data.error}\n${data.detail}` : data.error) ||
            "Erreur lors de la génération du guide."
        );
        return;
      }
      setAiScript(data.script as string);
      if (data.videoPlan?.scenes?.length) {
        setVideoPlan(data.videoPlan);
        setSceneIdx(0);
        setSecondsLeft(Number(data.videoPlan.scenes[0].durationSec || 15));
      }
    } catch {
      setError("Erreur réseau.");
    } finally {
      setAiLoading(false);
    }
  }

  const currentScene = useMemo(() => {
    if (!videoPlan?.scenes?.length) return null;
    return videoPlan.scenes[sceneIdx] ?? null;
  }, [videoPlan, sceneIdx]);

  useEffect(() => {
    if (!currentScene) return;
    setSecondsLeft(Number(currentScene.durationSec || 15));
  }, [currentScene]);

  useEffect(() => {
    if (!isPlaying || !videoPlan || !currentScene) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          const next = sceneIdx + 1;
          if (next >= videoPlan.scenes.length) {
            setIsPlaying(false);
            return 0;
          }
          setSceneIdx(next);
          return Number(videoPlan.scenes[next].durationSec || 15);
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [isPlaying, sceneIdx, videoPlan, currentScene]);

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
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <BookOpen className="size-10 text-red-600 shrink-0" />
          Votre guide de suivi
        </h1>
        <p className="mt-3 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          Comment remplir vos constantes et questionnaires dans MediFollow, étape par étape.
          Texte agrandi pour une lecture confortable.
        </p>

        {linkState?.coordinator && (
          <div className="mt-6 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/25 p-5 flex gap-3">
            <UserCircle className="size-10 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-200">
                Votre équipe de coordination
              </p>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                {linkState.coordinator.firstName} {linkState.coordinator.lastName}
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

        <div className="mt-8">
          <button
            type="button"
            onClick={handleGenerateGuide}
            disabled={aiLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-base font-bold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {aiLoading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <BookOpen className="size-5" />
            )}
            Générer un aide-mémoire personnalisé (IA)
          </button>
          {error && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap">
              {error}
            </p>
          )}
        </div>

        {aiScript && (
          <section className="mt-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 p-6 text-lg leading-relaxed whitespace-pre-wrap text-gray-900 dark:text-gray-100">
            {aiScript}
          </section>
        )}

        {videoPlan && currentScene && (
          <section className="mt-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Lecteur (scènes)
              </h3>
              <span className="text-sm font-semibold text-red-700 dark:text-red-300">
                Scène {sceneIdx + 1}/{videoPlan.scenes.length}
              </span>
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-red-50/30 dark:bg-red-950/20 p-5">
              <p className="text-lg font-bold text-red-900 dark:text-red-100">
                {currentScene.title}
              </p>
              <p className="mt-3 text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
                {currentScene.voiceover}
              </p>
              <ul className="mt-4 list-disc pl-6 text-lg text-gray-800 dark:text-gray-200 space-y-1">
                {currentScene.onScreen.map((line, i) => (
                  <li key={`${line}-${i}`}>{line}</li>
                ))}
              </ul>
            </div>

            <div className="mt-4 h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-full bg-red-600 transition-all"
                style={{
                  width: `${Math.max(
                    5,
                    ((sceneIdx + 1) / videoPlan.scenes.length) * 100
                  )}%`,
                }}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSceneIdx((i) => Math.max(0, i - 1))}
                className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <SkipBack className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-base font-semibold text-white hover:bg-red-700"
              >
                {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
                {isPlaying ? "Pause" : "Lecture auto"}
              </button>
              <button
                type="button"
                onClick={() =>
                  setSceneIdx((i) => Math.min(videoPlan.scenes.length - 1, i + 1))
                }
                className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <SkipForward className="size-4" />
              </button>
              <span className="text-sm text-gray-500">
                Temps restant : {secondsLeft}s
              </span>
            </div>
          </section>
        )}

        {videoPlan?.scenes?.length ? (
          <div className="mt-8">
            <CoordinatorGuideVideoMaker
              title={videoPlan.title || "Guide patient"}
              scenes={videoPlan.scenes}
            />
          </div>
        ) : null}

        <section className="mt-12 mb-8">
          <div className="mb-6 flex flex-col gap-2">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <UserCircle className="size-8 text-red-600" />
              Assistant Virtuel (IA)
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Posez-moi vos questions sur la prise de vos constantes et l'utilisation de MediFollow.
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
                  Renseignez la <strong>tension</strong> (deux chiffres) chaque jour, de préférence à la même heure.
                </span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="size-6 text-emerald-500 shrink-0 mt-1" />
                <span>
                  Ajoutez la <strong>fréquence cardiaque</strong>, la <strong>température</strong> et la{" "}
                  <strong>SpO₂</strong> si vous avez un oxymètre.
                </span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="size-6 text-emerald-500 shrink-0 mt-1" />
                <span>
                  Une courte <strong>note</strong> (symptômes, contexte) aide votre médecin et votre coordinateur.
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
              Indiquez tout nouveau symptôme ou une aggravation, avec un niveau de gravité honnête (léger / modéré / sévère).
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-2xl font-bold">Questionnaires</h2>
            <p className="mt-4 text-gray-800 dark:text-gray-200">
              Complétez les questionnaires aux dates indiquées : ils servent à suivre votre bien-être dans le temps.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
