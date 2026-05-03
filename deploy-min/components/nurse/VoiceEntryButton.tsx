"use client";

import { Mic, MicOff, Loader2 } from "lucide-react";
import { useState } from "react";

interface VoiceEntryButtonProps {
  isListening: boolean;
  isParsing: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export function VoiceEntryButton({
  isListening,
  isParsing,
  onStart,
  onStop,
  disabled = false,
}: VoiceEntryButtonProps) {
  return (
    <button
      type="button"
      onClick={isListening ? onStop : onStart}
      disabled={disabled || isParsing}
      className={`
        relative flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all
        ${
          isListening
            ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/50"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }
        ${disabled || isParsing ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      {isParsing ? (
        <>
          <Loader2 className="animate-spin" size={20} />
          <span>Analyzing...</span>
        </>
      ) : isListening ? (
        <>
          <MicOff size={20} />
          <span>Arrêter l'écoute</span>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </>
      ) : (
        <>
          <Mic size={20} />
          <span>Voice Recording</span>
        </>
      )}
    </button>
  );
}
