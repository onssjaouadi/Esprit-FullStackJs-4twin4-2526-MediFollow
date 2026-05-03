/**
 * Voice Recognition Hook
 * Uses Web Speech API for voice-to-text transcription
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

interface UseVoiceRecognitionOptions {
  language?: 'fr-FR' | 'en-US';
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (result: VoiceRecognitionResult) => void;
  onError?: (error: string) => void;
}

export function useVoiceRecognition(options: UseVoiceRecognitionOptions = {}) {
  const {
    language = 'fr-FR',
    continuous = true,
    interimResults = true,
    onResult,
    onError,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      // Configure recognition
      recognitionRef.current.lang = language;
      recognitionRef.current.continuous = continuous;
      recognitionRef.current.interimResults = interimResults;
      recognitionRef.current.maxAlternatives = 1;

      // Set up event handlers
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptPart = result[0].transcript;

          if (result.isFinal) {
            finalTranscript += transcriptPart + ' ';
          } else {
            interimText += transcriptPart;
          }
        }

        if (finalTranscript) {
          setTranscript((prev) => prev + finalTranscript);
          if (onResult) {
            onResult({
              transcript: finalTranscript.trim(),
              confidence: event.results[0][0].confidence || 1,
              isFinal: true,
            });
          }
        }

        if (interimText) {
          setInterimTranscript(interimText);
          if (onResult && interimResults) {
            onResult({
              transcript: interimText,
              confidence: 0,
              isFinal: false,
            });
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        const errorMessage = getErrorMessage(event.error);
        if (onError) {
          onError(errorMessage);
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, continuous, interimResults, onResult, onError]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      if (onError) {
        onError('Voice recognition not supported in this browser');
      }
      return;
    }

    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setTranscript('');
        setInterimTranscript('');
      } catch (error: any) {
        console.error('Failed to start recognition:', error);
        if (onError) {
          onError('Failed to start voice recognition');
        }
      }
    }
  }, [isSupported, isListening, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimTranscript('');
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  };
}

function getErrorMessage(error: string): string {
  switch (error) {
    case 'no-speech':
      return 'Aucun discours détecté. Veuillez parler dans le microphone.';
    case 'audio-capture':
      return 'Microphone non détecté. Vérifiez vos permissions.';
    case 'not-allowed':
      return 'Permission microphone refusée. Activez-la dans les paramètres.';
    case 'network':
      return 'Erreur réseau. Vérifiez votre connexion internet.';
    case 'aborted':
      return 'Reconnaissance vocale interrompue.';
    default:
      return `Erreur de reconnaissance vocale: ${error}`;
  }
}
