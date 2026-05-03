"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Zap,
  UserCircle,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import {
  getDoctorPatientsList,
  getPatientMedicalContext,
} from "@/lib/actions/medassist.actions";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface PatientOption {
  id: string;
  nom: string;
  numeroDossier: string;
  alertesActives: number;
}

type VoiceState = "idle" | "listening" | "thinking" | "speaking";

export default function JarvisVoiceModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [lastResponse, setLastResponse] = useState("");
  const [history, setHistory] = useState<Message[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patientContext, setPatientContext] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [autoListen, setAutoListen] = useState(false);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load patients when modal opens
  useEffect(() => {
    if (open && patients.length === 0) {
      getDoctorPatientsList()
        .then((r) => r.success && r.patients && setPatients(r.patients))
        .catch(console.error);
    }
    if (!open) {
      stopAll();
    }
  }, [open]);

  // Setup Speech Recognition
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.lang = "fr-FR";
    rec.continuous = false;
    rec.interimResults = true;

    rec.onresult = (e: any) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      setTranscript(final || interim);
      if (final) {
        rec.stop();
        handleQuery(final);
      }
    };

    rec.onerror = () => {
      setVoiceState("idle");
      setTranscript("");
    };

    rec.onend = () => {
      if (voiceState === "listening") setVoiceState("idle");
    };

    recognitionRef.current = rec;
  }, []);

  const stopAll = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setVoiceState("idle");
    setTranscript("");
  };

  const startListening = () => {
    if (!recognitionRef.current) return;
    stopAll();
    setTranscript("");
    setVoiceState("listening");
    try {
      recognitionRef.current.start();
    } catch (_) {}
  };

  const handleQuery = async (text: string) => {
    setVoiceState("thinking");
    setTranscript(text);

    const userMsg: Message = { role: "user", content: text };
    const newHistory = [...history, userMsg];
    setHistory(newHistory);

    try {
      const res = await fetch("/api/jarvis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory,
          patientContext,
        }),
      });

      const data = await res.json();
      const reply: string = data.message || "Je n'ai pas de réponse.";

      setHistory((prev) => [...prev, { role: "assistant", content: reply }]);
      setLastResponse(reply);
      setTranscript("");
      speakReply(reply);
    } catch {
      setVoiceState("idle");
    }
  };

  const speakReply = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = 0.92;
    utterance.pitch = 1.05;

    utterance.onstart = () => setVoiceState("speaking");
    utterance.onend = () => {
      setVoiceState("idle");
      if (autoListen) {
        setTimeout(startListening, 600);
      }
    };
    utterance.onerror = () => setVoiceState("idle");

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePatientSelect = async (id: string) => {
    setShowDropdown(false);
    setSelectedPatient(id);
    try {
      const r = await getPatientMedicalContext(id);
      if (r.success && r.context) {
        setPatientContext(r.context);
        const name = r.context.patient.nom;
        const msg = `Contexte médical chargé pour ${name}. Je suis prêt à vous assister.`;
        setLastResponse(msg);
        setHistory([{ role: "assistant", content: msg }]);
        speakReply(msg);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClose = () => {
    stopAll();
    setHistory([]);
    setLastResponse("");
    setTranscript("");
    setSelectedPatient(null);
    setPatientContext(null);
    onClose();
  };

  const selectedPatientData = patients.find((p) => p.id === selectedPatient);

  if (!open) return null;

  const orbClass = {
    idle: "shadow-[0_0_40px_10px_rgba(234,179,8,0.3)]",
    listening: "shadow-[0_0_60px_20px_rgba(239,68,68,0.6)] scale-110",
    thinking: "shadow-[0_0_60px_20px_rgba(59,130,246,0.6)] animate-spin-slow",
    speaking: "shadow-[0_0_70px_25px_rgba(34,197,94,0.6)] scale-105",
  }[voiceState];

  const orbInner = {
    idle: "from-yellow-500 via-yellow-600 to-amber-700",
    listening: "from-red-500 via-rose-500 to-red-600",
    thinking: "from-blue-500 via-indigo-500 to-blue-600",
    speaking: "from-green-500 via-emerald-500 to-green-600",
  }[voiceState];

  const stateLabel = {
    idle: "En attente",
    listening: "J'écoute...",
    thinking: "Je réfléchis...",
    speaking: "Je parle...",
  }[voiceState];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg mx-4 rounded-3xl bg-gray-950 border border-gray-800 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-9 rounded-xl bg-yellow-500/20">
              <Zap className="size-5 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-none">
                Jarvis
              </h2>
              <p className="text-xs text-gray-400">
                Assistant vocal IA — Jarvis-3B
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Auto-listen toggle */}
            <button
              onClick={() => setAutoListen((v) => !v)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${
                autoListen
                  ? "bg-green-500/20 text-green-400 border border-green-500/40"
                  : "bg-gray-800 text-gray-400 border border-gray-700"
              }`}
              title="Écoute automatique après réponse"
            >
              <Mic size={12} />
              Auto
            </button>
            <button
              onClick={handleClose}
              className="rounded-xl p-2 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
              aria-label="Fermer Jarvis"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Patient selector */}
        <div className="px-6 pt-4 relative">
          <button
            onClick={() => setShowDropdown((v) => !v)}
            className="w-full flex items-center justify-between bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white hover:border-yellow-500/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <UserCircle size={16} className="text-gray-400" />
              <span>
                {selectedPatientData
                  ? selectedPatientData.nom
                  : "Sélectionner un patient (optionnel)"}
              </span>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {showDropdown && (
            <div className="absolute left-6 right-6 top-full mt-1 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-h-52 overflow-y-auto z-10">
              {patients.length === 0 ? (
                <p className="p-4 text-sm text-gray-500 text-center">
                  Aucun patient
                </p>
              ) : (
                patients.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handlePatientSelect(p.id)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800 text-left transition-colors border-b border-gray-800 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{p.nom}</p>
                      <p className="text-xs text-gray-400">{p.numeroDossier}</p>
                    </div>
                    {p.alertesActives > 0 && (
                      <span className="flex items-center gap-1 text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                        <AlertCircle size={11} />
                        {p.alertesActives}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Orb area */}
        <div className="flex flex-col items-center justify-center py-10 px-6 gap-6">
          {/* Animated orb */}
          <button
            onClick={voiceState === "idle" ? startListening : stopAll}
            disabled={voiceState === "thinking"}
            className={`relative size-36 rounded-full bg-gradient-to-br ${orbInner} transition-all duration-500 ${orbClass} flex items-center justify-center cursor-pointer disabled:cursor-wait`}
            aria-label={voiceState === "idle" ? "Parler à Jarvis" : "Arrêter"}
          >
            {/* Pulse rings */}
            {(voiceState === "listening" || voiceState === "speaking") && (
              <>
                <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-white" />
                <span className="absolute -inset-3 rounded-full animate-ping opacity-10 bg-white [animation-delay:150ms]" />
              </>
            )}
            {voiceState === "idle" && <Mic size={40} className="text-white" />}
            {voiceState === "listening" && (
              <MicOff size={40} className="text-white" />
            )}
            {voiceState === "thinking" && (
              <div className="size-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {voiceState === "speaking" && (
              <Volume2 size={40} className="text-white animate-pulse" />
            )}
          </button>

          {/* State label */}
          <p className="text-sm font-semibold text-gray-300">{stateLabel}</p>

          {/* Tap hint */}
          {voiceState === "idle" && (
            <p className="text-xs text-gray-500 text-center">
              Appuyez sur l'orbe pour parler
            </p>
          )}

          {/* Live transcript */}
          {transcript && (
            <div className="w-full bg-gray-900 border border-gray-700 rounded-2xl px-4 py-3 text-center">
              <p className="text-xs text-gray-400 mb-1">Vous</p>
              <p className="text-white text-sm">{transcript}</p>
            </div>
          )}

          {/* Last Jarvis response */}
          {lastResponse && !transcript && (
            <div className="w-full bg-yellow-500/10 border border-yellow-500/30 rounded-2xl px-4 py-3 text-center">
              <p className="text-xs text-yellow-400 mb-1 flex items-center justify-center gap-1">
                <Zap size={11} /> Jarvis
              </p>
              <p className="text-gray-200 text-sm leading-relaxed">
                {lastResponse}
              </p>
              {voiceState === "speaking" && (
                <button
                  onClick={stopAll}
                  className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-white mx-auto"
                >
                  <VolumeX size={12} /> Arrêter
                </button>
              )}
            </div>
          )}
        </div>

        {/* Conversation history */}
        {history.length > 1 && (
          <div className="border-t border-gray-800 px-6 py-4 max-h-40 overflow-y-auto space-y-2">
            {history.slice(-6).map((m, i) => (
              <div
                key={i}
                className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-xl text-xs ${
                    m.role === "user"
                      ? "bg-gray-700 text-white"
                      : "bg-yellow-500/10 text-gray-200 border border-yellow-500/20"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
