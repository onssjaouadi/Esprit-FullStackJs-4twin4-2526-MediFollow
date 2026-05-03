"use client";

import { useState, useEffect } from "react";

interface TourGuide {
  id: string;
  label: string;
  icon: string;
  title: string;
  shortDescription: string;
}

const tourGuides: TourGuide[] = [
  {
    id: "tableau-de-bord",
    label: "Tableau de bord",
    icon: "📊",
    title: "Vue d'ensemble de votre santé",
    shortDescription: "Votre centre d'information santé",
  },
  {
    id: "signes-vitaux",
    label: "Signes vitaux",
    icon: "❤️",
    title: "Suivi de vos constantes",
    shortDescription: "Enregistrez votre santé quotidienne",
  },
  {
    id: "alertes",
    label: "Alertes",
    icon: "🚨",
    title: "Notifications de santé",
    shortDescription: "Restez informé des changements",
  },

  {
    id: "rapports-medicaux",
    label: "Rapports médicaux",
    icon: "📄",
    title: "Documents médicaux",
    shortDescription: "Tous vos documents en un lieu",
  },
  {
    id: "historique",
    label: "Historique",
    icon: "⏱️",
    title: "Journal de votre santé",
    shortDescription: "Explorez vos données passées",
  },
];

interface OnboardingTourProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function OnboardingTour({ isOpen, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const currentGuide = tourGuides[currentStep];

  // Highlight sidebar element corresponding to current step
  useEffect(() => {
    if (!isOpen) {
      // Clean up highlights when tour closes
      document.querySelectorAll("a[data-tour]").forEach((link) => {
        link.classList.remove(
          "tour-highlight",
          "ring-2",
          "ring-yellow-400",
          "shadow-lg",
          "shadow-yellow-400/50"
        );
      });
      return;
    }

    // Find the sidebar link with matching data-tour attribute
    const sidebarLink = document.querySelector(
      `a[data-tour="${currentGuide.id}"]`
    ) as HTMLElement;

    if (sidebarLink) {
      // Remove highlight from all other links
      document.querySelectorAll("a[data-tour]").forEach((link) => {
        link.classList.remove(
          "tour-highlight",
          "ring-2",
          "ring-yellow-400",
          "shadow-lg",
          "shadow-yellow-400/50"
        );
      });

      // Add highlight to current link
      sidebarLink.classList.add(
        "tour-highlight",
        "ring-2",
        "ring-yellow-400",
        "shadow-lg",
        "shadow-yellow-400/50"
      );

      // Scroll into view if needed
      sidebarLink.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    return () => {
      // Cleanup when step changes
      document.querySelectorAll("a[data-tour]").forEach((link) => {
        link.classList.remove(
          "tour-highlight",
          "ring-2",
          "ring-yellow-400",
          "shadow-lg",
          "shadow-yellow-400/50"
        );
      });
    };
  }, [currentStep, isOpen, currentGuide.id]);

  const handleNext = () => {
    if (currentStep < tourGuides.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Tour highlight styles */}
      <style>{`
        .tour-highlight {
          animation: tourPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite !important;
          position: relative;
        }
        
        @keyframes tourPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(250, 204, 21, 0.7), inset 0 0 10px rgba(250, 204, 21, 0.3);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(250, 204, 21, 0), inset 0 0 20px rgba(250, 204, 21, 0.6);
          }
        }
      `}</style>

      {/* Dark overlay */}
      <div className="fixed inset-0 z-[998] bg-black/50" onClick={handleSkip} />

      {/* Pointer line from tour to sidebar */}
      <svg
        className="fixed inset-0 z-[998] pointer-events-none"
        width="100%"
        height="100%"
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop
              offset="0%"
              style={{ stopColor: "#fbbf24", stopOpacity: 0.8 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "#f59e0b", stopOpacity: 0.4 }}
            />
          </linearGradient>
        </defs>
        {/* Line from tour card bottom-left to sidebar */}
        <line
          x1="10%"
          y1="80"
          x2="140"
          y2="150"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          strokeDasharray="5,5"
          opacity="0.7"
        />
        {/* Arrow at sidebar end */}
        <polygon
          points="140,150 135,145 145,140"
          fill="#fbbf24"
          opacity="0.8"
        />
      </svg>

      {/* Tour card */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[999] w-11/12 max-w-3xl rounded-2xl shadow-2xl bg-gradient-to-r from-red-500 via-red-600 to-red-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
        {/* Header with content */}
        <div className="flex items-center justify-between px-6 py-4 gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <span className="text-3xl shrink-0">{currentGuide.icon}</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-base leading-tight">
                {currentGuide.label}
              </h3>
              <p className="text-red-100 text-sm line-clamp-1">
                {currentGuide.title} - {currentGuide.shortDescription}
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                aria-label="Étape précédente"
                className="px-3 py-2 text-xs font-medium text-white bg-white/20 hover:bg-white/30 rounded-lg transition-all"
              >
                ← Précédent
              </button>
            )}
            {currentStep < tourGuides.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 text-xs font-bold text-red-700 bg-white hover:bg-gray-100 rounded-lg transition-all"
              >
                Suivant
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-4 py-2 text-xs font-bold text-red-700 bg-white hover:bg-gray-100 rounded-lg transition-all"
              >
                Terminer
              </button>
            )}
            <button
              onClick={handleSkip}
              aria-label="Passer le guide"
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-all font-bold text-lg leading-none"
              title="Fermer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/20 flex">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{
              width: `${((currentStep + 1) / tourGuides.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </>
  );
}
