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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { getCurrentUser } from "@/lib/actions/auth.actions";
import CoordinatorGuideVideoMaker from "@/components/CoordinatorGuideVideoMaker";

export default function CoordinatorGuidePage() {
  const router = useRouter();
  const [loadingUser, setLoadingUser] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiScript, setAiScript] = useState<string | null>(null);
  const [videoPlan, setVideoPlan] = useState<{
    title: string;
    scenes: { title: string; voiceover: string; onScreen: string[]; durationSec: number }[];
  } | null>(null);
  const [sceneIdx, setSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (!user || user.role !== "COORDINATOR") {
        router.push("/login");
      } else {
        setLoadingUser(false);
      }
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
        body: JSON.stringify({
          language: "fr",
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(
          (data.detail ? `${data.error}\n${data.detail}` : data.error) ||
            "Erreur lors de la génération du guide IA. Vérifie la configuration Hugging Face côté serveur."
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
      setError("Erreur réseau lors de l’appel au guide IA.");
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
        <Loader2 className="size-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6 lg:p-8">
      <div className="mx-auto max-w-3xl prose prose-gray dark:prose-invert">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2 not-prose">
          <BookOpen className="size-8 text-blue-600" />
          Guide pour les patients
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 not-prose mt-2">
          Contenu d&apos;aide à partager : comment remplir correctement le
          protocole de suivi post-hospitalisation dans MediFollow.
        </p>

        {/* Bouton de génération IA */}
        <div className="not-prose mt-6 mb-6">
          <button
            type="button"
            onClick={handleGenerateGuide}
            disabled={aiLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {aiLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <BookOpen className="size-4" />
            )}
            Générer un guide vidéo personnalisé (IA)
          </button>
          {error && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>

        {aiScript && (
          <section className="not-prose mt-4 rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 p-5 text-sm whitespace-pre-wrap">
            {aiScript}
          </section>
        )}

        {videoPlan && currentScene && (
          <section className="not-prose mt-6 rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-white dark:bg-gray-950 p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Lecteur guide vidéo (simulation)
              </h3>
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                Scène {sceneIdx + 1}/{videoPlan.scenes.length}
              </span>
            </div>

            <div className="mt-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-blue-50/40 dark:bg-blue-950/20 p-4">
              <p className="text-sm font-bold text-blue-800 dark:text-blue-200">
                {currentScene.title}
              </p>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {currentScene.voiceover}
              </p>
              <ul className="mt-3 list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
                {currentScene.onScreen.map((line, i) => (
                  <li key={`${line}-${i}`}>{line}</li>
                ))}
              </ul>
            </div>

            <div className="mt-4 h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{
                  width: `${Math.max(
                    5,
                    ((sceneIdx + 1) / videoPlan.scenes.length) * 100
                  )}%`,
                }}
              />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSceneIdx((i) => Math.max(0, i - 1))}
                className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <SkipBack className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
                {isPlaying ? "Pause" : "Lecture auto"}
              </button>
              <button
                type="button"
                onClick={() =>
                  setSceneIdx((i) => Math.min(videoPlan.scenes.length - 1, i + 1))
                }
                className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <SkipForward className="size-4" />
              </button>
              <span className="ml-2 text-xs text-gray-500">
                Temps restant scène: {secondsLeft}s
              </span>
            </div>
          </section>
        )}

        {videoPlan?.scenes?.length ? (
          <CoordinatorGuideVideoMaker
            title={videoPlan.title || "Guide patient"}
            scenes={videoPlan.scenes}
          />
        ) : null}

        <section className="mt-8 not-prose space-y-6">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="font-bold text-lg flex items-center gap-2 text-gray-900 dark:text-white">
              <Heart className="size-5 text-blue-600" />
              Constantes vitales quotidiennes
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex gap-2">
                <CheckCircle2 className="size-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                Renseigner la <strong>tension</strong> (systolique et
                diastolique) au même moment chaque jour si possible.
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="size-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                Ajouter la <strong>fréquence cardiaque</strong>, la{" "}
                <strong>température</strong> et la <strong>SpO₂</strong> (si
                vous disposez d&apos;un oxymètre).
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="size-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                Une courte <strong>note</strong> aide le médecin (symptômes,
                contexte).
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="font-bold text-lg flex items-center gap-2 text-gray-900 dark:text-white">
              <Thermometer className="size-5 text-amber-600" />
              Symptômes
            </h2>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Les patients doivent déclarer tout nouveau symptôme ou
              l&apos;aggravation d&apos;un symptôme connu, avec un niveau de
              gravité honnête (léger / modéré / sévère).
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">
              Questionnaires
            </h2>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Compléter les questionnaires hebdomadaires ou selon la date
              indiquée : ils permettent de calculer un score global de
              bien-être et de détecter une dérive précoce.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

