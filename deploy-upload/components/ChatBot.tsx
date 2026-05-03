"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  UserCircle,
  ChevronDown,
  AlertCircle,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import {
  getPatientMedicalContext,
  getDoctorPatientsList,
} from "@/lib/actions/medassist.actions";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface PatientOption {
  id: string;
  nom: string;
  numeroDossier: string;
  alertesActives: number;
}

export default function ChatBot({
  forceOpen,
  startInVoiceMode,
  onClose,
}: {
  forceOpen?: boolean;
  startInVoiceMode?: boolean;
  onClose?: () => void;
} = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patientContext, setPatientContext] = useState<any>(null);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  // Voice assistant state
  const [isVoiceMode, setIsVoiceMode] = useState(startInVoiceMode ?? false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceAutoSpeak, setVoiceAutoSpeak] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // React to external forceOpen + startInVoiceMode changes
  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      if (startInVoiceMode !== undefined) setIsVoiceMode(startInVoiceMode);
      onClose?.(); // reset the trigger in the parent immediately
    }
  }, [forceOpen, startInVoiceMode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Load patients list when chat opens
  useEffect(() => {
    if (isOpen && patients.length === 0) {
      loadPatients();
    }
  }, [isOpen]);

  const loadPatients = async () => {
    try {
      const result = await getDoctorPatientsList();
      if (result.success && result.patients) {
        setPatients(result.patients);
      }
    } catch (error) {
      console.error("Error loading patients:", error);
    }
  };

  // Setup Web Speech API recognition
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, []);

  const handleVoiceInput = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handlePatientSelect = async (patientId: string) => {
    setSelectedPatient(patientId);
    setShowPatientDropdown(false);
    setIsLoading(true);

    try {
      const result = await getPatientMedicalContext(patientId);
      if (result.success && result.context) {
        setPatientContext(result.context);

        // Add system message indicating patient context loaded
        const patientName = result.context.patient.nom;
        const contextMessage: Message = {
          role: "assistant",
          content: `✅ Contexte médical chargé pour ${patientName}. Je peux maintenant vous assister avec ce dossier patient.`,
          timestamp: new Date(),
        };
        setMessages([contextMessage]);
      }
    } catch (error) {
      console.error("Error loading patient context:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Use Jarvis (HuggingFace) in voice mode, Azure OpenAI otherwise
    const apiEndpoint = isVoiceMode ? "/api/jarvis" : "/api/chatbot";

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages
            .concat(userMessage)
            .map(({ role, content }) => ({ role, content })),
          patientContext: patientContext,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Auto-speak response when in voice mode with auto-speak enabled
      if (isVoiceMode && voiceAutoSpeak) {
        speakText(data.message);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content:
          "Désolé, je rencontre un problème technique. Veuillez réessayer dans un moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const welcomeMessage = isVoiceMode
    ? "Bonjour! 🎙️ Je suis Jarvis, votre assistant vocal médical. Utilisez le microphone ou tapez votre question. Sélectionnez un patient pour accéder à son dossier."
    : "Bonjour! 👋 Je suis MedAssist AI, votre assistant médical intelligent. Sélectionnez un patient pour que je puisse accéder à son dossier médical et vous assister avec l'analyse de ses données cliniques.";

  const selectedPatientData = patients.find((p) => p.id === selectedPatient);

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group h-14 w-14 rounded-full bg-gradient-to-r from-green-600 to-green-700 text-white shadow-xl hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 hover:scale-110 flex items-center justify-center"
          aria-label="Open MedAssist AI / Jarvis"
        >
          <div className="relative">
            <Bot
              size={24}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header - Kick Style */}
          <div className="flex flex-col bg-gradient-to-r from-green-600 to-green-700">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Bot size={20} className="text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-400 border-2 border-white"></div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">
                      {isVoiceMode ? "Jarvis" : "MedAssist AI"}
                    </h3>
                    {isVoiceMode ? (
                      <Zap
                        size={14}
                        className="text-yellow-300 animate-pulse"
                      />
                    ) : (
                      <Sparkles
                        size={14}
                        className="text-green-300 animate-pulse"
                      />
                    )}
                  </div>
                  <p className="text-xs text-green-100">
                    {isVoiceMode
                      ? "Assistant vocal Jarvis-3B"
                      : "Assistant médical intelligent"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Voice mode toggle */}
                <button
                  onClick={() => {
                    setIsVoiceMode((v) => !v);
                    stopSpeaking();
                  }}
                  className={`rounded-lg p-1.5 transition-colors ${
                    isVoiceMode
                      ? "bg-yellow-400/30 text-yellow-200 hover:bg-yellow-400/40"
                      : "text-white hover:bg-white/20"
                  }`}
                  title={
                    isVoiceMode ? "Désactiver Jarvis" : "Activer Jarvis (vocal)"
                  }
                  aria-label="Toggle Jarvis voice mode"
                >
                  <Mic size={18} />
                </button>
                {/* Auto-speak toggle (only visible in voice mode) */}
                {isVoiceMode && (
                  <button
                    onClick={() => {
                      setVoiceAutoSpeak((v) => !v);
                      if (isSpeaking) stopSpeaking();
                    }}
                    className={`rounded-lg p-1.5 transition-colors ${
                      voiceAutoSpeak
                        ? "bg-white/20 text-white"
                        : "text-white/50 hover:bg-white/10"
                    }`}
                    title={
                      voiceAutoSpeak
                        ? "Désactiver la lecture vocale"
                        : "Activer la lecture vocale"
                    }
                    aria-label="Toggle auto-speak"
                  >
                    {voiceAutoSpeak ? (
                      <Volume2 size={18} />
                    ) : (
                      <VolumeX size={18} />
                    )}
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    stopSpeaking();
                  }}
                  className="rounded-lg p-1.5 text-white hover:bg-white/20 transition-colors"
                  aria-label="Close chat"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Patient Selector */}
            <div className="px-4 pb-3">
              <div className="relative">
                <button
                  onClick={() => setShowPatientDropdown(!showPatientDropdown)}
                  className="w-full flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 text-white hover:bg-white/20 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <UserCircle size={16} />
                    <span className="text-sm font-medium">
                      {selectedPatientData
                        ? selectedPatientData.nom
                        : "Sélectionner un patient"}
                    </span>
                  </div>
                  <ChevronDown size={16} />
                </button>

                {/* Dropdown */}
                {showPatientDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto z-10">
                    {patients.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        Aucun patient disponible
                      </div>
                    ) : (
                      patients.map((patient) => (
                        <button
                          key={patient.id}
                          onClick={() => handlePatientSelect(patient.id)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-0"
                        >
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {patient.nom}
                            </div>
                            <div className="text-xs text-gray-500">
                              {patient.numeroDossier}
                            </div>
                          </div>
                          {patient.alertesActives > 0 && (
                            <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                              <AlertCircle size={12} />
                              {patient.alertesActives}
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {/* Welcome Message */}
            {messages.length === 0 && (
              <div className="flex gap-3 items-start animate-fade-in">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="flex-1 bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {welcomeMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Chat Messages */}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 items-start animate-slide-up ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                    message.role === "user"
                      ? "bg-gray-900"
                      : "bg-gradient-to-r from-green-600 to-green-700"
                  }`}
                >
                  {message.role === "user" ? (
                    <User size={16} className="text-white" />
                  ) : (
                    <Bot size={16} className="text-white" />
                  )}
                </div>
                <div
                  className={`flex-1 rounded-2xl p-4 shadow-sm ${
                    message.role === "user"
                      ? "bg-gray-900 text-white rounded-tr-none"
                      : "bg-white text-gray-700 border border-gray-100 rounded-tl-none"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-2 ${
                      message.role === "user"
                        ? "text-gray-400"
                        : "text-gray-400"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Loading */}
            {isLoading && (
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="flex-1 bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2">
                    <Loader2
                      size={16}
                      className="animate-spin text-green-600"
                    />
                    <span className="text-sm text-gray-500">
                      Analyse en cours...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            {!selectedPatient && (
              <div className="mb-3 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">
                <AlertCircle size={14} />
                <span>Sélectionnez un patient pour commencer</span>
              </div>
            )}
            <div className="flex gap-2">
              {/* Mic button — voice mode only */}
              {isVoiceMode && (
                <button
                  onClick={handleVoiceInput}
                  disabled={
                    isLoading || !selectedPatient || !recognitionRef.current
                  }
                  className={`flex-shrink-0 rounded-lg p-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  aria-label={
                    isListening ? "Arrêter l'écoute" : "Parler à Jarvis"
                  }
                  title={isListening ? "Arrêter l'écoute" : "Parler à Jarvis"}
                >
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
              )}
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isVoiceMode && isListening
                    ? "Écoute en cours..."
                    : selectedPatient
                      ? isVoiceMode
                        ? "Parlez ou tapez votre question..."
                        : "Posez votre question médicale..."
                      : "Sélectionnez d'abord un patient..."
                }
                className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 min-h-[44px] max-h-32"
                rows={1}
                disabled={isLoading || !selectedPatient || isListening}
              />
              {/* Stop speaking button */}
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="flex-shrink-0 rounded-lg bg-orange-500 p-2.5 text-white hover:bg-orange-600 transition-all"
                  aria-label="Arrêter la lecture"
                  title="Arrêter la lecture"
                >
                  <VolumeX size={20} />
                </button>
              )}
              <button
                onClick={handleSend}
                disabled={
                  !input.trim() || isLoading || !selectedPatient || isListening
                }
                className="flex-shrink-0 rounded-lg bg-gradient-to-r from-green-600 to-green-700 p-2.5 text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              {isVoiceMode
                ? "Jarvis — Propulsé par Jarvis-3B (HuggingFace)"
                : "MedAssist AI — Assistance médicale basée sur les données"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
