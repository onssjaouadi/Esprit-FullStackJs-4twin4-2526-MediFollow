/**
 * MediFollow Platform - TypeScript Type Definitions
 * Generated from Prisma Schema
 * Date: March 2, 2026
 */

// ============================================
// ENUMS
// ============================================

export enum Role {
  PATIENT = "PATIENT",
  DOCTOR = "DOCTOR",
  NURSE = "NURSE",
  COORDINATOR = "COORDINATOR",
  ADMIN = "ADMIN",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum BloodType {
  A_POSITIVE = "A_POSITIVE",
  A_NEGATIVE = "A_NEGATIVE",
  B_POSITIVE = "B_POSITIVE",
  B_NEGATIVE = "B_NEGATIVE",
  AB_POSITIVE = "AB_POSITIVE",
  AB_NEGATIVE = "AB_NEGATIVE",
  O_POSITIVE = "O_POSITIVE",
  O_NEGATIVE = "O_NEGATIVE",
}

export enum Severity {
  MILD = "MILD",
  MODERATE = "MODERATE",
  SEVERE = "SEVERE",
}

export enum AlertType {
  VITAL = "VITAL",
  SYMPTOM = "SYMPTOM",
  MEDICATION = "MEDICATION",
  SYSTEM = "SYSTEM",
}

export enum AlertSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum AlertStatus {
  OPEN = "OPEN",
  ACKNOWLEDGED = "ACKNOWLEDGED",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

export enum BlockchainStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  FAILED = "FAILED",
}

export enum NotificationType {
  ALERT = "ALERT",
  REMINDER = "REMINDER",
  SYSTEM = "SYSTEM",
  MESSAGE = "MESSAGE",
}

export enum NotificationChannel {
  IN_APP = "IN_APP",
  EMAIL = "EMAIL",
  SMS = "SMS",
  PUSH = "PUSH",
}

// ============================================
// EMBEDDED TYPES (NO DEPENDENCIES)
// ============================================

export type Address = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type EmergencyContact = {
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
};

export type Medication = {
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date | null;
  notes?: string;
};

export type VitalRange = {
  min: number;
  max: number;
};

export type VitalThresholds = {
  systolicBP: VitalRange;
  diastolicBP: VitalRange;
  heartRate: VitalRange;
  temperature: VitalRange;
  oxygenSaturation: VitalRange;
  weight?: VitalRange;
};

// ============================================
// BASE MODEL TYPES (NO RELATIONS)
// ============================================

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: Role;
  phoneNumber?: string | null;
  isActive: boolean;
  lastLogin?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SafeUser = Omit<User, "passwordHash">;

export type VitalRecord = {
  id: string;
  patientId: string;
  systolicBP?: number | null;
  diastolicBP?: number | null;
  heartRate?: number | null;
  temperature?: number | null;
  oxygenSaturation?: number | null;
  weight?: number | null;
  notes?: string | null;
  recordedAt: Date;
  blockchainTxHash?: string | null;
  createdAt: Date;
};

export type Symptom = {
  id: string;
  patientId: string;
  symptomType: string;
  severity: Severity;
  description: string;
  occurredAt: Date;
  createdAt: Date;
};

export type Alert = {
  id: string;
  patientId: string;
  triggeredById?: string | null;
  alertType: AlertType;
  severity: AlertSeverity;
  message: string;
  data?: any | null;
  status: AlertStatus;
  acknowledgedById?: string | null;
  acknowledgedAt?: Date | null;
  resolvedById?: string | null;
  resolvedAt?: Date | null;
  resolution?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Patient = {
  id: string;
  userId: string;
  medicalRecordNumber: string;
  dateOfBirth: Date;
  gender: Gender;
  bloodType?: BloodType | null;
  address?: Address | null;
  emergencyContact?: EmergencyContact | null;
  dischargeDate?: Date | null;
  diagnosis?: string | null;
  medications: Medication[];
  vitalThresholds?: VitalThresholds | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// ============================================
// TYPES WITH RELATIONS
// ============================================

export type PatientWithUser = Patient & {
  user: SafeUser;
  vitalRecords?: VitalRecord[];
  alerts?: Alert[];
  symptoms?: Symptom[];
};

export type UserWithPatient = User & {
  patient?: Patient | null;
};

export type PatientWithRelations = Patient & {
  user: SafeUser;
  vitalRecords?: VitalRecord[];
  alerts?: Alert[];
  symptoms?: Symptom[];
};

export type VitalRecordWithPatient = VitalRecord & {
  patient: PatientWithUser;
};

export type AlertWithRelations = Alert & {
  patient: PatientWithUser;
  triggeredBy?: SafeUser | null;
  acknowledgedBy?: SafeUser | null;
  resolvedBy?: SafeUser | null;
};

// ============================================
// CREATE INPUT TYPES
// ============================================

export type UserCreateInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: Role;
  phoneNumber?: string;
};

export type UserUpdateInput = Partial<
  Omit<User, "id" | "passwordHash" | "createdAt">
>;

export type PatientCreateInput = {
  userId: string;
  medicalRecordNumber: string;
  dateOfBirth: Date;
  gender: Gender;
  bloodType?: BloodType;
  address?: Address;
  emergencyContact?: EmergencyContact;
  dischargeDate?: Date;
  diagnosis?: string;
  medications?: Medication[];
  vitalThresholds?: VitalThresholds;
};

export type VitalRecordCreateInput = {
  patientId: string;
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  weight?: number;
  notes?: string;
  recordedAt?: Date;
};

export type SymptomCreateInput = {
  patientId: string;
  symptomType: string;
  severity: Severity;
  description: string;
  occurredAt?: Date;
};

export type AlertCreateInput = {
  patientId: string;
  triggeredById?: string;
  alertType: AlertType;
  severity: AlertSeverity;
  message: string;
  data?: any;
};

export type AlertUpdateInput = {
  status?: AlertStatus;
  acknowledgedById?: string;
  acknowledgedAt?: Date;
  resolvedById?: string;
  resolvedAt?: Date;
  resolution?: string;
};

// ============================================
// SERVICE TYPES
// ============================================

export type Service = {
  id: string;
  serviceName: string;
  description?: string | null;
  consultationFee?: number | null;
  averageDuration?: number | null;
  isActive: boolean;
  specializations: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type ServiceCreateInput = {
  serviceName: string;
  description?: string;
  consultationFee?: number;
  averageDuration?: number;
  specializations?: string[];
};

// ============================================
// QUESTIONNAIRE TYPES
// ============================================

export type Questionnaire = {
  id: string;
  patientId: string;
  questionnaireType: string;
  responses: any;
  overallScore?: number | null;
  completedAt: Date;
  createdAt: Date;
};

export type QuestionnaireCreateInput = {
  patientId: string;
  questionnaireType: string;
  responses: any;
  overallScore?: number;
};

// ============================================
// AUDIT LOG TYPES
// ============================================

export type AuditLog = {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  changes?: any | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  blockchainTxHash?: string | null;
  timestamp: Date;
};

export type AuditLogCreateInput = {
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
  blockchainTxHash?: string;
};

// ============================================
// BLOCKCHAIN PROOF TYPES
// ============================================

export type BlockchainProof = {
  id: string;
  dataHash: string;
  txHash: string;
  blockchainNetwork: string;
  blockNumber?: number | null;
  timestamp: Date;
  status: BlockchainStatus;
  vitalRecordId?: string | null;
  auditLogId?: string | null;
};

export type BlockchainProofCreateInput = {
  dataHash: string;
  txHash: string;
  blockchainNetwork?: string;
  blockNumber?: number;
  status?: BlockchainStatus;
  vitalRecordId?: string;
  auditLogId?: string;
};

// ============================================
// NOTIFICATION TYPES
// ============================================

export type Notification = {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any | null;
  isRead: boolean;
  readAt?: Date | null;
  sentVia: NotificationChannel[];
  createdAt: Date;
};

export type NotificationCreateInput = {
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  sentVia: NotificationChannel[];
};

// ============================================
// SESSION TYPES
// ============================================

export type Session = {
  id: string;
  userId: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type SessionCreateInput = {
  userId: string;
  refreshToken: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
};

// ============================================
// AUTH TYPES
// ============================================

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: Role;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResponse = {
  user: SafeUser;
  tokens: TokenPair;
};

export type JWTPayload = {
  userId: string;
  email: string;
  role: Role;
};

// ============================================
// API RESPONSE TYPES
// ============================================

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T = any> = ApiResponse<{
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>;

// ============================================
// DASHBOARD STATS TYPES
// ============================================

export type PatientDashboardStats = {
  latestVitals?: VitalRecord | null;
  statusIndicator: "normal" | "warning" | "critical";
  openAlertsCount: number;
  vitalsLast7Days: VitalRecord[];
  upcomingReminders: Notification[];
};

export type DoctorDashboardStats = {
  totalPatients: number;
  activeAlerts: number;
  criticalAlerts: number;
  patientsWithAbnormalVitals: number;
  recentVitals: VitalRecord[];
};

export type AdminDashboardStats = {
  totalUsers: number;
  totalPatients: number;
  totalDoctors: number;
  totalAlerts: number;
  criticalAlerts: number;
  vitalRecordsToday: number;
  pendingBlockchainProofs: number;
  activeProofs: number;
  failedProofs: number;
};

// ============================================
// FORM VALIDATION TYPES
// ============================================

export type VitalRecordFormData = {
  systolicBP?: string;
  diastolicBP?: string;
  heartRate?: string;
  temperature?: string;
  oxygenSaturation?: string;
  weight?: string;
  notes?: string;
  recordedAt?: string;
};

export type SymptomFormData = {
  symptomType: string;
  severity: Severity;
  description: string;
  occurredAt?: string;
};

export type PatientFormData = {
  // Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth: string;
  gender: Gender;
  bloodType?: BloodType;

  // Medical Info
  medicalRecordNumber: string;
  diagnosis?: string;
  dischargeDate?: string;

  // Address
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;

  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  emergencyContactEmail?: string;

  // Vital Thresholds
  systolicMin?: string;
  systolicMax?: string;
  diastolicMin?: string;
  diastolicMax?: string;
  heartRateMin?: string;
  heartRateMax?: string;
  temperatureMin?: string;
  temperatureMax?: string;
  spo2Min?: string;
  spo2Max?: string;
};
