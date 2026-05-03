// Constantes et types pour le système d'audit

export enum AuditActionType {
  // Authentication
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  PASSWORD_RESET = "PASSWORD_RESET",

  // User Management
  CREATE_USER = "CREATE_USER",
  UPDATE_USER = "UPDATE_USER",
  DELETE_USER = "DELETE_USER",
  CHANGE_ROLE = "CHANGE_ROLE",

  // Patient Management
  CREATE_PATIENT = "CREATE_PATIENT",
  UPDATE_PATIENT = "UPDATE_PATIENT",
  DELETE_PATIENT = "DELETE_PATIENT",
  VIEW_PATIENT = "VIEW_PATIENT",

  // Medical Records
  CREATE_VITAL_SIGN = "CREATE_VITAL_SIGN",
  UPDATE_VITAL_SIGN = "UPDATE_VITAL_SIGN",
  DELETE_VITAL_SIGN = "DELETE_VITAL_SIGN",
  CREATE_MEDICAL_ANALYSIS = "CREATE_MEDICAL_ANALYSIS",
  UPDATE_MEDICAL_ANALYSIS = "UPDATE_MEDICAL_ANALYSIS",
  DELETE_MEDICAL_ANALYSIS = "DELETE_MEDICAL_ANALYSIS",

  // Alerts
  CREATE_ALERT = "CREATE_ALERT",
  UPDATE_ALERT = "UPDATE_ALERT",
  ACKNOWLEDGE_ALERT = "ACKNOWLEDGE_ALERT",
  RESOLVE_ALERT = "RESOLVE_ALERT",
  DELETE_ALERT = "DELETE_ALERT",

  // Questionnaires
  CREATE_QUESTIONNAIRE = "CREATE_QUESTIONNAIRE",
  UPDATE_QUESTIONNAIRE = "UPDATE_QUESTIONNAIRE",
  DELETE_QUESTIONNAIRE = "DELETE_QUESTIONNAIRE",
  SUBMIT_QUESTIONNAIRE = "SUBMIT_QUESTIONNAIRE",

  // Documents
  UPLOAD_DOCUMENT = "UPLOAD_DOCUMENT",
  UPDATE_DOCUMENT = "UPDATE_DOCUMENT",
  DELETE_DOCUMENT = "DELETE_DOCUMENT",
  DOWNLOAD_DOCUMENT = "DOWNLOAD_DOCUMENT",

  // Access Control
  GRANT_ACCESS = "GRANT_ACCESS",
  REVOKE_ACCESS = "REVOKE_ACCESS",

  // System
  EXPORT_DATA = "EXPORT_DATA",
  IMPORT_DATA = "IMPORT_DATA",
  SYSTEM_CONFIG = "SYSTEM_CONFIG",
}

export const AUDIT_ACTION_CATEGORIES = {
  AUTHENTICATION: [
    AuditActionType.LOGIN,
    AuditActionType.LOGOUT,
    AuditActionType.PASSWORD_RESET,
  ],
  USER_MANAGEMENT: [
    AuditActionType.CREATE_USER,
    AuditActionType.UPDATE_USER,
    AuditActionType.DELETE_USER,
    AuditActionType.CHANGE_ROLE,
  ],
  PATIENT_MANAGEMENT: [
    AuditActionType.CREATE_PATIENT,
    AuditActionType.UPDATE_PATIENT,
    AuditActionType.DELETE_PATIENT,
    AuditActionType.VIEW_PATIENT,
  ],
  MEDICAL_RECORDS: [
    AuditActionType.CREATE_VITAL_SIGN,
    AuditActionType.UPDATE_VITAL_SIGN,
    AuditActionType.DELETE_VITAL_SIGN,
    AuditActionType.CREATE_MEDICAL_ANALYSIS,
    AuditActionType.UPDATE_MEDICAL_ANALYSIS,
    AuditActionType.DELETE_MEDICAL_ANALYSIS,
  ],
  ALERTS: [
    AuditActionType.CREATE_ALERT,
    AuditActionType.UPDATE_ALERT,
    AuditActionType.ACKNOWLEDGE_ALERT,
    AuditActionType.RESOLVE_ALERT,
    AuditActionType.DELETE_ALERT,
  ],
  QUESTIONNAIRES: [
    AuditActionType.CREATE_QUESTIONNAIRE,
    AuditActionType.UPDATE_QUESTIONNAIRE,
    AuditActionType.DELETE_QUESTIONNAIRE,
    AuditActionType.SUBMIT_QUESTIONNAIRE,
  ],
  DOCUMENTS: [
    AuditActionType.UPLOAD_DOCUMENT,
    AuditActionType.UPDATE_DOCUMENT,
    AuditActionType.DELETE_DOCUMENT,
    AuditActionType.DOWNLOAD_DOCUMENT,
  ],
  ACCESS_CONTROL: [AuditActionType.GRANT_ACCESS, AuditActionType.REVOKE_ACCESS],
  SYSTEM: [
    AuditActionType.EXPORT_DATA,
    AuditActionType.IMPORT_DATA,
    AuditActionType.SYSTEM_CONFIG,
  ],
};

export const AUDIT_ENTITY_TYPES = {
  USER: "User",
  PATIENT: "Patient",
  VITAL_RECORD: "VitalRecord",
  ALERT: "Alert",
  QUESTIONNAIRE_TEMPLATE: "QuestionnaireTemplate",
  MEDICAL_DOCUMENT: "MedicalDocument",
  MEDICAL_ANALYSIS: "MedicalAnalysis",
  ACCESS_GRANT: "AccessGrant",
  EXPORT: "Export",
};

// Helper functions
export function getActionCategory(action: AuditActionType): string {
  for (const [category, actions] of Object.entries(AUDIT_ACTION_CATEGORIES)) {
    if (actions.includes(action)) {
      return category;
    }
  }
  return "UNKNOWN";
}

export function isDestructiveAction(action: AuditActionType): boolean {
  return action.includes("DELETE");
}

export function isModificationAction(action: AuditActionType): boolean {
  return action.includes("UPDATE");
}

export function isCreationAction(action: AuditActionType): boolean {
  return action.includes("CREATE");
}

export function getActionSeverity(
  action: AuditActionType
): "low" | "medium" | "high" | "critical" {
  if (isDestructiveAction(action)) {
    return action === AuditActionType.DELETE_PATIENT ? "critical" : "high";
  }
  if (isModificationAction(action)) return "medium";
  if (isCreationAction(action)) return "low";
  return "low";
}

export function getActionLabel(action: AuditActionType): string {
  const labels: Record<AuditActionType, string> = {
    [AuditActionType.LOGIN]: "Connexion",
    [AuditActionType.LOGOUT]: "Déconnexion",
    [AuditActionType.PASSWORD_RESET]: "Réinitialisation mot de passe",
    [AuditActionType.CREATE_USER]: "Création utilisateur",
    [AuditActionType.UPDATE_USER]: "Mise à jour utilisateur",
    [AuditActionType.DELETE_USER]: "Suppression utilisateur",
    [AuditActionType.CHANGE_ROLE]: "Modification de rôle",
    [AuditActionType.CREATE_PATIENT]: "Création patient",
    [AuditActionType.UPDATE_PATIENT]: "Modification patient",
    [AuditActionType.DELETE_PATIENT]: "Suppression patient",
    [AuditActionType.VIEW_PATIENT]: "Consultation patient",
    [AuditActionType.CREATE_VITAL_SIGN]: "Création signes vitaux",
    [AuditActionType.UPDATE_VITAL_SIGN]: "Modification signes vitaux",
    [AuditActionType.DELETE_VITAL_SIGN]: "Suppression signes vitaux",
    [AuditActionType.CREATE_MEDICAL_ANALYSIS]: "Création analyse médicale",
    [AuditActionType.UPDATE_MEDICAL_ANALYSIS]: "Modification analyse médicale",
    [AuditActionType.DELETE_MEDICAL_ANALYSIS]: "Suppression analyse médicale",
    [AuditActionType.CREATE_ALERT]: "Création alerte",
    [AuditActionType.UPDATE_ALERT]: "Modification alerte",
    [AuditActionType.ACKNOWLEDGE_ALERT]: "Accusé de réception alerte",
    [AuditActionType.RESOLVE_ALERT]: "Résolution alerte",
    [AuditActionType.DELETE_ALERT]: "Suppression alerte",
    [AuditActionType.CREATE_QUESTIONNAIRE]: "Création questionnaire",
    [AuditActionType.UPDATE_QUESTIONNAIRE]: "Modification questionnaire",
    [AuditActionType.DELETE_QUESTIONNAIRE]: "Suppression questionnaire",
    [AuditActionType.SUBMIT_QUESTIONNAIRE]: "Soumission questionnaire",
    [AuditActionType.UPLOAD_DOCUMENT]: "Téléchargement document",
    [AuditActionType.UPDATE_DOCUMENT]: "Modification document",
    [AuditActionType.DELETE_DOCUMENT]: "Suppression document",
    [AuditActionType.DOWNLOAD_DOCUMENT]: "Téléchargement document",
    [AuditActionType.GRANT_ACCESS]: "Attribution accès",
    [AuditActionType.REVOKE_ACCESS]: "Révocation accès",
    [AuditActionType.EXPORT_DATA]: "Export données",
    [AuditActionType.IMPORT_DATA]: "Import données",
    [AuditActionType.SYSTEM_CONFIG]: "Configuration système",
  };

  return labels[action] || action;
}
