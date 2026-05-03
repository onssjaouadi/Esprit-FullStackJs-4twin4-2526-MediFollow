# Nurse Folder - Quick Copy Reference Guide

## Essential Files to Copy (Organized by Priority)

### ⭐ PRIORITY 1: NURSE DASHBOARD & COMPONENTS

#### Nurse Dashboard Pages

```
SOURCE                          → DESTINATION
↓
nurse/app/dashboard/nurse/


Files to copy:
├── layout.tsx
├── page.tsx
├── alerts/page.tsx
├── enter-data/page.tsx
├── patients/page.tsx
├── patients/[id]/page.tsx
├── profile/page.tsx
└── reminders/page.tsx
```

#### Nurse-Specific Components

```
SOURCE                          → DESTINATION
↓
nurse/components/nurse/


Files:
├── AIReportDialog.tsx
├── TranscriptDisplay.tsx
└── VoiceEntryButton.tsx
```

---

### ⭐⭐ PRIORITY 2: SHARED COMPONENTS & UTILITIES

#### Shared Components

```
SOURCE                          → DESTINATION
↓
nurse/components/


Copy all component directories:
├── forms/
│   ├── AppointmentForm.tsx
│   ├── PatientForm.tsx
│   └── RegisterForm.tsx
├── table/
│   ├── columns.tsx
│   └── DataTable.tsx
└── ui/
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

Root component files:
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

#### Server Actions (CRITICAL)

```
SOURCE                          → DESTINATION
↓
nurse/lib/actions/


All action files (18 total):
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

#### Type Definitions

```
SOURCE                          → DESTINATION
↓
nurse/types/


Files:
├── index.d.ts
├── appwrite.types.ts
├── chatbot.types.ts
└── medifollow.types.ts
```

#### AI Services

```
SOURCE                          → DESTINATION
↓
nurse/lib/ai/


Files:
├── openai.service.ts
├── prompts.ts
├── reportGeneration.ts
├── riskAnalysis.ts
└── vitalParser.ts
```

---

### ⭐⭐⭐ PRIORITY 3: CONFIGURATION & UTILITIES

#### Library Configuration Files

```
SOURCE                          → DESTINATION
↓
nurse/lib/


Files:
├── appwrite.config.ts
├── azure-email.ts
├── encryption.ts
├── prisma.ts
├── validation.ts
├── utils.ts
└── services/
    └── notification.service.ts
```

#### Hooks

```
SOURCE                          → DESTINATION
↓
nurse/hooks/


Files:
├── useNurseBadges.ts
└── useVoiceRecognition.ts
```

#### Constants

```
SOURCE                          → DESTINATION
↓
nurse/constants/


File:
└── index.ts
```

#### Contexts

```
SOURCE                          → DESTINATION
↓
nurse/contexts/


File:
└── ThemeContext.tsx
```

#### Utilities

```
SOURCE                          → DESTINATION
↓
nurse/lib/utils/


Files:
├── symptom-utils.ts
└── vitalValidation.ts
```

---

### ⭐⭐⭐⭐ OPTIONAL: COMPLETE APPLICATION FILES

#### API Routes (if replacing all endpoints)

```
SOURCE                          → DESTINATION
↓
nurse/app/api/


Full directory tree with all routes:
├── auth/
│   └── face/
│       ├── enroll/route.ts
│       └── login/route.ts
├── blockchain/
│   ├── assign-wallet/route.ts
│   ├── grant-access/route.ts
│   ├── initialize/route.ts
│   ├── users-wallets/route.ts
│   └── verify-access/route.ts
├── chatbot/route.ts
├── contact/...
├── debug/...
├── jarvis/...
├── patient/me/...
├── sentry-example-api/...
└── upload/route.ts
```

#### Other Role Dashboards

```
SOURCE                          → DESTINATION
↓
nurse/app/dashboard/doctor/      (+ coordinator/, admin/, patient/)


Include if you need complete multi-role functionality:
├── alerts/
├── patients/
├── forms/
├── profile/
├── reports/
├── settings/
└── [other features]
```

#### Database Schema

```
SOURCE                          → DESTINATION
↓
nurse/prisma/


Files:
├── schema.prisma (CRITICAL for data structure)
├── schema-additions.prisma
└── seed.ts
```

#### Utility Scripts

```
SOURCE                          → DESTINATION
↓
nurse/scripts/


Copy as needed:
├── apply-dark-mode-patient.js
├── assign-blockchain-addresses.js
├── assign-wallet-to-user.js
├── assign-wallets-all-patients.js
├── create-doctor.js
├── create-test-users.ts
├── diagnose-nurse-patients.ts
├── diagnostic-blockchain.js
├── download-3d-model.js
├── download-font.js
├── grant-patient-access.js
├── setup-blockchain-test.js
└── test-blockchain.js
```

#### Root App Files

```
SOURCE                          → DESTINATION
↓
nurse/app/


Global level files:
├── layout.tsx (if updating main layout)
├── page.tsx (homepage)
├── globals.css
├── global-error.tsx
└── loading.tsx
```

#### Public Assets (Optional)

```
SOURCE                          → DESTINATION
↓
nurse/public/


Assets:
├── assets/
│   └── blockchain-monitor.html
├── fonts/
├── model3d/
└── models/
```

---

## Configuration Files

### Root Level Config Files (if needed)

```
SOURCE                          → DESTINATION
↓
nurse/


Files:
├── .env / .env.local (MUST UPDATE)
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── components.json
├── .eslintrc.json
└── sentry.*.config.ts
```

---

## Copy Strategy

### Minimal Copy (Nurse Space Only - RECOMMENDED)

```
1. app/dashboard/nurse/          ← All pages
2. components/nurse/             ← Nurse components
3. lib/actions/                  ← All actions (MUST HAVE)
4. lib/ai/                       ← AI services
5. types/                        ← Type definitions
6. hooks/                        ← Custom hooks
7. constants/                    ← Constants
8. contexts/                     ← Context providers
9. lib/utils/                    ← Utilities
10. lib/services/                ← Services
11. lib/appwrite.config.ts       ← Database config
12. components/forms/            ← Form components
13. components/table/            ← Table components
14. components/ui/               ← UI components
15. All root components (copy entire /components/ folder except nurse subfolder)
```

### Complete Copy (Full Application)

```
1. app/                          ← Entire app folder
2. components/                   ← All components
3. lib/                          ← All library code
4. types/                        ← All types
5. hooks/                        ← All hooks
6. contexts/                     ← All contexts
7. constants/                    ← All constants
8. prisma/                       ← Database schema
9. public/                       ← All assets
10. scripts/                     ← All utility scripts
```

---

## File Count Summary

| Category                 | File Count      |
| ------------------------ | --------------- |
| Dashboard Pages (Nurse)  | 7 page files    |
| Nurse Components         | 3 files         |
| Shared Components (root) | 24 files        |
| Form Components          | 3 files         |
| Table Components         | 2 files         |
| UI Components            | 15 files        |
| Server Actions           | 18 files        |
| AI Services              | 5 files         |
| Hooks                    | 2 files         |
| Types                    | 4 files         |
| Configuration Files      | 6+ files        |
| API Routes               | 20+ routes      |
| Scripts                  | 15 scripts      |
| **TOTAL**                | **~130+ files** |

---

## Important Notes

### ⚠️ CRITICAL ITEMS

1. **lib/actions/** - Contains all server-side business logic
2. **lib/appwrite.config.ts** - Database configuration
3. **types/** - Type definitions for type safety
4. **prisma/schema.prisma** - Database schema structure

### ⚡ DEPENDENCIES TO CHECK

- Appwrite configuration and database IDs
- Environment variables (.env)
- API keys for external services (OpenAI, Azure, etc.)
- Blockchain/Wallet configurations
- Database schema compatibility

### 📋 VERIFICATION CHECKLIST

After copying:

- [ ] All imports resolve correctly
- [ ] Type definitions are accessible
- [ ] Database schema matches
- [ ] Configuration files updated with correct env vars
- [ ] No circular dependencies
- [ ] API routes properly configured

---

## How to Use This Guide

1. **Decide on scope**: Minimal (nurse space) or complete (full app)
2. **Follow the priority levels**:
   - Priority 1: Essential nurse dashboard
   - Priority 2: Shared utilities and components
   - Priority 3: Configuration and support
   - Optional: Additional features
3. **Copy files in order** to maintain dependencies
4. **Update configuration** - .env and config files with your settings
5. **Test thoroughly** - especially actions and API routes
