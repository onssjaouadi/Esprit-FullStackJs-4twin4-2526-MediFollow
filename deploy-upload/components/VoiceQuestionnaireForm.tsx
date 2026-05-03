"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Mic, MicOff, Volume2, RotateCcw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Question {
  id: string;
  questionNumber: number;
  questionText: string;
  questionType: string;
  helpText?: string;
  options?: Array<{ value: string; label: string }>;
  isRequired: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
}

interface VoiceQuestionnaireFormProps {
  questions: Question[];
  questionnaireName: string;
  onSubmit: (data: Record<string, any>) => void;
  onCancel: () => void;
}

export function VoiceQuestionnaireForm({
  questions,
  questionnaireName,
  onSubmit,
  onCancel,
}: VoiceQuestionnaireFormProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [language, setLanguage] = useState<"fr-FR" | "en-US">("fr-FR");

  const recognitionRef = useRef<any>(null);

  // Language-specific messages
  const messages = {
    "fr-FR": {
      progression: "Progression",
      question_num: "Question",
      ecoute: "Écoute en cours...",
      question_lecture: "Question en cours de lecture...",
      vous_avez_dit: "Vous avez dit:",
      dites_quelque_chose: "Veuillez dire quelque chose...",
      pas_compris: "Je n'ai pas compris. Pouvez-vous répéter?",
      valeur_reconnue: "Valeur reconnue",
      est_correct: "Est-ce correct?",
      traitement: "Traitement...",
      confirmer: "Confirmer",
      annuler: "Annuler",
      recommencer: "Recommencer",
      options_disponibles: "Options disponibles",
      questionnaire_complete: "Questionnaire complété!",
      reponses_enregistrees: "Vos réponses ont été enregistrées avec succès.",
    },
    "en-US": {
      progression: "Progress",
      question_num: "Question",
      ecoute: "Listening...",
      question_lecture: "Reading question...",
      vous_avez_dit: "You said:",
      dites_quelque_chose: "Please say something...",
      pas_compris: "I didn't understand. Can you repeat?",
      valeur_reconnue: "Recognized value",
      est_correct: "Is this correct?",
      traitement: "Processing...",
      confirmer: "Confirm",
      annuler: "Cancel",
      recommencer: "Restart",
      options_disponibles: "Available options",
      questionnaire_complete: "Questionnaire completed!",
      reponses_enregistrees: "Your responses have been saved successfully.",
    },
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = Math.round((currentQuestionIndex / questions.length) * 100);

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
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 1;
      utterance.pitch = 1;

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

  // Ask current question
  useEffect(() => {
    if (currentQuestion) {
      const askQuestion = async () => {
        await speakQuestion(currentQuestion.questionText);
        setTimeout(() => {
          startListening();
        }, 500);
      };

      askQuestion();
    }
  }, [currentQuestionIndex, currentQuestion]);

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

  // Parse voice input based on question type
  const parseVoiceInput = (input: string): string | boolean | number => {
    const cleaned = input.toLowerCase().trim();

    if (!cleaned) return "";

    switch (currentQuestion.questionType) {
      case "YESNO":
        if (
          cleaned.match(
            /oui|yes|vrai|true|affirmative|affirmatif|d'accord|ok|yep|yeah/i
          )
        ) {
          return true;
        }
        if (
          cleaned.match(/non|no|faux|false|negative|negatif|pas du tout|nope/i)
        ) {
          return false;
        }
        return cleaned;

      case "RATING":
      case "NUMBER":
        const numbers = cleaned.match(/\d+\.?\d*/g);
        return numbers ? parseFloat(numbers[0]) : cleaned;

      case "MULTIPLE_CHOICE":
      case "CHECKBOX":
        // Try to match with available options
        if (currentQuestion.options) {
          const matched = currentQuestion.options.find(
            (opt) =>
              opt.label.toLowerCase().includes(cleaned) ||
              opt.value.toString().toLowerCase().includes(cleaned)
          );
          if (matched) {
            return matched.value;
          }
        }
        return cleaned;

      default:
        return cleaned;
    }
  };

  // Handle voice submission
  const handleVoiceSubmit = async () => {
    if (!transcript && !interimTranscript) {
      setFeedback(messages[language].dites_quelque_chose);
      return;
    }

    const voiceInput = parseVoiceInput(transcript || interimTranscript);

    if (voiceInput === "") {
      setFeedback(messages[language].pas_compris);
      return;
    }

    stopListening();
    setIsProcessing(true);

    // Confirm the value
    const cleanValue =
      typeof voiceInput === "boolean"
        ? language === "en-US"
          ? voiceInput
            ? "yes"
            : "no"
          : voiceInput
            ? "oui"
            : "non"
        : String(voiceInput);
    await speakQuestion(`${cleanValue}. ${messages[language].est_correct}`);

    setFeedback(`${messages[language].valeur_reconnue}: ${cleanValue}`);
    setFormData((prev) => ({
      ...prev,
      [currentQuestion.id]: voiceInput,
    }));

    // Move to next question
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
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

  // Reset form
  const resetForm = () => {
    setCurrentQuestionIndex(0);
    setFormData({});
    setTranscript("");
    setInterimTranscript("");
    setFeedback("");
    stopListening();
  };

  if (currentQuestionIndex >= questions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {messages[language].questionnaire_complete}
          </h2>
          <p className="text-gray-600 mb-6">
            {messages[language].reponses_enregistrees}
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
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              {questionnaireName}
            </h1>
            <p className="text-gray-600">
              {language === "en-US"
                ? "Voice response mode"
                : "Mode de réponse vocale"}
            </p>
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
            {messages[language].question_num} {currentQuestionIndex + 1}/
            {questions.length}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          {/* Current Question */}
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {messages[language].question_num} {currentQuestion.questionNumber}
            </h2>
            <p className="text-lg text-gray-700 italic">
              "{currentQuestion.questionText}"
            </p>
            {currentQuestion.helpText && (
              <p className="text-sm text-gray-600 mt-3">
                💡 {currentQuestion.helpText}
              </p>
            )}
            {currentQuestion.options && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600 font-semibold">
                  {messages[language].options_disponibles}:
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {currentQuestion.options.map((opt) => (
                    <div
                      key={opt.value}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

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
                  {messages[language].question_lecture}
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
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <Button onClick={resetForm} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            {messages[language].recommencer}
          </Button>
          <Button onClick={onCancel} variant="outline" className="gap-2">
            {messages[language].annuler}
          </Button>
        </div>
      </div>
    </div>
  );
}
