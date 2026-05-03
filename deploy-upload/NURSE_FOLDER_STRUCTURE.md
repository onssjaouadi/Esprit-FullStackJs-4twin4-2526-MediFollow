# Nurse Folder Complete Structure

## Overview

Source folder: `nurse/` - Complete MediFollow application with all role-based dashboards

---

## 1. ROOT LEVEL FILES & DIRECTORIES

```
nurse/
├── Configuration & Build Files:
│   ├── .env
│   ├── .env copy
│   ├── .env.example
│   ├── .eslintrc.json
│   ├── tsconfig.json
│   ├── next.config.mjs
│   ├── postcss.config.mjs
│   ├── tailwind.config.ts
│   └── components.json
│
├── Next.js App & Environment:
│   ├── next-env.d.ts
│   ├── package.json
│   ├── package-lock.json
│   ├── node_modules/
│   ├── .next/
│   ├── .dist/
│   └── .aptos/
│
├── Sentry Configuration:
│   ├── sentry.client.config.ts
│   ├── sentry.edge.config.ts
│   └── sentry.server.config.ts
│
├── Documentation:
│   ├── README.md
│   ├── README-FR.md
│   ├── README-3D-OPTIONS.md
│   ├── DOCUMENTATION.md
│   ├── GUIDE-DEMARRAGE.md
│   ├── DIAGNOSTIC_NURSE_PATIENTS.md
│   ├── PATIENT_MANAGEMENT_DOCUMENTATION.md
│   ├── INTEGRATION_FINAL_SUMMARY.md
│   ├── INTEGRATION_PHASE1_2_SUMMARY.md
│   ├── INTEGRATION_VISUAL_SUMMARY.md
│   ├── PHASE3_4_NEXT_STEPS.md
│   ├── RECAP-COMPLET.md
│   └── DIAGRAMMES.md
│
├── Instrumentation:
│   └── instrumentation.ts
│
├── Git:
│   ├── .git/
│   └── .gitignore
│
├── VS Code:
│   └── .vscode/
│
└── Other:
    ├── .aptos/
    └── docs/ (documentation folder)
```

---

## 2. APP FOLDER STRUCTURE (`app/`)

### 2.1 Root App Files

```
app/
├── layout.tsx (Main app layout)
├── page.tsx (Home page)
├── loading.tsx
├── global-error.tsx
└── globals.css
```

### 2.2 Authentication Pages

```
app/
├── login/
│   └── page.tsx
├── register/
│   └── page.tsx
├── forgot-password/
│   └── page.tsx
└── reset-password/
    └── page.tsx
```

### 2.3 Main Routes

```
app/
├── contact/
│   └── (contained routes)
├── patients/
│   └── (patient list routes)
├── admin/
│   └── page.tsx
└── sentry-example-page/
    └── (sentry monitoring example)
```

### 2.4 Dashboard Structure (`app/dashboard/`)

#### Main Dashboard Layout

```
app/dashboard/
├── layout.tsx (Dashboard wrapper)
```

#### Role-Based Dashboards

##### 2.4.1 NURSE DASHBOARD

```
app/dashboard/nurse/
├── layout.tsx
├── page.tsx (Main nurse dashboard)
├── alerts/
│   └── page.tsx
├── enter-data/
│   └── page.tsx
├── patients/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx (Patient details)
├── profile/
│   └── page.tsx
└── reminders/
    └── page.tsx
```

##### 2.4.2 DOCTOR DASHBOARD

```
app/dashboard/doctor/
├── layout.tsx
├── page.tsx (Main doctor dashboard)
├── alerts/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx
├── patients/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx
├── forms/
│   └── page.tsx
├── profile/
│   └── page.tsx
├── reports/
│   └── page.tsx
├── settings/
│   └── page.tsx
├── vitals/
│   └── page.tsx
└── vitals-review/
    └── page.tsx
└── analytics/
    └── (analytics pages)
```

##### 2.4.3 ADMIN DASHBOARD

```
app/dashboard/admin/
├── page.tsx (Main admin dashboard)
├── blockchain/
│   └── (blockchain management)
└── nurses/
    └── (nurse management)
```

##### 2.4.4 COORDINATOR DASHBOARD

```
app/dashboard/coordinator/
├── layout.tsx
├── page.tsx (Main coordinator dashboard)
├── communications/
│   └── (communications management)
├── compliance/
│   └── (compliance tracking)
└── verify/
    └── (verification features)
```

##### 2.4.5 PATIENT DASHBOARD

```
app/dashboard/patient/
├── layout.tsx
├── page.tsx (Main patient dashboard)
├── access/
│   └── (patient access control)
├── alerts/
│   └── (patient alerts)
├── appointments/
│   └── (appointment management)
├── history/
│   └── (medical history)
├── profile/
│   └── (patient profile)
├── reports/
│   └── (medical reports)
├── settings/
│   └── (patient settings)
└── vitals/
    └── (vital signs tracking)
```

### 2.5 API Routes (`app/api/`)

```
app/api/
├── auth/
│   └── face/
│       ├── enroll/  (Face recognition enrollment)
│       └── login/   (Face recognition login)
│
├── blockchain/
│   ├── assign-wallet/
│   ├── grant-access/
│   ├── initialize/
│   ├── users-wallets/
│   └── verify-access/
│
├── chatbot/
│   └── route.ts
│
├── contact/
│   └── (contact API routes)
│
├── debug/
│   └── (debug endpoints)
│
├── jarvis/
│   └── (Jarvis voice assistant)
│
├── patient/
│   └── me/
│       └── (Patient personal data endpoints)
│
├── sentry-example-api/
│   └── (Sentry example endpoints)
│
└── upload/
    └── route.ts (File upload handling)
```

---

## 3. COMPONENTS FOLDER STRUCTURE (`components/`)

### 3.1 Root Level Components

```
components/
├── AddAnalysisButton.tsx
├── AddVitalButton.tsx
├── AnalysisModal.tsx
├── AnalysisTableActions.tsx
├── AppointmentModal.tsx
├── ChatBot.tsx
├── CustomFormField.tsx
├── DocumentActions.tsx
├── DocumentEditModal.tsx
├── FaceEnrollModal.tsx
├── FaceLoginModal.tsx
├── FileUploader.tsx
├── FileUploadMedical.tsx
├── HumanBody3D.tsx
├── HumanBody3DModel.tsx
├── JarvisVoiceModal.tsx
├── MedicalHumanBody3D.tsx
├── PasskeyModal.tsx
├── PatientDocumentsViewer.tsx
├── StatCard.tsx
├── StatusBadge.tsx
├── SubmitButton.tsx
├── ThemeProvider.tsx
├── VitalModal.tsx
└── VitalsTableActions.tsx
```

### 3.2 Nurse-Specific Components (`components/nurse/`)

```
components/nurse/
├── AIReportDialog.tsx
├── TranscriptDisplay.tsx
└── VoiceEntryButton.tsx
```

### 3.3 Form Components (`components/forms/`)

```
components/forms/
├── AppointmentForm.tsx
├── PatientForm.tsx
└── RegisterForm.tsx
```

### 3.4 Table Components (`components/table/`)

```
components/table/
├── columns.tsx (Table column definitions)
└── DataTable.tsx (Reusable data table)
```

### 3.5 UI Components (`components/ui/`)

```
components/ui/
├── alert-dialog.tsx
├── badge.tsx
├── button.tsx
├── checkbox.tsx
├── command.tsx
├── dialog.tsx
├── form.tsx
├── input-otp.tsx
├── input.tsx
├── label.tsx
├── popover.tsx
├── radio-group.tsx
├── select.tsx
├── separator.tsx
├── table.tsx
└── textarea.tsx
```

---

## 4. SHARED RESOURCES

### 4.1 Types (`types/`)

```
types/
├── index.d.ts
├── appwrite.types.ts (Appwrite database types)
├── chatbot.types.ts (Chatbot/AI types)
└── medifollow.types.ts (MediFollow domain types)
```

### 4.2 Hooks (`hooks/`)

```
hooks/
├── useNurseBadges.ts
└── useVoiceRecognition.ts
```

### 4.3 Contexts (`contexts/`)

```
contexts/
└── ThemeContext.tsx
```

### 4.4 Library (`lib/`)

#### 4.4.1 Actions (`lib/actions/`)

```
lib/actions/
├── admin.actions.ts
├── ai.actions.ts
├── alert.actions.ts
├── analysis.actions.ts
├── appointment.actions.ts
├── auth.actions.ts
├── azure-storage.actions.ts
├── blockchain-access.actions.ts
├── coordinator.actions.ts
├── doctor.actions.ts
├── medassist.actions.ts
├── medical-form.actions.ts
├── nurse.actions.ts
├── password-reset.actions.ts
├── patient-access.actions.ts
├── patient.actions.ts
├── settings.actions.ts
├── symptom.actions.ts
└── vital.actions.ts
```

#### 4.4.2 Services (`lib/services/`)

```
lib/services/
└── notification.service.ts
```

#### 4.4.3 AI (`lib/ai/`)

```
lib/ai/
├── openai.service.ts
├── prompts.ts
├── reportGeneration.ts
├── riskAnalysis.ts
└── vitalParser.ts
```

#### 4.4.4 Utils (`lib/utils/`)

```
lib/utils/
├── symptom-utils.ts
└── vitalValidation.ts
```

#### 4.4.5 Configuration Files

```
lib/
├── appwrite.config.ts
├── azure-email.ts
├── encryption.ts
├── prisma.ts
└── validation.ts
├── utils.ts
```

### 4.5 Constants (`constants/`)

```
constants/
└── index.ts
```

---

## 5. DATABASE & ORM

### 5.1 Prisma (`prisma/`)

```
prisma/
├── schema.prisma (Main database schema)
├── schema-additions.prisma
├── seed.ts (Database seeding)
└── $disconnect()
```

---

## 6. SCRIPTS (`scripts/`)

### Data Management & Setup Scripts

```
scripts/
├── apply-dark-mode-patient.js
├── assign-blockchain-addresses.js
├── assign-wallet-to-user.js
├── assign-wallets-all-patients.js
├── create-doctor.js
├── create-test-users.ts
├── diagnose-nurse-patients.ts
├── diagnose-simple.js
├── diagnostic-blockchain.js
├── download-3d-model.js
├── download-font.js
├── grant-patient-access.js
├── setup-blockchain-test.js
└── test-blockchain.js
```

---

## 7. PUBLIC ASSETS (`public/`)

### 7.1 Root Assets

```
public/
├── favicon.ico
├── next.svg
├── vercel.svg
```

### 7.2 Assets Folder

```
public/assets/
├── blockchain-monitor.html
└── (other assets)
```

### 7.3 Fonts

```
public/fonts/
└── (custom fonts)
```

### 7.4 3D Models

```
public/model3d/
└── (3D model files)
```

### 7.5 Models

```
public/models/
└── (model files)
```

---

## 8. KEY FEATURES & MODULES

### Authentication & Security

- Face recognition (enrollment & login)
- Passkey authentication
- Blockchain access verification
- Role-based access control (Nurse, Doctor, Coordinator, Admin, Patient)

### Medical Data Management

- Vital signs tracking
- Medical analysis
- Patient documents
- Medical forms
- Symptom tracking

### AI & Assistance

- Chatbot integration
- Voice entry (Jarvis)
- AI report generation
- Risk analysis
- Vital sign parsing

### Blockchain

- Wallet assignment
- Access grant management
- Transaction verification
- User wallet tracking

### Communication & Notifications

- Appointments management
- Alerts & reminders
- Voice modal interaction
- Communication tools (for coordinators)

### User Management

- Patient access control
- Doctor management
- Nurse management
- Administrator functions

---

## 9. CONFIGURATION FILES REFERENCE

| File                 | Purpose                         |
| -------------------- | ------------------------------- |
| `next.config.mjs`    | Next.js configuration           |
| `tailwind.config.ts` | Tailwind CSS configuration      |
| `postcss.config.mjs` | PostCSS configuration           |
| `tsconfig.json`      | TypeScript configuration        |
| `.env`               | Environment variables (local)   |
| `.env.example`       | Example environment variables   |
| `components.json`    | Component library configuration |
| `.eslintrc.json`     | ESLint rules                    |
| `sentry.*.config.ts` | Sentry error tracking setup     |

---

## 10. SUMMARY BY FILE COUNT

### Main Structure

- **Dashboard Pages**: 5 role-based dashboards (Nurse, Doctor, Coordinator, Admin, Patient)
- **Components**: 40+ reusable components
- **API Routes**: 20+ API endpoints
- **Server Actions**: 18 action files
- **UI Components**: 15 shadcn/ui components
- **Type Definitions**: 4 type files
- **Hooks**: 2 custom hooks
- **Configuration Files**: 10+
- **Documentation Files**: 10+
- **Scripts**: 15 setup/utility scripts

---

## 11. KEY FOLDERS FOR REPLACEMENT

When copying from this nurse folder to replace the existing nurse space:

### **PRIORITY 1 - Core Application**

1. `app/dashboard/nurse/` → Replace nurse dashboard
2. `components/nurse/` → Replace nurse components
3. `lib/actions/` → Replace all action files
4. `lib/ai/` → Replace AI utilities
5. `lib/services/` → Replace services

### **PRIORITY 2 - Shared Resources**

6. `components/` → Replace shared components
7. `types/` → Replace type definitions
8. `hooks/` → Replace custom hooks
9. `contexts/` → Replace context providers
10. `constants/` → Replace constants

### **PRIORITY 3 - Configuration & Support**

11. `lib/appwrite.config.ts` → Appwrite setup
12. `lib/prisma.ts` → Prisma ORM config
13. `lib/azure-email.ts` → Email service config
14. `lib/encryption.ts` → Encryption utilities
15. `prisma/schema.prisma` → Database schema

### **OPTIONAL - Additional Features**

16. `app/api/` → API routes (if using all endpoints)
17. `scripts/` → Utility scripts
18. `public/` → Static assets
19. Other role dashboards if needed

---

## 12. DEPENDENCY NOTES

### External Integrations

- **Appwrite** - Database & Auth backend
- **OpenAI** - AI/GPT services
- **Azure** - Email and storage services
- **Blockchain/Aptos** - Transaction management
- **Prisma** - ORM for database
- **Shadcn/UI** - UI component library
- **TailwindCSS** - Styling

### Internal Dependencies

- API actions depend on database schema
- Components depend on types and constants
- Pages depend on shared components and actions
- Authentication flows depend on Appwrite config

---

## 13. FILE TREE SUMMARY

```
nurse/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── [auth pages]/
│   ├── [other routes]/
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── nurse/        ← MAIN NURSE DASHBOARD
│   │   ├── doctor/
│   │   ├── admin/
│   │   ├── coordinator/
│   │   └── patient/
│   └── api/
│       ├── auth/
│       ├── blockchain/
│       ├── chatbot/
│       ├── patient/
│       └── [other routes]/
│
├── components/
│   ├── [root components]/
│   ├── nurse/            ← NURSE-SPECIFIC COMPONENTS
│   ├── forms/
│   ├── table/
│   └── ui/
│
├── lib/
│   ├── actions/         ← SERVER ACTIONS
│   ├── ai/             ← AI SERVICES
│   ├── services/       ← SERVICES
│   ├── utils/          ← UTILITIES
│   ├── [config files]/
│   └── appwrite.config.ts
│
├── types/              ← TYPE DEFINITIONS
├── hooks/              ← CUSTOM HOOKS
├── contexts/           ← CONTEXT PROVIDERS
├── constants/          ← CONSTANTS
├── prisma/            ← DATABASE ORM
├── public/            ← STATIC ASSETS
├── scripts/           ← UTILITY SCRIPTS
├── docs/              ← DOCUMENTATION
│
├── [Config files]
│   ├── next.config.mjs
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── postcss.config.mjs
│   ├── components.json
│   └── .env*
│
└── [GitIgnore & Version Control]
    ├── .git/
    ├── .gitignore
    └── package.json
```
