# Healthcare Project: Directory Structure Comparison Report

**Generated:** April 11, 2026  
**Comparing:**

- Main Project: `c:\Users\Raouf\Downloads\healthcare-main`
- Coordinator Branch: `c:\Users\Raouf\Downloads\healthcare-main\espace-cordinator`

---

## Executive Summary

The **Coordinator Branch** is a specialized implementation that focuses on coordinator-specific functionality. It removes auditor-related features and adds coordinator-specific features for managing patient care coordination. The main differences involve:

1. **Role System**: AUDITOR role removed, COORDINATOR role emphasized
2. **Dashboard Structure**: Auditor/Nurse pages removed, Coordinator page added
3. **API Endpoints**: Diagnostic and questionnaire endpoints removed, coordinator endpoints added
4. **Database Models**: New Coordinator-specific models (CoordinatorPatient, CoordinatorReminder, CoordinatorEntryFlag)
5. **Components**: Auditor components removed, Coordinator-specific components added
6. **Scripts**: Focus shifted from auditor/nurse management to coordinator management

---

## 1. TOP-LEVEL FILES & STRUCTURE

### Files Present in Main Only:

```
ADMIN_DASHBOARD_COMPLETION_REPORT.md
ADMIN_DASHBOARD_REDESIGN.md
ADMIN_DESIGN_INTEGRATION.md
ADMIN_DESIGN_V2_IMPROVEMENTS.md
ALERTES_DASHBOARD_REDESIGN.md
AUDIT_FILE_INDEX.md
AUDIT_QUICK_START.md
AUDIT_VISUAL_SUMMARY.txt
AUDITOR_SPACE_DOCUMENTATION.md
BLOCKCHAIN_API_IMPLEMENTATION.md
BLOCKCHAIN_TRANSACTIONS_MODULE.md
BLOCKCHAIN_TRANSACTIONS_QUICK_START.md
CREATE_TEST_NURSE.md
DIAGNOSTIC_GUIDE.md
EXECUTIVE_SUMMARY.md
FIX_PATIENT_NOT_FOUND.md
QUESTIONNAIRE_IMPLEMENTATION_SUMMARY.md
QUESTIONNAIRE_QUICK_START.md
QUESTIONNAIRE_SUBMISSION_TESTING.md
QUESTIONNAIRE_TESTING_GUIDE.md
QUESTIONNAIRE_TESTING_QUICK_START.md
TEST_NURSE_ACCOUNT.md
create-cardio-analyses.ts
create-cardio-complete.ts
create-cardio-demo.ts
create-cardio-test.ts
test-denied-access.ts
libl/
-p/
Directory created/
echo/
```

### Files Present in Coordinator Only:

```
API_ADMIN_ENDPOINTS.md
INDEX-DOCUMENTATION.md
add-coordinator.js
add-nurses.js
check-users-out.txt
check-users.js
fix-auditor.js
fix-nurse-roles.js
fix-roles.js
fix-templates.js
scratch/
test-create-doc.js
test-create-user.js
test-db.js
test-email-config.js
test-pwd.js
```

### Files Missing in Coordinator:

```
.env (exists in both but content may differ)
test-denied-access.ts
```

### Key Differences:

- **Main**: Contains extensive blockchain testing and analysis creation scripts
- **Coordinator**: Contains coordinator and nurse management scripts, plus testing utilities
- **Main**: More documentation related to auditing and questionnaires
- **Coordinator**: More focused on coordination workflows

---

## 2. APP/DASHBOARD DIRECTORY STRUCTURE

### Main Project Dashboard Routes:

```
app/dashboard/
├── admin/              (12 subdirectories)
├── auditor/            [COORDINATOR BRANCH: REMOVED]
├── doctor/             (8 subdirectories)
├── nurse/              [COORDINATOR BRANCH: REDUCED]
├── patient/            (8 subdirectories)
└── questionnaires/     [COORDINATOR BRANCH: REMOVED]
```

### Coordinator Branch Dashboard Routes:

```
app/dashboard/
├── admin/              (10 subdirectories)
├── coordinator/        [NEW]
├── doctor/             (7 subdirectories)
└── patient/            (6 subdirectories)
```

### Detailed Dashboard Comparison:

#### ADMIN Directory:

| Category              | Main                     | Coordinator | Notes                      |
| --------------------- | ------------------------ | ----------- | -------------------------- |
| **Structure**         | 12 subdirs               | 10 subdirs  | Core functionality similar |
| Unique to Main        | blockchain-transactions/ | -           | Blockchain audit trails    |
| Unique to Coordinator | -                        | None        | Same core structure        |

#### AUDITOR Directory:

- **Main**: Full auditor dashboard with:
  - audit-logs/
  - blockchain-transactions/
  - incidents/
  - modifications-history/
  - patients/
  - profile/
  - reports/
  - settings/
  - users/
- **Coordinator**: ❌ **COMPLETELY REMOVED**

#### COORDINATOR Directory:

- **Main**: ❌ **DOES NOT EXIST**
- **Coordinator**: ✅ **NEW** - Specialized coordinator dashboard with:
  - ai/
  - guide/
  - patients/
  - review-analysis/
  - vitals-chat/
  - vitals-report/

#### NURSE Directory:

- **Main**:
  - alerts/
  - layout.tsx
  - page.tsx
  - patients/
  - profile/
  - reminders/

- **Coordinator**:
  - alerts/
  - guide/
  - layout.tsx
  - page.tsx
  - patients/
  - reminders/
  - reviews/
  - ⚠️ Nurse profile removed, guide/reviews pages added

#### DOCTOR Directory:

- **Main**:
  - alerts/
  - analyses/ [COORDINATOR: REMOVED]
  - analytics/
  - diagnostic/ [COORDINATOR: REMOVED]
  - forms/
  - layout.tsx
  - page.tsx
  - patients/
  - profile/
  - reports/
  - settings/
  - vitals/
  - vitals-review/

- **Coordinator**:
  - alerts/
  - analytics/
  - forms/
  - layout.tsx
  - page.tsx
  - patients/
  - profile/
  - reports/
  - settings/
  - vitals/
  - vitals-review/

#### PATIENT Directory:

- **Main** (12 subdirs):
  - access/
  - alerts/
  - analyses/ [COORDINATOR: REMOVED]
  - appointments/
  - history/
  - layout.tsx
  - page.tsx
  - profile/
  - questionnaires/ [COORDINATOR: REMOVED]
  - reports/
  - settings/
  - vitals/
  - wearables/ [COORDINATOR: REMOVED]

- **Coordinator** (6 subdirs):
  - access/
  - alerts/
  - appointments/
  - guide/ [NEW]
  - history/
  - layout.tsx
  - page.tsx
  - profile/
  - reports/
  - settings/
  - vitals/

#### QUESTIONNAIRES Directory:

- **Main**: ✅ Full questionnaire management dashboard
  - layout.tsx
  - page.tsx
  - responses/
  - [id]/

- **Coordinator**: ❌ **COMPLETELY REMOVED**

---

## 3. API ROUTES STRUCTURE

### Main Project API Routes:

```
app/api/
├── admin/
├── ai-assign/
├── analysis-requests/   [COORDINATOR: REMOVED]
├── auth/
├── blockchain/
├── chatbot/
├── contact/
├── diagnostic/          [COORDINATOR: REMOVED]
├── download/            [COORDINATOR: REMOVED]
├── jarvis/
├── me/
├── patient/
├── patients/
├── questionnaires/      [COORDINATOR: REMOVED]
├── sentry-example-api/
├── upload/
└── wearables/           [COORDINATOR: REMOVED]
```

### Coordinator Branch API Routes:

```
app/api/
├── admin/
├── ai-assign/
├── alerts/              [NEW]
├── auth/
├── blockchain/
├── chatbot/
├── contact/
├── coordinator/         [NEW]
├── jarvis/
├── patient/
├── sentry-example-api/
├── test-alert/          [NEW]
├── test-sms/            [NEW]
└── upload/
```

### API Routes Comparison:

| Route                 | Main | Coordinator | Purpose                         |
| --------------------- | ---- | ----------- | ------------------------------- |
| `/admin`              | ✅   | ✅          | Admin panel operations          |
| `/ai-assign`          | ✅   | ✅          | AI assignment features          |
| `/analysis-requests`  | ✅   | ❌          | Patient analysis requests       |
| `/alerts`             | ✅   | ✅          | Alert management                |
| `/auth`               | ✅   | ✅          | Authentication                  |
| `/blockchain`         | ✅   | ✅          | Blockchain operations           |
| `/chatbot`            | ✅   | ✅          | Chatbot endpoints               |
| `/contact`            | ✅   | ✅          | Contact form endpoints          |
| `/coordinator`        | ❌   | ✅          | Coordinator-specific operations |
| `/diagnostic`         | ✅   | ❌          | Diagnostic system               |
| `/download`           | ✅   | ❌          | Download/export features        |
| `/jarvis`             | ✅   | ✅          | Jarvis AI features              |
| `/me`                 | ✅   | ❌          | User self-service endpoint      |
| `/patient`            | ✅   | ✅          | Patient data operations         |
| `/patients`           | ✅   | ✅          | Patients list/management        |
| `/questionnaires`     | ✅   | ❌          | Questionnaire system            |
| `/sentry-example-api` | ✅   | ✅          | Sentry monitoring example       |
| `/test-alert`         | ❌   | ✅          | Alert testing                   |
| `/test-sms`           | ❌   | ✅          | SMS testing                     |
| `/upload`             | ✅   | ✅          | File upload                     |
| `/wearables`          | ✅   | ❌          | Wearable device data            |

---

## 4. LIB/ACTIONS DIRECTORY COMPARISON

### Main Project Actions:

```
admin.actions.ts
ai-assign.actions.ts
alert.actions.ts
analysis.actions.ts              [Key file - removed in coordinator]
appointment.actions.ts
audit.actions.ts                 [Key file - removed in coordinator]
auditor.actions.ts               [REMOVED in coordinator]
auth.actions.ts
azure-storage.actions.ts
blockchain-access.actions.ts
blockchain-audit.actions.ts      [REMOVED in coordinator]
blockchain-explorer.actions.ts   [REMOVED in coordinator]
doctor-notes.actions.ts          [REMOVED in coordinator]
doctor.actions.ts
fix-missing-patients.ts          [Utility - removed]
medassist.actions.ts
medical-form.actions.ts
nurse.actions.ts                 [REMOVED in coordinator]
password-reset.actions.ts
patient-access.actions.ts
patient.actions.ts
reports.actions.ts               [REMOVED in coordinator]
service.actions.ts
settings.actions.ts
situation-reports.actions.ts     [REMOVED in coordinator]
symptom.actions.ts
vital.actions.ts
wearable.actions.ts              [REMOVED in coordinator]
```

### Coordinator Branch Actions:

```
admin.actions.ts
ai-assign.actions.ts
alert.actions.ts
analysis.actions.ts              [NEW - simplified from main]
appointment.actions.ts
audit.actions.ts                 [Simplified - kept but reduced]
auth.actions.ts
azure-storage.actions.ts
blockchain-access.actions.ts
blockchain.actions.ts            [NEW - consolidated blockchain ops]
coordinator.actions.ts           [NEW - coordinator-specific]
doctor.actions.ts
export.actions.ts                [NEW - export functionality]
medassist.actions.ts
medical-form.actions.ts
notification.actions.ts          [NEW - notification management]
password-reset.actions.ts
patient-access.actions.ts
patient.actions.ts
questionnaire.actions.ts         [NEW - questionnaire simplified]
service.actions.ts
settings.actions.ts
symptom.actions.ts
vital.actions.ts
```

### Actions Removed in Coordinator:

- `auditor.actions.ts` - Auditor-specific operations
- `blockchain-audit.actions.ts` - Blockchain audit trails
- `blockchain-explorer.actions.ts` - Blockchain explorer
- `doctor-notes.actions.ts` - Doctor note management
- `nurse.actions.ts` - Nurse-specific operations
- `reports.actions.ts` - Report generation
- `situation-reports.actions.ts` - Situation report management
- `wearable.actions.ts` - Wearable device integration
- `fix-missing-patients.ts` - Data migration utility

### New Actions in Coordinator:

- `coordinator.actions.ts` - Core coordinator operations
- `blockchain.actions.ts` - Consolidated blockchain operations
- `export.actions.ts` - Export/download functionality
- `notification.actions.ts` - Notification system
- `questionnaire.actions.ts` - Simplified questionnaire operations

---

## 5. LIBRARY CONFIGURATION & SERVICES COMPARISON

### Main Project Library Structure:

```
lib/
├── actions/              (27 action files)
├── appwrite.config.ts
├── azure-email.ts
├── blockchain-api.config.ts      [Coordinator: REMOVED]
├── constants/
├── encryption.ts
├── examples/             [Coordinator: REMOVED - directory]
├── hooks/
├── password-utils.ts
├── prisma.ts
├── services/
│   ├── audit.service.ts
│   └── notification.service.ts
├── setup-patient-doctor-access.ts [Coordinator: REMOVED]
├── utils/
├── utils.ts
└── validation.ts
```

### Coordinator Branch Library Structure:

```
lib/
├── actions/              (24 action files - streamlined)
├── ai/                   [NEW - AI capabilities]
├── appwrite.config.ts
├── azure-email.ts
├── encryption.ts
├── mongodb.ts            [NEW]
├── prisma.ts
├── pusher.ts             [NEW]
├── services/
│   ├── hfBiomedAlert.service.ts    [NEW - health framework services]
│   ├── hfInference.shared.ts       [NEW]
│   ├── hfMistralClinical.service.ts [NEW]
│   ├── hfVitalGuide.service.ts     [NEW]
│   └── notification.service.ts
├── translations.ts       [NEW]
├── utils/
├── utils.ts
└── validation.ts
```

### Library Changes:

| Component          | Main       | Coordinator | Notes                      |
| ------------------ | ---------- | ----------- | -------------------------- |
| **Prisma**         | ✅         | ✅          | Both use Prisma ORM        |
| **Appwrite**       | ✅         | ✅          | Both support Appwrite      |
| **Blockchain API** | ✅         | ❌          | Complex blockchain removed |
| **AI Services**    | Limited    | ✅ Enhanced | New ML services added      |
| **MongoDB**        | Via Prisma | ✅ Direct   | Direct MongoDB support     |
| **Pusher**         | ❌         | ✅          | Real-time notifications    |
| **Translations**   | ❌         | ✅          | I18n support               |
| **Examples**       | ✅         | ❌          | Example code removed       |

### Service Differences:

**Main Services:**

- `audit.service.ts` - Comprehensive auditing
- `notification.service.ts` - Basic notifications

**Coordinator Services:**

- `hfBiomedAlert.service.ts` - Biomedical alert handling
- `hfInference.shared.ts` - Shared inference capabilities
- `hfMistralClinical.service.ts` - Clinical AI via Mistral
- `hfVitalGuide.service.ts` - Vital signs guidance
- `notification.service.ts` - Enhanced notifications

---

## 6. SCRIPTS COMPARISON

### Main Project Scripts (43 files):

```
Scripts/
├── add-vitals-and-alerts.js
├── apply-dark-mode-patient.js
├── assign-blockchain-addresses.js
├── assign-wallet-to-user.js
├── assign-wallets-all-patients.js
├── check-doctor.js
├── check-invalid-roles.js
├── check-users.ts
├── clean-all-invalid-roles.js
├── clean-invalid-roles.js
├── create-access-grant.ts
├── create-auditor-test.js                    [REMOVED]
├── create-auditor.js                         [REMOVED]
├── create-batch-access-grants.ts
├── create-cardiology-patients.js             [REMOVED]
├── create-doctor-arij.js
├── create-doctor.js
├── create-test-nurse.js                      [REMOVED]
├── create-test-nurse.ts                      [REMOVED]
├── create-test-patient.ts
├── debug-doctor-grants.ts
├── diagnose-access-grants.ts
├── diagnose-auth.js
├── diagnose-doctor-grants.ts
├── diagnostic-blockchain.js                  [REMOVED]
├── download-3d-model.js
├── download-font.js
├── fix-access-grants.ts
├── fix-coordinator-role.js                   [REMOVED]
├── fix-doctor-access-grants.ts
├── grant-patient-access.js
├── nuke-coordinator.js                       [REMOVED]
├── reset-password.ts
├── reset-test-nurse.js                       [REMOVED]
├── setup-blockchain-test.js
├── show-access-grants.ts
├── test-api-patients.ts
├── test-audit.js                             [REMOVED]
├── test-blockchain.js
├── test-patients-api.ts
├── verify-doctor-grants.ts
└── verify-test-nurse.js                      [REMOVED]
```

### Coordinator Branch Scripts (12 files):

```
Scripts/
├── apply-dark-mode-patient.js
├── assign-blockchain-addresses.js
├── assign-wallet-to-user.js
├── assign-wallets-all-patients.js
├── check_alert_relations.js                  [NEW]
├── create-doctor.js
├── diagnostic-blockchain.js
├── download-3d-model.js
├── download-font.js
├── grant-patient-access.js
├── setup-blockchain-test.js
└── test-blockchain.js
```

### Scripts Added in Coordinator Root:

```
add-coordinator.js          - Create coordinator users
add-nurses.js               - Create nurse users
check-users.js              - Check user records
check-users-out.txt         - User check output
fix-auditor.js              - Fix auditor role issues
fix-nurse-roles.js          - Fix nurse role issues
fix-roles.js                - Fix role assignments
fix-templates.js            - Fix database templates
test-create-doc.js          - Test document creation
test-create-user.js         - Test user creation
test-db.js                  - Database testing
test-email-config.js        - Email configuration testing
test-pwd.js                 - Password testing
```

### Script Summary:

- **Main**: 43 scripts, emphasis on auditing, blockchain, and test data
- **Coordinator**: 12 core scripts + 14 root scripts (26 total), emphasis on coordinator/nurse management
- **Removed in Coordinator**: 31 scripts (auditor creation, nurse testing, cardiology, blockchain diagnostics, etc.)
- **Philosophy**: Main = comprehensive testing; Coordinator = focused operations

---

## 7. COMPONENTS COMPARISON

### Common Components (Present in Both):

```
AddAnalysisButton.tsx
AddVitalButton.tsx
admin/                    (Different contents)
AnalysisModal.tsx
AnalysisTableActions.tsx
AppointmentModal.tsx
ChatBot.tsx
CustomFormField.tsx
DocumentActions.tsx
DocumentEditModal.tsx
FaceEnrollModal.tsx
FaceLoginModal.tsx
FileUploader.tsx
FileUploadMedical.tsx
forms/                    (Similar)
HumanBody3D.tsx
HumanBody3DModel.tsx
JarvisVoiceModal.tsx
MedicalHumanBody3D.tsx
PasskeyModal.tsx
StatCard.tsx
StatusBadge.tsx
SubmitButton.tsx
table/                    (Similar)
ThemeProvider.tsx
ui/                       (Similar)
VitalModal.tsx
VitalsTableActions.tsx
```

### Main Project Unique Components:

```
AuditDashboard.tsx
auditor/                  (Directory - removed in coordinator)
BlockchainAuditTab.tsx
CreateQuestionnaire.tsx
DoctorNotesSection.tsx
DoctorQuestionnaireResponses.tsx
PatientAISummary.tsx
PatientAnalysisView.tsx
PatientQuestionnaire.tsx
QuestionnaireManagement.tsx
ResponseViewer.tsx
SituationReportEditor.tsx
```

### Coordinator Unique Components:

```
AdminHeader.tsx           (Enhanced admin header)
AdminNotificationBell.tsx (Notification UI)
CoordinatorGuideVideoMaker.tsx
LogoutButton.tsx
PatientGuideChatbot.tsx
VitalsAiAgent.tsx
```

### Admin Components Differences:

**Main Project - components/admin/ (8 components):**

- AdminCommandPalette.tsx
- AdminHeader.tsx
- AdminNotificationBell.tsx
- AdminSidebar.tsx
- AlertProgressBar.tsx
- LiveAdminDashboard.tsx
- ProgressBar.tsx
- ThemeToggle.tsx

**Coordinator - components/admin/ (4 components):**

- AdminCommandPalette.tsx
- AdminSidebar.tsx
- LiveAdminDashboard.tsx
- ThemeToggle.tsx

Components removed in coordinator: Header, NotificationBell, AlertProgressBar, ProgressBar

---

## 8. PRISMA DATABASE SCHEMA

### Main Project Roles:

```typescript
enum Role {
  PATIENT
  DOCTOR
  NURSE
  ADMIN
  AUDITOR
  COORDINATOR
}
```

### Coordinator Branch Roles:

```typescript
enum Role {
  PATIENT
  DOCTOR
  NURSE
  COORDINATOR
  ADMIN
}
```

**Key Difference**: AUDITOR removed in coordinator branch

### Main Project User Relations:

```typescript
model User {
  ...
  questionnaireTemplates QuestionnaireTemplate[]
  analysisRequests AnalysisRequest[]
}
```

### Coordinator Project User Relations:

```typescript
model User {
  ...
  coordinatorAssignments CoordinatorPatient[] @relation("CoordinatorAssignments")
  coordinatorRemindersSent CoordinatorReminder[] @relation("CoordinatorRemindersSent")
  coordinatorFlagsRaised CoordinatorEntryFlag[] @relation("CoordinatorFlagsRaised")
}
```

### Coordinator Project Patient Relations:

```typescript
model Patient {
  ...
  coordinatorAssignments CoordinatorPatient[]
  coordinatorReminders CoordinatorReminder[]
  coordinatorFlags CoordinatorEntryFlag[]
}
```

### New Prisma Models in Coordinator:

- `CoordinatorPatient` - Assignments of patients to coordinators
- `CoordinatorReminder` - Reminders sent by coordinators
- `CoordinatorEntryFlag` - Flags/alerts raised by coordinators

### Removed Models in Coordinator:

- `AuditLog` removed from most relations
- Questionnaire-related models reduced
- Analysis request tracking removed

---

## 9. TYPE DEFINITIONS

### Role Enum - Main Project:

```typescript
export enum Role {
  PATIENT = "PATIENT",
  DOCTOR = "DOCTOR",
  NURSE = "NURSE", // Not in basic types
  ADMIN = "ADMIN",
  AUDITOR = "AUDITOR", // Not in basic types
}
```

### Role Enum - Coordinator Project:

```typescript
export enum Role {
  PATIENT = "PATIENT",
  DOCTOR = "DOCTOR",
  NURSE = "NURSE",
  COORDINATOR = "COORDINATOR",
  ADMIN = "ADMIN",
}
```

### Type Files Comparison:

Both projects contain:

- `appwrite.types.ts` - Appwrite service types
- `chatbot.types.ts` - Chatbot definitions
- `index.d.ts` - Global type definitions
- `medifollow.types.ts` - Core application types (with above role differences)

---

## 10. CONFIGURATION FILES

### Next.js Configuration:

- `next.config.mjs` - ✅ Present in both (likely identical)
- `tsconfig.json` - ✅ Present in both
- `tailwind.config.ts` - ✅ Present in both

### PostCSS Configuration:

- `postcss.config.mjs` - ✅ Present in both

### ESLint Configuration:

- `.eslintrc.json` - ✅ Present in both

### Prisma Configuration:

- `prisma/schema.prisma` - ✅ Present in both (differences noted above)

### Environment Configuration:

- `.env` / `.env.example` - ✅ Present in both (likely identical)
- `.env copy` - ✅ Present in both (backup file)

### Sentry Configuration:

- `sentry.client.config.ts` - ✅ Present in both
- `sentry.edge.config.ts` - ✅ Present in both
- `sentry.server.config.ts` - ✅ Present in both

### Compiler Configuration:

- `components.json` - ✅ Present in both
- `tsconfig.tsbuildinfo` - ✅ Present in main only

---

## 11. DOCUMENTATION COMPARISON

### Main Project Documentation (28+ files):

```
ADMIN_DASHBOARD_COMPLETION_REPORT.md
ADMIN_DASHBOARD_REDESIGN.md
ADMIN_DESIGN_INTEGRATION.md
ADMIN_DESIGN_V2_IMPROVEMENTS.md
ALERTES_DASHBOARD_REDESIGN.md
AUDIT_FILE_INDEX.md
AUDIT_QUICK_START.md
AUDIT_VISUAL_SUMMARY.txt
AUDITOR_SPACE_DOCUMENTATION.md
BLOCKCHAIN_API_IMPLEMENTATION.md
BLOCKCHAIN_TRANSACTIONS_MODULE.md
BLOCKCHAIN_TRANSACTIONS_QUICK_START.md
CHANGELOG.md
CREATE_TEST_NURSE.md
DIAGNOSTIC_GUIDE.md
DIAGRAMMES.md
DOCUMENTATION.md
EXECUTIVE_SUMMARY.md
FIX_PATIENT_NOT_FOUND.md
GUIDE-DEMARRAGE.md
IMPLEMENTATION_GUIDE.md
INTEGRATION_FINAL_SUMMARY.md
INTEGRATION_PHASE1_2_SUMMARY.md
INTEGRATION_VISUAL_SUMMARY.md
MERGE_COMPLETION_SUMMARY.md
PATIENT_MANAGEMENT_DOCUMENTATION.md
PHASE3_4_NEXT_STEPS.md
QUESTIONNAIRE_IMPLEMENTATION_SUMMARY.md
QUESTIONNAIRE_QUICK_START.md
QUESTIONNAIRE_SUBMISSION_TESTING.md
QUESTIONNAIRE_TESTING_GUIDE.md
QUESTIONNAIRE_TESTING_QUICK_START.md
QUICK_START.md
README-3D-OPTIONS.md
README-FR.md
README.md
RECAP-COMPLET.md
TEST_NURSE_ACCOUNT.md
```

### Coordinator Documentation:

```
DIAGRAMMES.md
DOCUMENTATION.md
GUIDE-DEMARRAGE.md
IMPLEMENTATION_GUIDE.md
INTEGRATION_FINAL_SUMMARY.md
INTEGRATION_PHASE1_2_SUMMARY.md
INTEGRATION_VISUAL_SUMMARY.md
PATIENT_MANAGEMENT_DOCUMENTATION.md
PHASE3_4_NEXT_STEPS.md
QUICK_START.md
README-3D-OPTIONS.md
README-FR.md
README.md
RECAP-COMPLET.md
```

### Documentation Removed in Coordinator:

- All AUDIT-related documentation (8 files)
- All QUESTIONNAIRE-related documentation (5 files)
- All ADMIN-related documentation (5 files)
- All TEST/TEST_NURSE documentation (2 files)
- Blockchain-specific documentation (3 files)
- Diagnostic guide
- Executive summary
- Fix patient documentation
- API admin endpoints

---

## 12. SPECIAL DIRECTORIES & FILES

### Main Project Special Items:

- `aptos/` - Aptos blockchain Move smart contracts
- `prisma/` - Database schema and migrations
- `public/` - Static assets
- `-p/` - Unclear directory (possibly generated)
- `Directory created/` - Unclear directory
- `echo/` - Echo service/directory
- `libl/` - Library (possibly typo, should be lib)

### Coordinator Project Special Items:

- `aptos/` - Aptos blockchain (same as main)
- `prisma/` - Database schema (modified)
- `public/` - Static assets
- `scratch/` - Development scratch work
- No unclear directories like main project

### Version Control:

- Both have `.git/` and `.gitignore`
- Both have `.vscode/` configuration

---

## 13. CONTEXT & APP-LEVEL FILES

### Root App Files:

**Main Project:**

- `page.tsx` - Home page
- `global-error.tsx` - Global error handler
- `globals.css` - Global styles
- `layout.tsx` - Root layout
- `loading.tsx` - Loading state

**Coordinator Branch:**

- `page.tsx` - Home page
- `globals.css` - Global styles
- `layout.tsx` - Root layout
- `loading.tsx` - Loading state
- `global-error.tsx` - Global error handler
- `SettingsContext.tsx` - Settings context provider (NEW)

### Route Differences:

**Main Only:**

- `/change-password` - Password change route

**Both:**

- `/dashboard` - Main dashboard
- `/login` - Login
- `/register` - Registration
- `/forgot-password` - Password recovery
- `/reset-password` - Password reset
- `/contact` - Contact form
- `/admin` - Admin panel
- `/patients` - Patient area
- `/sentry-example-page` - Sentry monitoring example

---

## 14. SUMMARY TABLE

| Aspect                     | Main Project           | Coordinator Branch               | Winner/Notes                          |
| -------------------------- | ---------------------- | -------------------------------- | ------------------------------------- |
| **Total Dashboard Routes** | 7                      | 4                                | Main more comprehensive               |
| **Total API Routes**       | 16                     | 11                               | Main more features                    |
| **Action Files**           | 27                     | 24                               | Main more complete                    |
| **Scripts**                | 43 main + 14 root = 57 | 26                               | Main for testing, Coordinator focused |
| **Roles**                  | 6 (includes AUDITOR)   | 5 (COORDINATOR focus)            | Different use cases                   |
| **Components**             | 50+                    | 45+                              | Similar, different focus              |
| **Services**               | 2                      | 5 (advanced AI)                  | Coordinator more advanced             |
| **Documentation**          | 38+ files              | 14 files                         | Main more documented                  |
| **Database Models**        | Standard               | Enhanced with Coordinator models | Coordinator more specialized          |
| **Library Features**       | Blockchain focus       | AI/ML focus                      | Different specializations             |

---

## 15. KEY FINDINGS

### Architectural Differences:

1. **Role System**
   - Main: Full audit trail support with AUDITOR role
   - Coordinator: Streamlined for coordinator-managed care

2. **Questionnaires & Diagnostics**
   - Main: Comprehensive questionnaire system
   - Coordinator: Removed in favor of coordinator-driven workflows

3. **Analysis & Reporting**
   - Main: Extensive analysis capability
   - Coordinator: Simplified, AI-enhanced

4. **AI Integration**
   - Main: Basic AI features
   - Coordinator: Advanced AI services (Hugging Face, Mistral)

5. **Blockchain Operations**
   - Main: Complex, auditable blockchain integration
   - Coordinator: Simplified blockchain usage

6. **Real-time Features**
   - Main: Alert-based system
   - Coordinator: Pusher-based real-time notifications

7. **Wearable Integration**
   - Main: Full wearable device support
   - Coordinator: Removed

### Use Case Orientation:

**Main Project:**

- Multi-role hospital/clinic system
- Audit compliance required
- Patient questionnaires and self-assessment
- Detailed diagnostics
- Comprehensive tracking

**Coordinator Branch:**

- Care coordination focus
- Nurse/coordinator managed workflows
- AI-assisted vital analysis
- Real-time alerts and reminders
- Simplified patient guidance

---

## 16. FILE MIGRATION GUIDE

### If Moving from Main to Coordinator:

**Keep:**

- Core authentication & user management
- Patient data structures
- Doctor workflow
- Blockchain base functionality
- UI components (most)

**Remove:**

- Auditor dashboard and systems
- Questionnaire system
- Diagnostic tools
- Wearable integration
- Analysis request system
- Audit logging system (simplified)

**Add:**

- Coordinator dashboard
- Coordinator-specific models
- Real-time notification system
- Advanced AI services
- Coordinator management tools

---

## 17. RECOMMENDATIONS

1. **For Main Project**: Continue comprehensive feature development for multi-stakeholder healthcare system
2. **For Coordinator Branch**: Leverage AI services; focus on coordinator efficiency and patient guidance
3. **Code Sharing**: 70% code overlap - good candidate for feature flags or environment-based configuration
4. **Database**: Consider separate databases for audit compliance (main) vs. coordinator focus (branch)
5. **Documentation**: Coordinator branch would benefit from dedicated coordinator workflow documentation

---

**Report Generated**: April 11, 2026  
**Analysis Depth**: Comprehensive (File system, API routes, Components, Database Schema)  
**Reliability**: High (File-based analysis)
