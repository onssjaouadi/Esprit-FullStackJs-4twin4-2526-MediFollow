/**
 * MediFollow — Centralized Translations
 * Usage: import { useTranslation } from "@/lib/translations";
 *        const t = useTranslation();
 *        <p>{t.common.loading}</p>
 */

import { useLanguage } from "@/app/SettingsContext";

type Language = "fr" | "en" | "es";

const translations = {
  // ============================================
  // COMMON
  // ============================================
  common: {
    loading: { fr: "Chargement...", en: "Loading...", es: "Cargando..." },
    save: { fr: "Sauvegarder", en: "Save", es: "Guardar" },
    cancel: { fr: "Annuler", en: "Cancel", es: "Cancelar" },
    delete: { fr: "Supprimer", en: "Delete", es: "Eliminar" },
    edit: { fr: "Modifier", en: "Edit", es: "Editar" },
    back: { fr: "Retour", en: "Back", es: "Volver" },
    backToHome: { fr: "Retour à l'accueil", en: "Back to home", es: "Volver al inicio" },
    seeAll: { fr: "Voir tout", en: "See all", es: "Ver todo" },
    moreOptions: { fr: "Plus d'options", en: "More options", es: "Más opciones" },
    search: { fr: "Rechercher", en: "Search", es: "Buscar" },
    noData: { fr: "Aucune donnée", en: "No data", es: "Sin datos" },
    normal: { fr: "Normal", en: "Normal", es: "Normal" },
    abnormal: { fr: "Anormal", en: "Abnormal", es: "Anormal" },
    error: { fr: "Une erreur est survenue", en: "An error occurred", es: "Ocurrió un error" },
    optional: { fr: "(optionnel)", en: "(optional)", es: "(opcional)" },
  },

  // ============================================
  // NAV / SIDEBAR
  // ============================================
  nav: {
    dashboard: { fr: "Tableau de bord", en: "Dashboard", es: "Panel" },
    patients: { fr: "Patients", en: "Patients", es: "Pacientes" },
    alerts: { fr: "Alertes", en: "Alerts", es: "Alertas" },
    vitals: { fr: "Signes vitaux", en: "Vital Signs", es: "Signos vitales" },
    analytics: { fr: "Analyses", en: "Analytics", es: "Análisis" },
    reports: { fr: "Rapports", en: "Reports", es: "Informes" },
    medicalReports: { fr: "Rapports médicaux", en: "Medical Reports", es: "Informes médicos" },
    settings: { fr: "Paramètres", en: "Settings", es: "Ajustes" },
    logout: { fr: "Déconnexion", en: "Logout", es: "Cerrar sesión" },
    appointments: { fr: "Rendez-vous", en: "Appointments", es: "Citas" },
    history: { fr: "Historique", en: "History", es: "Historial" },
    users: { fr: "Utilisateurs", en: "Users", es: "Usuarios" },
    blockchain: { fr: "Blockchain", en: "Blockchain", es: "Blockchain" },
    audit: { fr: "Audit", en: "Audit", es: "Auditoría" },
    serviceManagement: { fr: "Gestion des services", en: "Service Management", es: "Gestión de servicios" },
    questionnaires: { fr: "Questionnaires", en: "Questionnaires", es: "Cuestionarios" },
    dataExport: { fr: "Export de données", en: "Data Export", es: "Exportar datos" },
  },

  // ============================================
  // AUTH — LOGIN
  // ============================================
  login: {
    title: { fr: "Connexion", en: "Login", es: "Iniciar sesión" },
    subtitle: { fr: "Accédez à votre espace de suivi", en: "Access your tracking space", es: "Accede a tu espacio de seguimiento" },
    email: { fr: "Email", en: "Email", es: "Correo" },
    emailPlaceholder: { fr: "votre@email.com", en: "your@email.com", es: "tu@email.com" },
    password: { fr: "Mot de passe", en: "Password", es: "Contraseña" },
    rememberMe: { fr: "Se souvenir de moi", en: "Remember me", es: "Recordarme" },
    forgotPassword: { fr: "Mot de passe oublié ?", en: "Forgot password?", es: "¿Olvidaste tu contraseña?" },
    submit: { fr: "Se connecter", en: "Log in", es: "Conectar" },
    submitting: { fr: "Connexion...", en: "Logging in...", es: "Conectando..." },
    noAccount: { fr: "Pas encore de compte ?", en: "No account yet?", es: "¿No tienes cuenta?" },
    signUp: { fr: "Inscrivez-vous", en: "Sign up", es: "Regístrate" },
    demoAccounts: { fr: "Comptes de démonstration:", en: "Demo accounts:", es: "Cuentas de demostración:" },
    loginError: { fr: "Erreur de connexion", en: "Login error", es: "Error de conexión" },
  },

  // ============================================
  // AUTH — REGISTER
  // ============================================
  register: {
    title: { fr: "Inscription Patient", en: "Patient Registration", es: "Registro de Paciente" },
    subtitle: { fr: "Créez votre compte en quelques minutes", en: "Create your account in minutes", es: "Crea tu cuenta en minutos" },
    firstName: { fr: "Prénom", en: "First name", es: "Nombre" },
    lastName: { fr: "Nom", en: "Last name", es: "Apellido" },
    email: { fr: "Email", en: "Email", es: "Correo" },
    phone: { fr: "Téléphone", en: "Phone", es: "Teléfono" },
    password: { fr: "Mot de passe", en: "Password", es: "Contraseña" },
    confirmPassword: { fr: "Confirmer le mot de passe", en: "Confirm password", es: "Confirmar contraseña" },
    passwordHint: {
      fr: "Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial",
      en: "Min. 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special character",
      es: "Mín. 8 caracteres, 1 mayúscula, 1 minúscula, 1 dígito, 1 carácter especial",
    },
    terms: {
      fr: "J'accepte les",
      en: "I accept the",
      es: "Acepto los",
    },
    termsOfUse: { fr: "conditions d'utilisation", en: "terms of use", es: "términos de uso" },
    and: { fr: "et la", en: "and the", es: "y la" },
    privacyPolicy: { fr: "politique de confidentialité", en: "privacy policy", es: "política de privacidad" },
    submit: { fr: "Créer mon compte", en: "Create my account", es: "Crear mi cuenta" },
    submitting: { fr: "Création...", en: "Creating...", es: "Creando..." },
    success: { fr: "Compte créé avec succès !", en: "Account created successfully!", es: "¡Cuenta creada con éxito!" },
    successSub: { fr: "Redirection vers la page de connexion...", en: "Redirecting to login...", es: "Redirigiendo al login..." },
    submitted: { fr: "Compte créé ✓", en: "Account created ✓", es: "Cuenta creada ✓" },
    hasAccount: { fr: "Déjà un compte ?", en: "Already have an account?", es: "¿Ya tienes cuenta?" },
    logIn: { fr: "Connectez-vous", en: "Log in", es: "Conéctate" },
    registerError: { fr: "Erreur lors de l'inscription", en: "Registration error", es: "Error de registro" },
  },

  // ============================================
  // SETTINGS
  // ============================================
  settings: {
    title: { fr: "Paramètres", en: "Settings", es: "Ajustes" },
    subtitle: { fr: "Configuration", en: "System Config", es: "Configuración" },
    save: { fr: "Sauvegarder", en: "Save Changes", es: "Guardar" },
    darkMode: { fr: "Mode Sombre", en: "Dark Mode", es: "Modo Oscuro" },
    language: { fr: "Langue", en: "Language", es: "Idioma" },
    notifications: { fr: "Notifications", en: "Notifications", es: "Notificaciones" },
    notifEmail: { fr: "Alertes par email", en: "Email alerts", es: "Alertas por email" },
    notifSms: { fr: "Alertes par SMS", en: "SMS alerts", es: "Alertas por SMS" },
  },

  // ============================================
  // PATIENT DASHBOARD
  // ============================================
  patient: {
    hello: { fr: "Bonjour", en: "Hello", es: "Hola" },
    subtitle: { fr: "Suivez vos signes vitaux et restez en bonne santé", en: "Track your vital signs and stay healthy", es: "Siga sus signos vitales y manténgase saludable" },
    newMeasure: { fr: "Nouvelle mesure", en: "New measurement", es: "Nueva medida" },
    firstMeasure: { fr: "Première mesure", en: "First measurement", es: "Primera medida" },
    measures7d: { fr: "Mesures (7j)", en: "Measures (7d)", es: "Medidas (7d)" },
    activeAlerts: { fr: "alerte(s) active(s)", en: "active alert(s)", es: "alerta(s) activa(s)" },
    alertBanner: { fr: "Certaines de vos mesures nécessitent votre attention", en: "Some of your measurements need your attention", es: "Algunas de sus medidas necesitan su atención" },
    bloodPressure: { fr: "Tension artérielle", en: "Blood Pressure", es: "Presión arterial" },
    heartRate: { fr: "Fréquence cardiaque", en: "Heart Rate", es: "Frecuencia cardíaca" },
    temperature: { fr: "Température", en: "Temperature", es: "Temperatura" },
    spo2: { fr: "SpO2", en: "SpO2", es: "SpO2" },
    avg: { fr: "Moy:", en: "Avg:", es: "Prom:" },
    myAlerts: { fr: "Mes alertes", en: "My alerts", es: "Mis alertas" },
    charts: { fr: "Graphiques", en: "Charts", es: "Gráficos" },
    recentMeasures: { fr: "Mesures récentes", en: "Recent measurements", es: "Medidas recientes" },
    noMeasures: { fr: "Aucune mesure enregistrée", en: "No measurements recorded", es: "Sin medidas registradas" },
    startTracking: { fr: "Commencez à suivre vos signes vitaux", en: "Start tracking your vital signs", es: "Comience a seguir sus signos vitales" },
    searchPlaceholder: { fr: "Rechercher dans vos données médicales...", en: "Search your medical data...", es: "Buscar en sus datos médicos..." },
    bp: { fr: "Tension", en: "BP", es: "Presión" },
    hr: { fr: "FC", en: "HR", es: "FC" },
    temp: { fr: "Temp", en: "Temp", es: "Temp" },
  },

  // ============================================
  // DOCTOR DASHBOARD
  // ============================================
  doctor: {
    searchPlaceholder: { fr: "Rechercher un patient, une alerte...", en: "Search a patient, an alert...", es: "Buscar un paciente, una alerta..." },
    vitals7d: { fr: "Vitaux (7j)", en: "Vitals (7d)", es: "Vitales (7d)" },
    critical: { fr: "Critiques", en: "Critical", es: "Críticos" },
    totalAlerts: { fr: "Total des alertes", en: "Total Alerts", es: "Total de alertas" },
    openAlerts: { fr: "Alertes ouvertes", en: "Open Alerts", es: "Alertas abiertas" },
    criticalAlerts: { fr: "Alertes critiques", en: "Critical Alerts", es: "Alertas críticas" },
    resolvedAlerts: { fr: "Alertes résolues", en: "Resolved Alerts", es: "Alertas resueltas" },
    totalActive: { fr: "Total actifs", en: "Total active", es: "Total activos" },
    active7d: { fr: "Actifs (7j)", en: "Active (7d)", es: "Activos (7d)" },
    new7d: { fr: "Nouveaux (7j)", en: "New (7d)", es: "Nuevos (7d)" },
    thisWeek: { fr: "Cette semaine", en: "This week", es: "Esta semana" },
    today: { fr: "Aujourd'hui", en: "Today", es: "Hoy" },
    symptoms24h: { fr: "Symptômes (24h)", en: "Symptoms (24h)", es: "Síntomas (24h)" },
    performance: { fr: "Performance", en: "Performance", es: "Rendimiento" },
    resolutionRate: { fr: "Taux résolution", en: "Resolution rate", es: "Tasa de resolución" },
    responseTime: { fr: "Temps réponse", en: "Response time", es: "Tiempo de respuesta" },
    bloodTypeDistribution: { fr: "Distribution des groupes sanguins", en: "Blood type distribution", es: "Distribución de grupos sanguíneos" },
    bloodTypeSub: { fr: "Répartition des patients par type sanguin", en: "Patient distribution by blood type", es: "Distribución de pacientes por tipo sanguíneo" },
    recentAlerts: { fr: "Alertes récentes", en: "Recent alerts", es: "Alertas recientes" },
    noActiveAlerts: { fr: "Aucune alerte active", en: "No active alerts", es: "Sin alertas activas" },
    allResolved: { fr: "Toutes les alertes sont résolues", en: "All alerts are resolved", es: "Todas las alertas están resueltas" },
    unknownPatient: { fr: "Patient inconnu", en: "Unknown patient", es: "Paciente desconocido" },
    urgent: { fr: "Urgent", en: "Urgent", es: "Urgente" },
    untreated: { fr: "Non traité", en: "Untreated", es: "Sin tratar" },
    inProgress: { fr: "En cours", en: "In progress", es: "En curso" },
    resolved: { fr: "Résolu", en: "Resolved", es: "Resuelto" },
  },

  // ============================================
  // ADMIN DASHBOARD
  // ============================================
  admin: {
    welcome: { fr: "Bienvenue, Admin", en: "Welcome, Admin", es: "Bienvenido, Admin" },
    subtitle: { fr: "Vue d'ensemble de la plateforme MediFollow", en: "MediFollow Platform Overview", es: "Vista general de la plataforma MediFollow" },
    totalUsers: { fr: "Utilisateurs", en: "Users", es: "Usuarios" },
    totalPatients: { fr: "Patients", en: "Patients", es: "Pacientes" },
    activeAlerts: { fr: "Alertes Actives", en: "Active Alerts", es: "Alertas Activas" },
    resolvedAlerts: { fr: "Résolues", en: "Resolved", es: "Resueltas" },
    quickActions: { fr: "Actions Rapides", en: "Quick Actions", es: "Acciones Rápidas" },
    systemStatus: { fr: "État du Système", en: "System Status", es: "Estado del Sistema" },
    online: { fr: "En ligne", en: "Online", es: "En línea" },
    open: { fr: "Ouvertes", en: "Open", es: "Abiertas" },
  },
} as const;

// ============================================
// TYPED ACCESSOR
// ============================================

type TranslationValue = { fr: string; en: string; es: string };
type TranslationSection = Record<string, TranslationValue>;
type Translations = typeof translations;

type Resolved<T> = {
  [K in keyof T]: T[K] extends TranslationValue
    ? string
    : T[K] extends Record<string, unknown>
    ? Resolved<T[K]>
    : T[K];
};

function resolve<T extends Record<string, unknown>>(obj: T, lang: Language): Resolved<T> {
  const result: any = {};
  for (const key in obj) {
    const val = obj[key];
    if (val && typeof val === "object" && "fr" in val && "en" in val && "es" in val) {
      result[key] = (val as TranslationValue)[lang];
    } else if (val && typeof val === "object") {
      result[key] = resolve(val as Record<string, unknown>, lang);
    } else {
      result[key] = val;
    }
  }
  return result;
}

/**
 * Hook: returns all translations resolved for the current language.
 * Usage:
 *   const t = useTranslation();
 *   <p>{t.common.loading}</p>
 *   <p>{t.login.title}</p>
 */
export function useTranslation() {
  const { language } = useLanguage();
  return resolve(translations, language);
}

/**
 * Non-hook version for when you already have the language.
 */
export function getTranslation(lang: Language) {
  return resolve(translations, lang);
}
