"use client";

import { HelpCircle, Zap, Play } from "lucide-react";

interface SectionGuide {
  label: string;
  icon: string;
  title: string;
  shortDescription: string;
  description: string;
  features: string[];
  tips: string;
}

const sectionGuides: Record<string, SectionGuide> = {
  "tableau-de-bord": {
    label: "Tableau de bord",
    icon: "📊",
    title: "Vue d'ensemble de votre santé",
    shortDescription: "Votre centre d'information santé",
    description:
      "Accédez à un aperçu complet de votre état de santé en un seul endroit. Visualisez vos signes vitaux récents, alertes actives et prochains rendez-vous.",
    features: [
      "Résumé de vos derniers signes vitaux",
      "Alertes et notifications prioritaires",
      "Calendrier des rendez-vous à venir",
      "Graphiques de tendances de santé",
    ],
    tips: "💡 Consultez cette page chaque matin pour suivre votre progression",
  },
  "signes-vitaux": {
    label: "Signes vitaux",
    icon: "❤️",
    title: "Suivi de vos constantes",
    shortDescription: "Enregistrez votre santé quotidienne",
    description:
      "Enregistrez et suivez facilement vos signes vitaux en temps réel. Toutes les constantes dans un seul formulaire pour une surveillance efficace.",
    features: [
      "Température corporelle",
      "Fréquence cardiaque et rythme",
      "Tension artérielle (systolique/diastolique)",
      "Saturation en oxygène",
      "Poids et taille",
    ],
    tips: "⏰ Mode vocal disponible pour remplir mains libres",
  },
  alertes: {
    label: "Alertes",
    icon: "🚨",
    title: "Notifications de santé",
    shortDescription: "Restez informé des changements",
    description:
      "Recevez des alertes importantes en temps réel. Toutes les notifications critiques ou urgentes sont ici pour votre sécurité maximale.",
    features: [
      "Alertes critiques en rouge",
      "Alertes hautes en orange",
      "Alertes normales en bleu",
      "Historique complet des notifications",
    ],
    tips: "🔔 Les alertes rouges nécessitent une action immédiate",
  },
  "rendez-vous": {
    label: "Rendez-vous",
    icon: "📅",
    title: "Planification médicale",
    shortDescription: "Gérez vos consultations",
    description:
      "Consultez, programmez et gérez facilement vos rendez-vous médicaux. Recevez des rappels automatiques avant chaque consultation.",
    features: [
      "Vue calendrier complète",
      "Rappels avant rendez-vous",
      "Historique des consultations passées",
      "Notes du médecin après visite",
    ],
    tips: "📲 Vous recevrez un SMS de rappel 24h avant",
  },
  "rapports-medicaux": {
    label: "Rapports médicaux",
    icon: "📄",
    title: "Documents médicaux",
    shortDescription: "Tous vos documents en un lieu",
    description:
      "Accédez à tous vos rapports médicaux, analyses de laboratoire et résumés de consultations organisés facilement.",
    features: [
      "Rapports médicaux datés",
      "Résultats d'analyses de sang",
      "Imagerie médicale",
      "Certificats et ordonnances",
    ],
    tips: "📥 Téléchargez ou partagez vos rapports avec d'autres médecins",
  },
  historique: {
    label: "Historique",
    icon: "⏱️",
    title: "Journal de votre santé",
    shortDescription: "Explorez vos données passées",
    description:
      "Explorez l'historique complet de vos données de santé. Visualisez les tendances et évolutions de vos constantes au fil du temps.",
    features: [
      "Chronologie complète des données",
      "Graphiques de tendances",
      "Export de vos données",
      "Comparaison entre périodes",
    ],
    tips: "📈 Les graphiques aident à identifier des patterns",
  },
  "accès-medecins": {
    label: "Accès médecins",
    icon: "👨‍⚕️",
    title: "Gestion des permissions",
    shortDescription: "Contrôlez vos données médicales",
    description:
      "Contrôlez précisément qui peut accéder à vos données médicales. Accordez ou révoquez les permissions facilement.",
    features: [
      "Liste des médecins autorisés",
      "Permissions spécifiques par médecin",
      "Historique d'accès",
      "Audits de sécurité",
    ],
    tips: "🔐 Vous gardez le contrôle total de vos données",
  },
  questionnaires: {
    label: "Questionnaires",
    icon: "✏️",
    title: "Évaluations de santé",
    shortDescription: "Répondez aux sondages demandés",
    description:
      "Répondez à des questionnaires de suivi de santé prescrit par vos médecins. Mode vocal et manuel disponibles.",
    features: [
      "Questionnaires personnalisés",
      "Mode réponse vocale (voix)",
      "Réponses encryptées",
      "Suivi de progression",
    ],
    tips: "🎤 Utilisez le mode vocal pour répondre plus rapidement",
  },
  "analyses-medicales": {
    label: "Analyses Médicales",
    icon: "🔬",
    title: "Résultats d'analyses",
    shortDescription: "Consultez vos résultats d'analyses",
    description:
      "Consultez rapidement les résultats de vos analyses médicales et examens. Visualisez les valeurs importantes et comparaisons.",
    features: [
      "Résultats de laboratoire",
      "Valeurs normales de référence",
      "Historique des résultats",
      "Algorithme d'IA d'analyse",
    ],
    tips: "🧪 Les valeurs anormales sont automatiquement signalées",
  },
  "guide-suivi": {
    label: "Guide de suivi",
    icon: "📖",
    title: "Guide d'utilisation",
    shortDescription: "Apprenez à utiliser MediFollow",
    description:
      "Accédez à des ressources éducatives complètes pour mieux comprendre et utiliser MediFollow au maximum.",
    features: [
      "Tutoriels vidéo interactifs",
      "Guide étape par étape",
      "FAQ et dépannage",
      "Conseils de santé",
    ],
    tips: "🎬 Regardez les vidéos pour apprendre les meilleures pratiques",
  },
  profil: {
    label: "Profil",
    icon: "👤",
    title: "Mes informations personnelles",
    shortDescription: "Gérez votre profil",
    description:
      "Gérez toutes vos informations personnelles, photo de profil, données de contact et préférences visibles publiquement.",
    features: [
      "Photo de profil personnalisée",
      "Informations personnelles",
      "Données de contact",
      "Historique de modification",
    ],
    tips: "📸 Une photo aide les médecins à vous identifier",
  },
  parametres: {
    label: "Paramètres",
    icon: "⚙️",
    title: "Configuration du compte",
    shortDescription: "Ajustez vos préférences",
    description:
      "Ajustez tous les paramètres de votre compte, notifications, thème visuel et autres préférences d'application.",
    features: [
      "Notifications (on/off/mode silencieux)",
      "Thème clair/sombre",
      "Langue de l'application",
      "Sécurité et confidentialité",
    ],
    tips: "🌙 Activez le mode sombre pour la nuit",
  },
};

interface PatientSidebarGuideProps {
  isVisible?: boolean;
  activeGuide?: string | null;
  onClose?: () => void;
}

export function PatientSidebarGuide({
  isVisible = true,
  activeGuide = null,
  onClose,
}: PatientSidebarGuideProps) {
  if (!isVisible || !activeGuide || !sectionGuides[activeGuide]) {
    return null;
  }

  const guide = sectionGuides[activeGuide];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-lg">
      {/* Top Header with gradient and icon */}
      <div className="relative bg-gradient-to-r from-red-500 via-red-600 to-red-700 dark:from-red-600 dark:via-red-700 dark:to-red-800 px-8 py-8 text-white overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 opacity-10">
          <div className="w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" />
        </div>

        {/* Content */}
        <div className="relative flex items-start gap-4">
          <div
            className="text-5xl flex-shrink-0 animate-bounce"
            style={{ animationDuration: "2s" }}
          >
            {guide.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-black leading-tight mb-1">
              {guide.title}
            </h3>
            <p className="text-red-100 text-sm font-medium">
              {guide.shortDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Main Description */}
      <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800">
        <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
          {guide.description}
        </p>
      </div>

      {/* Features List */}
      <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          Ce que vous pouvez faire
        </h4>
        <div className="space-y-3">
          {guide.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold text-red-600 dark:text-red-400">
                  {idx + 1}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 pt-0.5">
                {feature}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Pro Tip */}
      <div className="mx-8 my-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/30">
        <p className="text-sm text-gray-800 dark:text-amber-100">
          {guide.tips}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="px-8 py-6 bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-3 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold transition-all duration-200 font-medium text-sm"
        >
          Fermer
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm"
        >
          <Play className="w-4 h-4" />
          Explorer
        </button>
      </div>

      {/* Footer hint */}
      <div className="px-8 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Cliquez ailleurs pour fermer ce guide
        </p>
      </div>
    </div>
  );
}

// Helper component to add guide tooltip to nav items
export function GuideTooltip({
  guideId,
  children,
  onShowGuide,
}: {
  guideId: string;
  children: React.ReactNode;
  onShowGuide: (id: string) => void;
}) {
  const guide = sectionGuides[guideId];

  if (!guide) return <>{children}</>;

  return (
    <div className="group/guide relative">
      {children}
      {/* Enhanced info icon with shadow and scale animations */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onShowGuide(guideId);
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/guide:opacity-100 transition-all rounded-lg p-1.5 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 hover:shadow-lg hover:scale-110 active:scale-95 text-red-600 dark:text-red-400"
        aria-label={`Guide pour ${guide.label}`}
        title={guide.title}
      >
        <HelpCircle className="size-4" />
      </button>

      {/* Enhanced tooltip preview on hover */}
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 opacity-0 group-hover/guide:opacity-100 pointer-events-none group-hover/guide:pointer-events-auto transition-opacity z-40">
        {/* Tooltip with arrow pointer */}
        <div className="relative bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg shadow-xl px-4 py-3 w-64 text-sm">
          {/* Arrow pointer */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-gray-900 dark:border-r-white"></div>

          {/* Multi-line tooltip content */}
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0 mt-0.5">{guide.icon}</span>
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">{guide.title}</h4>
              <p className="text-xs opacity-75 line-clamp-2">
                {guide.shortDescription}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
