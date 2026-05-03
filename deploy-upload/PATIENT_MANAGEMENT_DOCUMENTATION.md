# MediFollow Patient Management System - Comprehensive Documentation

## Overview

MediFollow is a comprehensive patient management system built with Next.js, Prisma, and blockchain integration (Aptos). The system provides patient-centric healthcare management with vital tracking, appointment management, medical analysis, alerts, and blockchain-based access control.

---

## Table of Contents

1. [Server Actions (lib/actions/)](#server-actions)
2. [Patient Dashboard & Pages (app/dashboard/patient/)](#patient-dashboard)
3. [API Routes (app/api/)](#api-routes)
4. [Key Features & Capabilities](#features)
5. [Data Models & Types](#data-models)
6. [Patient Components](#components)

---

## Server Actions (lib/actions/)

Server actions are Next.js server-side functions that handle core patient management operations.

### 1. **patient.actions.ts** - Patient Profile & Data Management

#### Core Functions:

| Function                        | Purpose                                                      | Parameters                           | Returns                                  |
| ------------------------------- | ------------------------------------------------------------ | ------------------------------------ | ---------------------------------------- |
| `getPatientByUserId()`          | Retrieve patient by user ID                                  | `userId: string`                     | `PatientWithUser \| null`                |
| `getPatientById()`              | Retrieve patient by patient ID                               | `patientId: string`                  | `PatientWithUser \| null`                |
| `getPatientWithRelations()`     | Get patient with all related data (vitals, alerts, symptoms) | `patientId: string`                  | `PatientWithRelations \| null`           |
| `getAllPatients()`              | Get all active patients (for doctors/admins)                 | -                                    | `PatientWithUser[]`                      |
| `getAllPatientsWithAllVitals()` | Get all patients with complete vital records                 | -                                    | `PatientWithUser[]`                      |
| `createPatient()`               | Create new patient record                                    | `PatientCreateInput`                 | `PatientWithUser`                        |
| `updatePatient()`               | Update patient information                                   | `patientId: string, data: object`    | `PatientWithUser`                        |
| `deactivatePatient()`           | Deactivate patient account                                   | `patientId: string`                  | `{ success: boolean }`                   |
| `searchPatients()`              | Search patients by name or email                             | `query: string`                      | `PatientWithUser[]`                      |
| `getDashboardStats()`           | Get comprehensive dashboard statistics                       | -                                    | `DashboardStats`                         |
| `getPatientProfile()`           | Get patient profile with user data                           | `userId: string`                     | `PatientProfile`                         |
| `updatePatientProfile()`        | Update patient profile information                           | `userId: string, formData: FormData` | `{ success: boolean, patient: Patient }` |
| `uploadPatientProfileImage()`   | Upload patient profile picture                               | `userId: string, formData: FormData` | `{ success: boolean, imageUrl: string }` |

**Capabilities:**

- Full patient CRUD operations
- Profile management with image uploads
- Patient data with user relationships
- Bulk patient retrieval for administrative views
- Dashboard statistics aggregation
- Patient search and filtering

---

### 2. **vital.actions.ts** - Vital Signs Tracking

#### Core Functions:

| Function                 | Purpose                             | Parameters                              | Returns                                          |
| ------------------------ | ----------------------------------- | --------------------------------------- | ------------------------------------------------ |
| `createVitalRecord()`    | Record new vital signs              | `patientId: string, formData: FormData` | `{ success: boolean, vitalRecord: VitalRecord }` |
| `getVitalRecords()`      | Get vital history with limit        | `patientId: string, limit?: number`     | `VitalRecord[]`                                  |
| `getLatestVitalRecord()` | Get most recent vital record        | `patientId: string`                     | `VitalRecord \| null`                            |
| `getVitalRecordById()`   | Get specific vital record           | `id: string`                            | `VitalRecord \| null`                            |
| `deleteVitalRecord()`    | Delete vital record                 | `id: string`                            | `{ success: boolean }`                           |
| `updateVitalRecord()`    | Update vital record                 | `id: string, formData: FormData`        | `{ success: boolean, vitalRecord: VitalRecord }` |
| `getVitalStats()`        | Get vital statistics for date range | `patientId: string, days?: number`      | `VitalStats`                                     |

**Vital Signs Tracked:**

- Systolic Blood Pressure (mmHg)
- Diastolic Blood Pressure (mmHg)
- Heart Rate (bpm)
- Temperature (°C)
- Oxygen Saturation (%)
- Weight (kg)
- Notes/Comments

**Capabilities:**

- Real-time vital entry and validation
- Historical vital records retrieval
- Custom threshold checking
- Automatic alert generation on abnormal values
- Vital statistics calculation
- Trend analysis data

---

### 3. **alert.actions.ts** - Alert & Threshold Management

#### Core Functions:

| Function                 | Purpose                                           | Parameters                                        | Returns                                 |
| ------------------------ | ------------------------------------------------- | ------------------------------------------------- | --------------------------------------- |
| `checkVitalThresholds()` | Check vital values against patient thresholds     | `vitalRecord: VitalRecord`                        | Alerts created if needed                |
| `getPatientAlerts()`     | Retrieve patient alerts                           | `patientId: string`                               | `{ success: boolean, alerts: Alert[] }` |
| `getAllAlerts()`         | Get all system alerts with optional status filter | `status?: AlertStatus`                            | `Alert[]`                               |
| `acknowledgeAlert()`     | Mark alert as acknowledged                        | `alertId: string, userId: string`                 | `{ success: boolean, alert: Alert }`    |
| `resolveAlert()`         | Resolve/close alert                               | `alertId: string, userId: string, notes?: string` | `{ success: boolean, alert: Alert }`    |
| `getAlertStats()`        | Get alert statistics                              | -                                                 | `AlertStats`                            |

**Alert Types:**

- `VITAL` - Abnormal vital sign values
- `SYMPTOM` - Reported symptoms
- `MEDICATION` - Medication-related
- `SYSTEM` - System notifications

**Alert Severity Levels:**

- `CRITICAL` - Immediate attention required
- `HIGH` - Urgent attention
- `MEDIUM` - Standard attention
- `LOW` - Informational

**Alert Statuses:**

- `OPEN` - Active/unhandled
- `ACKNOWLEDGED` - Staff notified
- `RESOLVED` - Issue addressed
- `CLOSED` - Archived

**Capabilities:**

- Automatic threshold-based alerts
- Multi-level severity classification
- Alert lifecycle management
- Alert statistics and reporting
- Patient-specific threshold configuration

---

### 4. **appointment.actions.ts** - Appointment Management

#### Core Functions:

| Function                     | Purpose                                       | Parameters                | Returns                                                   |
| ---------------------------- | --------------------------------------------- | ------------------------- | --------------------------------------------------------- |
| `createAppointment()`        | Create new appointment                        | `CreateAppointmentParams` | `Appointment`                                             |
| `getRecentAppointmentList()` | Get recent appointments with status breakdown | -                         | `{ documents: Appointment[], counts: AppointmentCounts }` |

**Appointment Statuses:**

- `scheduled` - Confirmed appointment
- `pending` - Awaiting confirmation
- `cancelled` - Cancelled appointment

**Capabilities:**

- Appointment creation and scheduling
- Status tracking (scheduled, pending, cancelled)
- Appointment history
- Appointment count statistics

---

### 5. **analysis.actions.ts** - Medical Analysis/Lab Tests

#### Core Functions:

| Function                   | Purpose                        | Parameters                       | Returns                                           |
| -------------------------- | ------------------------------ | -------------------------------- | ------------------------------------------------- |
| `createMedicalAnalysis()`  | Create medical analysis record | `formData: FormData`             | `{ success: boolean, analysis: MedicalAnalysis }` |
| `updateMedicalAnalysis()`  | Update analysis record         | `id: string, formData: FormData` | `{ success: boolean, analysis: MedicalAnalysis }` |
| `deleteMedicalAnalysis()`  | Delete analysis record         | `id: string`                     | `{ success: boolean }`                            |
| `getAllMedicalAnalyses()`  | Get all analyses               | -                                | `MedicalAnalysis[]`                               |
| `getPatientAnalyses()`     | Get patient's analyses         | `patientId: string`              | `MedicalAnalysis[]`                               |
| `getMedicalAnalysisById()` | Get specific analysis          | `id: string`                     | `MedicalAnalysis \| null`                         |

**Analysis Fields:**

- Analysis Type (e.g., blood work, imaging)
- Test Name
- Result Summary
- Analysis Date
- Laboratory Name
- Doctor Notes
- Abnormality Flag
- Associated Documents

**Capabilities:**

- Lab test and analysis recording
- Result documentation
- Doctor annotations
- Document attachment
- Analysis history

---

### 6. **patient-access.actions.ts** - Access Control Management

#### Core Functions:

| Function                       | Purpose                                             | Parameters                                                      | Returns                                             |
| ------------------------------ | --------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------- |
| `getDoctorsWithAccessStatus()` | Get all doctors and their access status for patient | `patientUserId: string`                                         | `{ success: boolean, doctors: DoctorWithAccess[] }` |
| `grantAccessToDoctor()`        | Grant doctor access to patient data                 | `patientUserId: string, doctorId: string, durationDays: number` | `{ success: boolean, access: AccessGrant }`         |
| `revokeAccessFromDoctor()`     | Revoke doctor's access                              | `patientUserId: string, doctorId: string`                       | `{ success: boolean }`                              |

**Access Control Features:**

- Doctor permission management
- Time-limited access grants
- Access status tracking
- Blockchain verification integration

**Capabilities:**

- Granular patient-doctor access control
- Temporary access grants
- Access history tracking
- Blockchain-verified permissions

---

### 7. **blockchain-access.actions.ts** - Blockchain-Based Access Control

#### Core Functions:

| Function                    | Purpose                             | Parameters                                                  | Returns                                        |
| --------------------------- | ----------------------------------- | ----------------------------------------------------------- | ---------------------------------------------- |
| `initializeAccessControl()` | Initialize blockchain access system | -                                                           | `{ success: boolean }`                         |
| `grantDoctorAccess()`       | Grant blockchain-verified access    | `patientId: string, doctorId: string, durationDays: number` | `{ success: boolean, txHash: string }`         |
| `revokeDoctorAccess()`      | Revoke blockchain-verified access   | `patientId: string, doctorId: string`                       | `{ success: boolean, txHash: string }`         |
| `verifyDoctorAccess()`      | Verify doctor has valid access      | `patientId: string, doctorId: string`                       | `{ success: boolean, hasAccess: boolean }`     |
| `logDataAccess()`           | Log data access event on blockchain | `patientId: string, doctorId: string, dataType: string`     | `{ success: boolean, txHash: string }`         |
| `getPermissionDetails()`    | Get blockchain permission details   | `patientId: string, doctorId: string`                       | `{ success: boolean, permission: Permission }` |
| `generateUserWallet()`      | Generate blockchain wallet          | -                                                           | `{ address: string, privateKey: string }`      |
| `assignWalletToUser()`      | Assign wallet to user               | `userId: string, walletAddress: string`                     | `{ success: boolean }`                         |
| `assignWalletsToAllUsers()` | Bulk wallet assignment              | -                                                           | `{ success: boolean, count: number }`          |

**Blockchain Network:** Aptos (Testnet/Mainnet configurable)

**Capabilities:**

- Decentralized access control
- Smart contract-based permissions
- Immutable access audit log
- Time-locked access grants
- Wallet integration
- Transaction verification

---

### 8. **medical-form.actions.ts** - Medical Forms Management

#### Core Functions:

| Function                | Purpose                    | Parameters                                          | Returns                                      |
| ----------------------- | -------------------------- | --------------------------------------------------- | -------------------------------------------- |
| `getDoctorForms()`      | Get doctor's forms         | `doctorId: string`                                  | `{ success: boolean, forms: MedicalForm[] }` |
| `getMedicalForm()`      | Get specific form          | `formId: string, doctorId: string`                  | `{ success: boolean, form: MedicalForm }`    |
| `createMedicalForm()`   | Create custom medical form | `doctorId: string, CreateFormInput`                 | `{ success: boolean, form: MedicalForm }`    |
| `updateMedicalForm()`   | Update form                | `formId: string, doctorId: string, UpdateFormInput` | `{ success: boolean, form: MedicalForm }`    |
| `deleteMedicalForm()`   | Delete form                | `formId: string, doctorId: string`                  | `{ success: boolean }`                       |
| `getFormCheckupCount()` | Get form usage count       | `formId: string`                                    | `{ success: boolean, count: number }`        |

**Form Field Types:**

- Text fields
- Number fields
- Textarea
- Select dropdowns
- Checkboxes
- Date fields

**Capabilities:**

- Custom form creation
- Field configuration
- Form categorization
- Usage tracking
- Doctor-specific forms

---

### 9. **settings.actions.ts** - User Settings & Account Management

#### Core Functions:

| Function              | Purpose                      | Parameters           | Returns                            |
| --------------------- | ---------------------------- | -------------------- | ---------------------------------- |
| `updateUserProfile()` | Update user profile settings | `formData: FormData` | `{ success: boolean, user: User }` |
| `changePassword()`    | Change user password         | `formData: FormData` | `{ success: boolean }`             |
| `deactivateAccount()` | Deactivate user account      | `formData: FormData` | `{ success: boolean }`             |

**Capabilities:**

- Profile updates
- Password management
- Account deactivation
- Security settings

---

### 10. **azure-storage.actions.ts** - Document Management

#### Core Functions:

| Function                    | Purpose                  | Parameters                             | Returns                                                 |
| --------------------------- | ------------------------ | -------------------------------------- | ------------------------------------------------------- |
| `uploadToAzureStorage()`    | Upload document to Azure | `formData: FormData, category: string` | `{ success: boolean, documentId: string, url: string }` |
| `getCurrentUserDocuments()` | Get user's documents     | `userId: string`                       | `{ success: boolean, data: Document[] }`                |
| `deleteDocument()`          | Delete document          | `documentId: string`                   | `{ success: boolean }`                                  |
| `getDocumentDownloadUrl()`  | Get secure download URL  | `documentId: string`                   | `{ success: boolean, data: string }`                    |

**Supported Document Categories:**

- Lab results
- Medical reports
- Prescriptions
- Imaging studies
- Clinical notes
- Other medical documents

**Capabilities:**

- Cloud storage integration
- Document categorization
- Secure access URLs
- Document deletion
- Upload management

---

### 11. **password-reset.actions.ts** - Authentication

#### Core Functions:

| Function                 | Purpose                      | Parameters           | Returns                                 |
| ------------------------ | ---------------------------- | -------------------- | --------------------------------------- |
| `requestPasswordReset()` | Request password reset token | `formData: FormData` | `{ success: boolean, message: string }` |
| `verifyResetToken()`     | Verify reset token validity  | `token: string`      | `{ success: boolean, email?: string }`  |
| `resetPassword()`        | Reset password with token    | `formData: FormData` | `{ success: boolean }`                  |

**Capabilities:**

- Secure password reset flow
- Token generation and verification
- Email-based verification

---

### 12. **medassist.actions.ts** - AI Medical Assistant

#### Core Functions:

| Function                     | Purpose                                  | Parameters          | Returns                                         |
| ---------------------------- | ---------------------------------------- | ------------------- | ----------------------------------------------- |
| `getPatientMedicalContext()` | Get comprehensive patient context for AI | `patientId: string` | `{ success: boolean, context: MedicalContext }` |
| `getDoctorPatientsList()`    | Get doctor's patient list for AI         | -                   | `{ success: boolean, patients: Patient[] }`     |

**Capabilities:**

- AI-powered medical insights
- Patient context aggregation
- Doctor patient management

---

## Patient Dashboard (app/dashboard/patient/)

### Dashboard Structure

The patient dashboard is organized into the following sections:

```
/dashboard/patient/
├── page.tsx                 # Main dashboard home
├── profile/
│   └── page.tsx            # Patient profile management
├── vitals/
│   └── page.tsx            # Vital signs tracking
├── appointments/
│   └── page.tsx            # Appointment management
├── alerts/
│   └── page.tsx            # Alert center
├── reports/
│   └── page.tsx            # Medical documents & reports
├── history/
│   └── page.tsx            # Complete activity history
├── access/
│   └── page.tsx            # Doctor access management
├── settings/
│   └── page.tsx            # User preferences
└── layout.tsx              # Navigation layout
```

---

### 1. **Profile Page** (`/dashboard/patient/profile`)

**Features:**

- Personal information display and editing
- Profile image upload and management
- Blood type tracking
- Emergency contact information
- Address management
- Face enrollment for biometric authentication
- Vital threshold configuration
- Medical history notes

**Key Components:**

- `FaceEnrollModal` - Biometric enrollment
- Profile image crop and zoom
- Blood type selector
- Emergency contact form

**Capabilities:**

- Complete profile customization
- Biometric security setup
- Medical metadata management

---

### 2. **Vitals Page** (`/dashboard/patient/vitals`)

**Features:**

- Create new vital record entry
- View vital history
- Blood pressure tracking (systolic/diastolic)
- Heart rate monitoring
- Temperature recording
- Oxygen saturation tracking
- Weight management
- Add notes to vital entries

**Key Components:**

- Vital record form
- Vital history list
- Status indicators (normal/warning/critical)
- Vital trending graphs

**Page Workflow:**

1. Patient records vital signs
2. System validates against thresholds
3. Automatic alert generation if abnormal
4. Doctor notification if critical values
5. Historical data available for review

**Capabilities:**

- Real-time vital recording
- Threshold-based alerts
- Vital trend analysis
- Multi-vital support

---

### 3. **Appointments Page** (`/dashboard/patient/appointments`)

**Features:**

- View upcoming appointments
- See past appointments
- Appointment details (doctor, time, location)
- Appointment status tracking
- Filter by status (scheduled, completed, cancelled)
- Contact doctor information
- Video consultation links (if applicable)
- Appointment notes

**Appointment Information:**

- Doctor name and specialty
- Appointment date and time
- Location or video link
- Appointment type (consultation, follow-up, etc.)
- Doctor contact details
- Status badges

**Capabilities:**

- Appointment visibility
- Status tracking
- Doctor contact management
- Appointment history

---

### 4. **Alerts Page** (`/dashboard/patient/alerts`)

**Features:**

- View all active and historical alerts
- Alert severity indicators
- Alert type classification
- Acknowledge alert receipt
- Alert resolution tracking
- Filter by severity/status
- Alert timeline
- Alert details and context

**Alert Information Display:**

- Alert type (vital, symptom, medication, system)
- Severity level (critical, high, medium, low)
- Status (open, acknowledged, resolved)
- Affected vital sign (if applicable)
- Value that triggered alert
- Date and time
- Associated patient threshold

**Capabilities:**

- Comprehensive alert management
- Alert lifecycle tracking
- Multi-severity alerts
- Alert filtering and search

---

### 5. **Reports Page** (`/dashboard/patient/reports`)

**Features:**

- Upload medical documents
- View document library
- Download reports
- Preview documents
- Categorize documents
- Delete documents
- Document search
- File organization

**Supported Document Types:**

- Lab results
- Medical reports
- Prescriptions
- Imaging studies
- Clinical notes
- Pathology reports
- Other medical documents

**Document Management:**

- Upload with category assignment
- File preview
- Download functionality
- Cloud storage (Azure)
- Document deletion
- Category filtering

**Capabilities:**

- Cloud-based document storage
- Document categorization
- Secure access management
- Full document lifecycle

---

### 6. **History Page** (`/dashboard/patient/history`)

**Features:**

- Complete activity timeline
- Multiple event types:
  - Vital measurements
  - Appointments
  - Medical reports
  - Alert events
  - Medication changes
  - Diagnostic tests
- Search functionality across history
- Filter by event type
- Chronological sorting
- Event details on click

**Timeline Event Types:**

- Vital sign measurements
- Appointment records
- Lab analysis results
- Alert triggers
- Report uploads
- Doctor consultations
- System events

**Capabilities:**

- Comprehensive activity logging
- Multi-type event tracking
- Historical search and filtering
- Temporal analysis

---

### 7. **Access Control Page** (`/dashboard/patient/access`)

**Features:**

- View list of doctors with access
- Grant doctor access to data
- Revoke access permissions
- Set access duration (30 days, 90 days, 6 months, 1 year)
- View access status for each doctor
- Blockchain access verification
- Access transaction tracking
- Doctor wallet information

**Access Control Elements:**

- Doctor list with specialties
- Access status (active/inactive)
- Grant/revoke buttons
- Duration selection
- Blockchain transaction hash display
- Access expiration dates

**Blockchain Integration:**

- Aptos blockchain verification
- Smart contract-based permissions
- Immutable access log
- Transaction hash storage
- Time-locked access grants

**Capabilities:**

- Granular access control
- Time-limited permissions
- Blockchain-verified trust
- Access audit trail

---

### 8. **Settings Page** (`/dashboard/patient/settings`)

**Features:**

- Profile information editing
- Password change
- Notification preferences
- Account preferences
- Privacy settings
- Account deactivation option

**Settings Sections:**

1. **Profile Settings**
   - Name, email, phone
   - Address and location
   - Date of birth
   - Medical information

2. **Notification Settings**
   - Email alerts
   - SMS alerts
   - Appointment reminders
   - Vital value alerts
   - Medical report notifications

3. **Security Settings**
   - Password management
   - Two-factor authentication (if enabled)
   - Session management

4. **Account Management**
   - Account deactivation
   - Data export
   - Privacy preferences

**Capabilities:**

- User preference management
- Security configuration
- Communication settings

---

## API Routes (app/api/)

### Patient API Endpoints

#### GET `/api/patient/me`

- **Purpose:** Get current patient ID
- **Authentication:** Required
- **Response:** `{ patientId: string | null }`
- **Use Cases:** Patient identification, context loading

---

## Key Features & Capabilities

### 1. **Vital Signs Management**

- ✅ Real-time vital recording
- ✅ Multi-vital support (BP, HR, Temp, O2, Weight)
- ✅ Historical tracking
- ✅ Threshold-based alerts
- ✅ Vital statistics calculation
- ✅ Trend analysis
- ✅ Doctor review workflow

### 2. **Alert System**

- ✅ Automatic threshold monitoring
- ✅ Multi-type alerts (vital, symptom, medication, system)
- ✅ Severity classification
- ✅ Alert acknowledgment workflow
- ✅ Resolution tracking
- ✅ Alert history
- ✅ Patient and doctor notifications

### 3. **Patient Profile Management**

- ✅ Comprehensive profile data
- ✅ Blood type and medical history
- ✅ Emergency contact information
- ✅ Address and location
- ✅ Profile image upload
- ✅ Biometric data (face enrollment)
- ✅ Medical preferences
- ✅ Vital thresholds customization

### 4. **Appointment Management**

- ✅ Appointment scheduling
- ✅ Status tracking
- ✅ Doctor information
- ✅ Location/virtual meeting details
- ✅ Appointment history
- ✅ Appointment filtering

### 5. **Medical Analysis & Lab Results**

- ✅ Lab test recording
- ✅ Imaging study documentation
- ✅ Result aggregation
- ✅ Doctor annotations
- ✅ Abnormality flagging
- ✅ Document attachment
- ✅ Analysis history

### 6. **Document Management**

- ✅ Cloud storage (Azure)
- ✅ Document categorization
- ✅ Upload/download functionality
- ✅ Preview capabilities
- ✅ Secure access control
- ✅ Document search
- ✅ File organization

### 7. **Access Control**

- ✅ Patient-controlled access grants
- ✅ Time-limited permissions
- ✅ Doctor-specific access
- ✅ Access revocation
- ✅ Multi-level granularity

### 8. **Blockchain Integration** (Aptos)

- ✅ Decentralized access control
- ✅ Immutable permission logging
- ✅ Smart contract verification
- ✅ Wallet management
- ✅ Transaction tracking
- ✅ Access audit trail

### 9. **Security Features**

- ✅ Role-based access control
- ✅ Patient data isolation
- ✅ Encryption (password)
- ✅ Password reset flow
- ✅ Account deactivation
- ✅ Biometric authentication
- ✅ Blockchain verification

### 10. **AI Integration (MedAssist)**

- ✅ Patient medical context compilation
- ✅ Doctor patient list management
- ✅ AI-powered insights
- ✅ Medical knowledge integration

### 11. **Notification System**

- ✅ Alert notifications
- ✅ Appointment reminders
- ✅ System notifications
- ✅ Multiple channels (in-app, email, SMS)
- ✅ User preference control

### 12. **Dashboard & Analytics**

- ✅ Dashboard statistics
- ✅ Alert statistics
- ✅ Vital statistics
- ✅ Activity tracking
- ✅ Health metrics overview

---

## Data Models & Types

### Key Enums

**Role**

- `PATIENT` - Patient user
- `DOCTOR` - Healthcare provider
- `ADMIN` - System administrator

**Gender**

- `MALE`, `FEMALE`, `OTHER`

**Blood Type**

- A+, A-, B+, B-, AB+, AB-, O+, O-

**Alert Types**

- `VITAL` - Abnormal vital signs
- `SYMPTOM` - Reported symptoms
- `MEDICATION` - Medication alerts
- `SYSTEM` - System messages

**Alert Severity**

- `CRITICAL` - Immediate action
- `HIGH` - Urgent attention
- `MEDIUM` - Standard attention
- `LOW` - Informational

**Alert Status**

- `OPEN` - Unhandled
- `ACKNOWLEDGED` - Received
- `RESOLVED` - Fixed
- `CLOSED` - Archived

### Core Data Types

**Patient**

- id, userId, dateOfBirth, gender, bloodType
- address, emergencyContact, medications
- vitalThresholds, medicalHistory, allergies
- insurance, isActive, createdAt, updatedAt

**VitalRecord**

- id, patientId, systolicBP, diastolicBP
- heartRate, temperature, oxygenSaturation, weight
- notes, recordedAt, createdAt, updatedAt

**Alert**

- id, patientId, alertType, severity
- status, message, data, createdAt, updatedAt

**AccessGrant**

- id, patientId, doctorId, isActive
- grantedAt, expiresAt, txHashGrant

**MedicalAnalysis**

- id, patientId, analysisType, testName
- resultSummary, analysisDate, laboratory
- doctorNotes, status, isAbnormal, documentIds

---

## Patient Components

### UI Components Used

| Component                | Purpose                        |
| ------------------------ | ------------------------------ |
| `VitalModal`             | Modal for entering vital signs |
| `AnalysisModal`          | Create/edit medical analysis   |
| `AppointmentModal`       | Appointment management         |
| `FaceEnrollModal`        | Biometric enrollment           |
| `FaceLoginModal`         | Biometric authentication       |
| `FileUploadMedical`      | Document upload                |
| `StatusBadge`            | Status indicators              |
| `StatCard`               | Statistics display             |
| `PatientDocumentsViewer` | Document preview               |

### Form Components

- `CustomFormField` - Dynamic form field rendering
- `SubmitButton` - Form submission handling
- `FileUploader` - File upload handling

---

## Security & Privacy

### Access Control Layers

1. **Role-based** - Patient/Doctor/Admin roles
2. **Patient-controlled** - Patient grants doctor access
3. **Time-limited** - Access expires automatically
4. **Blockchain-verified** - Immutable permission log
5. **Audit trail** - All data access logged

### Data Protection

- Password hashing (bcryptjs)
- Encrypted private keys for blockchain
- HTTPS/TLS for all communications
- Azure secure storage for documents
- Role isolation at database level

---

## Integration Points

### External Services

- **Appwrite** - Backend-as-a-Service (Appointments)
- **Azure Storage** - Document storage
- **Aptos Blockchain** - Access control
- **Email Service** - Notifications and password reset
- **SMS Service** - Alert notifications (configurable)

---

## Common Workflows

### New Patient Vital Entry Workflow

1. Patient navigates to Vitals page
2. Clicks "New Vital Record"
3. Enters vital measurements
4. System validates values
5. Record saved to database
6. Thresholds checked
7. Alerts generated if abnormal
8. Doctor notified if critical
9. History updated

### Doctor Access Grant Workflow

1. Patient goes to Access Control page
2. Selects doctor from available list
3. Chooses access duration
4. Clicks grant access
5. System creates AccessGrant record
6. Blockchain transaction initiated
7. Confirmation shown to patient
8. Doctor gains access to patient data
9. Access expires automatically

### Document Upload Workflow

1. Patient navigates to Reports page
2. Clicks upload button
3. Selects file and category
4. File uploaded to Azure Storage
5. Record created in database
6. URL generated for access
7. Document searchable and viewable
8. Can be downloaded or deleted

---

## Summary Statistics

### Server Actions

- **14 action files** in `lib/actions/`
- **50+ exported functions** across all actions
- **Patient management** - 13 functions
- **Vital tracking** - 7 functions
- **Alert management** - 6 functions
- **Access control** - 9 functions (blockchain included)
- **Document management** - unlimited actions
- **Analysis management** - 6 functions
- **Form management** - 6 functions

### Dashboard Pages

- **8 main pages** in patient dashboard
- **Multiple sections** for holistic care
- **Real-time data** for vital tracking
- **Comprehensive history** and reports

### Capabilities

- **100+ API endpoints** through server actions
- **Blockchain integration** for access control
- **Multi-document** support for medical records
- **Real-time alerts** for critical values
- **Complete audit trail** of all patient actions

---

## Getting Started for Developers

### To Use Patient Services:

```typescript
// Import needed server actions
import {
  getPatientById,
  createVitalRecord,
  getPatientAlerts,
} from "@/lib/actions/patient.actions";
import {
  getVitalRecords,
  createVitalRecord,
} from "@/lib/actions/vital.actions";

// Use in server components or client components with directives
const patient = await getPatientById(patientId);
const vitals = await getVitalRecords(patientId);
const alerts = await getPatientAlerts(patientId);
```

### To Add New Patient Feature:

1. Create server action in appropriate `actions/*.actions.ts` file
2. Create page/component in `app/dashboard/patient/`
3. Import and use server actions
4. Add navigation link in patient layout
5. Test with various patient scenarios

---

## Future Enhancement Opportunities

- Medication management and reminders
- Telemedicine video integration
- Symptom checker AI
- Health analytics dashboard
- Mobile app synchronization
- Wearable device integration
- Export patient data (FHIR format)
- Multi-language support
- Advanced reporting engine
- Predictive health alerts

---

**Documentation Generated:** March 30, 2026  
**System Version:** MediFollow v1.0  
**Last Updated:** March 30, 2026
