"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Mic, MicOff, Volume2, RotateCcw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceFormConfig {
  language?: string;
  rate?: number;
  pitch?: number;
}

interface FormField {
  name: string;
  label: string;
  question: string;
  type: "number" | "text" | "boolean";
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

interface VoiceVitalsFormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void;
  title: string;
  description?: string;
  config?: VoiceFormConfig;
}

export function VoiceVitalsForm({
  fields,
  onSubmit,
  title,
  description,
  config = { language: "fr-FR", rate: 1, pitch: 1 },
}: VoiceVitalsFormProps) {
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [mode, setMode] = useState<"voice" | "manual">("voice");
  const [manualValue, setManualValue] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [language, setLanguage] = useState<"fr-FR" | "en-US">(
    config.language === "en-US" ? "en-US" : "fr-FR"
  );

  // Language-specific messages
  const messages = {
    "fr-FR": {
      progression: "Progression",
      question: "Question",
      vocal: "Vocal",
      manuel: "Manuel",
      unite: "Unité",
      ecoute: "Écoute en cours...",
      question_en_cours: "Question en cours de lecture...",
      vous_avez_dit: "Vous avez dit:",
      dites_quelque_chose: "Veuillez dire quelque chose...",
      pas_compris: "Je n'ai pas compris. Pouvez-vous répéter?",
      valeur_reconnue: "Valeur reconnue",
      est_correct: "Est-ce correct?",
      traitement: "Traitement...",
      confirmer: "Confirmer",
      suivant: "Suivant",
      entrez_valeur: "Entrez une valeur",
      recommencer: "Recommencer",
      formulaire_complete: "Formulaire complété!",
      donnees_enregistrees: "Vos données ont été enregistrées avec succès.",
    },
    "en-US": {
      progression: "Progress",
      question: "Question",
      vocal: "Voice",
      manuel: "Manual",
      unite: "Unit",
      ecoute: "Listening...",
      question_en_cours: "Question reading...",
      vous_avez_dit: "You said:",
      dites_quelque_chose: "Please say something...",
      pas_compris: "I didn't understand. Can you repeat?",
      valeur_reconnue: "Recognized value",
      est_correct: "Is this correct?",
      traitement: "Processing...",
      confirmer: "Confirm",
      suivant: "Next",
      entrez_valeur: "Enter a value",
      recommencer: "Restart",
      formulaire_complete: "Form completed!",
      donnees_enregistrees: "Your data has been saved successfully.",
    },
  };

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const currentField = fields[currentFieldIndex];
  const progress = Math.round((currentFieldIndex / fields.length) * 100);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.language = language;
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setInterimTranscript("");
        setTranscript("");
      };

      recognitionRef.current.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript + " ";
          } else {
            interim += transcript;
          }
        }

        if (final) {
          setTranscript(final.trim());
          setInterimTranscript("");
        } else {
          setInterimTranscript(interim);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setFeedback(
          `${language === "en-US" ? "Error" : "Erreur"}: ${event.error}`
        );
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language]);

  // Speak question
  const speakQuestion = async (text: string) => {
    return new Promise<void>((resolve) => {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = config.rate;
      utterance.pitch = config.pitch;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        setIsSpeaking(false);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  };

  // Start listening
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript("");
      setInterimTranscript("");
      recognitionRef.current.start();
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  // Ask current question
  useEffect(() => {
    if (currentField && mode === "voice") {
      const askQuestion = async () => {
        await speakQuestion(currentField.question);
        // Auto-start listening after question
        setTimeout(() => {
          startListening();
        }, 500);
      };

      askQuestion();
    }
  }, [currentFieldIndex, mode, currentField]);

  // Parse voice input
  const parseVoiceInput = (input: string): string => {
    const cleaned = input.toLowerCase().trim();

    if (!cleaned) return "";

    // Handle boolean
    if (currentField.type === "boolean") {
      if (
        cleaned.match(
          /oui|yes|vrai|true|affirmative|affirmatif|d'accord|ok|yep|yeah/i
        )
      ) {
        return "true";
      }
      if (
        cleaned.match(/non|no|faux|false|negative|negatif|pas du tout|nope/i)
      ) {
        return "false";
      }
    }

    // Handle numbers - extract first number found
    if (currentField.type === "number") {
      const numbers = cleaned.match(/\d+\.?\d*/g);
      return numbers ? numbers[0] : "";
    }

    return cleaned;
  };

  // Handle voice submission
  const handleVoiceSubmit = async () => {
    if (!transcript && !interimTranscript) {
      setFeedback(messages[language].dites_quelque_chose);
      return;
    }

    const voiceInput = parseVoiceInput(transcript || interimTranscript);

    if (!voiceInput) {
      setFeedback(messages[language].pas_compris);
      return;
    }

    stopListening();
    setIsProcessing(true);

    // Confirm the value
    await speakQuestion(`${voiceInput}. ${messages[language].est_correct}`);

    setFeedback(`${messages[language].valeur_reconnue}: ${voiceInput}`);
    setFormData((prev) => ({
      ...prev,
      [currentField.name]: voiceInput,
    }));

    // Move to next field
    setTimeout(() => {
      if (currentFieldIndex < fields.length - 1) {
        setCurrentFieldIndex(currentFieldIndex + 1);
        setTranscript("");
        setInterimTranscript("");
        setFeedback("");
        setIsProcessing(false);
      } else {
        // Form completed
        onSubmit(formData);
      }
    }, 2000);
  };

  // Handle manual submission
  const handleManualSubmit = () => {
    if (!manualValue && currentField.type !== "boolean") {
      setFeedback(messages[language].entrez_valeur);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [currentField.name]: manualValue,
    }));

    setManualValue("");

    if (currentFieldIndex < fields.length - 1) {
      setCurrentFieldIndex(currentFieldIndex + 1);
      setFeedback("");
    } else {
      onSubmit(formData);
    }
  };

  // Toggle modes
  const toggleMode = () => {
    stopListening();
    setMode(mode === "voice" ? "manual" : "voice");
    setTranscript("");
    setInterimTranscript("");
    setFeedback("");
  };

  // Reset form
  const resetForm = () => {
    setCurrentFieldIndex(0);
    setFormData({});
    setTranscript("");
    setInterimTranscript("");
    setFeedback("");
    setManualValue("");
    stopListening();
  };

  if (currentFieldIndex >= fields.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {messages[language].formulaire_complete}
          </h2>
          <p className="text-gray-600 mb-6">
            {messages[language].donnees_enregistrees}
          </p>
          <Button onClick={resetForm} variant="outline">
            {messages[language].recommencer}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">{title}</h1>
            {description && <p className="text-gray-600">{description}</p>}
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as "fr-FR" | "en-US")}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold hover:border-blue-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            aria-label="Select language"
          >
            <option value="fr-FR">🇫🇷 Français</option>
            <option value="en-US">🇬🇧 English</option>
          </select>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 bg-white rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-semibold text-gray-700">
              {messages[language].progression}
            </p>
            <p className="text-sm font-bold text-blue-600">{progress}%</p>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {messages[language].question} {currentFieldIndex + 1}/
            {fields.length}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6 justify-center">
            <Button
              onClick={toggleMode}
              variant={mode === "voice" ? "default" : "outline"}
              size="sm"
              className="gap-2"
            >
              <Mic className="h-4 w-4" />
              {messages[language].vocal}
            </Button>
            <Button
              onClick={toggleMode}
              variant={mode === "manual" ? "default" : "outline"}
              size="sm"
            >
              {messages[language].manuel}
            </Button>
          </div>

          {/* Current Question */}
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {currentField.label}
            </h2>
            <p className="text-lg text-gray-700 italic">
              "{currentField.question}"
            </p>
            {currentField.unit && (
              <p className="text-sm text-gray-600 mt-2">
                {messages[language].unite}: {currentField.unit}
              </p>
            )}
          </div>

          {mode === "voice" ? (
            <>
              {/* Voice Mode */}
              <div className="space-y-6">
                {/* Microphone Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={isListening ? stopListening : startListening}
                    disabled={isSpeaking || isProcessing}
                    size="lg"
                    className={`h-24 w-24 rounded-full ${
                      isListening
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-gradient-to-r from-blue-500 to-purple-500"
                    }`}
                  >
                    {isListening ? (
                      <MicOff className="h-10 w-10" />
                    ) : (
                      <Mic className="h-10 w-10" />
                    )}
                  </Button>
                </div>

                {/* Status */}
                <div className="text-center">
                  {isListening && (
                    <p className="text-red-600 font-semibold flex items-center justify-center gap-2">
                      <span className="inline-block h-2 w-2 bg-red-600 rounded-full animate-pulse" />
                      {messages[language].ecoute}
                    </p>
                  )}
                  {isSpeaking && (
                    <p className="text-blue-600 font-semibold flex items-center justify-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      {messages[language].question_en_cours}
                    </p>
                  )}
                  {transcript && (
                    <div className="bg-blue-50 rounded-lg p-4 mt-4">
                      <p className="text-sm text-gray-600 mb-1">
                        {messages[language].vous_avez_dit}
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {transcript}
                      </p>
                    </div>
                  )}
                  {interimTranscript && (
                    <p className="text-gray-500 italic mt-2">
                      {interimTranscript}...
                    </p>
                  )}
                </div>

                {/* Feedback */}
                {feedback && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm">{feedback}</p>
                  </div>
                )}

                {/* Submit Button */}
                {transcript && !isProcessing && (
                  <Button
                    onClick={handleVoiceSubmit}
                    disabled={isProcessing}
                    size="lg"
                    className="w-full gap-2 bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {messages[language].traitement}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        {messages[language].confirmer}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Manual Mode */}
              <div className="space-y-4">
                {currentField.type === "number" ? (
                  <input
                    type="number"
                    step={currentField.step || 0.1}
                    min={currentField.min}
                    max={currentField.max}
                    placeholder={
                      currentField.placeholder ||
                      messages[language].entrez_valeur
                    }
                    value={manualValue}
                    onChange={(e) => setManualValue(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-lg"
                    autoFocus
                  />
                ) : (
                  <input
                    type="text"
                    placeholder={
                      currentField.placeholder ||
                      messages[language].entrez_valeur
                    }
                    value={manualValue}
                    onChange={(e) => setManualValue(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-lg"
                    autoFocus
                  />
                )}

                {feedback && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">{feedback}</p>
                  </div>
                )}

                <Button
                  onClick={handleManualSubmit}
                  size="lg"
                  className="w-full gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-4 w-4" />
                  {messages[language].suivant}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <Button onClick={resetForm} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            {messages[language].recommencer}
          </Button>
        </div>
      </div>
    </div>
  );
}
