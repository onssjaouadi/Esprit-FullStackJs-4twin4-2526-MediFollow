# Healthcare Project: Developer Quick Reference Guide

**Last Updated**: April 11, 2026

---

## 🚀 Quick Start Navigation

### For Main Project Developers:

```
📊 Focus Areas:
  • Multi-role audit system
  • Comprehensive diagnostics
  • Questionnaire management
  • Detailed reporting
  • Wearable device integration

📂 Key Directories:
  app/dashboard/auditor/         → Audit system
  app/dashboard/questionnaires/  → Questionnaire system
  lib/actions/auditor.actions    → Audit operations
  lib/actions/wearable.actions   → Wearable integration
  scripts/create-auditor*.js     → Audit user setup

🔧 Common Commands:
  npm run prisma:seed            → Seed test data
  npm run test:cardio-complete   → Cardio test patients
  NODE scripts/create-auditor.js → Create auditor user
  NODE scripts/test-audit.js     → Test audit system
```

### For Coordinator Branch Developers:

```
📋 Focus Areas:
  • Coordinator workflows
  • Care coordination
  • Real-time alerts
  • AI-assisted vitals
  • Patient guidance

📂 Key Directories:
  app/dashboard/coordinator/     → Coordinator dashboard
  app/api/coordinator/           → Coordinator API
  lib/actions/coordinator.actions → Coordinator operations
  lib/services/hf*.service.ts    → AI services
  scripts/add-coordinator.js     → Coordinator user setup

🔧 Common Commands:
  npm run dev                    → Start development
  npm run prisma:studio        → View database
  NODE add-coordinator.js       → Create coordinator
  NODE add-nurses.js            → Create nurse users
  NODE check-users.js           → Check users
```

---

## 🗂️ File Organization Reference

### ✅ IDENTICAL IN BOTH VERSIONS:

- Configuration files (tsconfig, tailwind.config, eslint)
- Sentry configuration (3 files)
- Core auth system
- Patient management core
- Doctor workflows
- Basic UI components
- Blockchain base functionality

### ⚠️ PARTIALLY SHARED:

- `admin/` dashboard (12 routes vs 10 routes)
- `doctor/` dashboard (8 routes vs 7 routes)
- `patient/` dashboard (12 routes vs 11 routes)
- Lib actions (27 vs 24 files)
- Components (50+ vs 45+ components)

### ❌ MAIN ONLY:

- Auditor system (full role + dashboard)
- Questionnaire management system
- Diagnostic system
- Wearable device integration
- Analysis request system
- Doctor notes system
- Situation reports

### ✨ COORDINATOR ONLY:

- Coordinator dashboard & API
- Coordinator-specific types & models
- Advanced AI services (5 services)
- Real-time notification infrastructure (Pusher)
- Coordinator management scripts
- Patient guidance features
- Video guide maker component

---

## 🔄 Database Model Differences

### ROLES:

```
MAIN:       PATIENT, DOCTOR, NURSE, ADMIN, AUDITOR, COORDINATOR
COORDINATOR: PATIENT, DOCTOR, NURSE, COORDINATOR, ADMIN
```

### NEW RELATIONS IN COORDINATOR:

```prisma
// User model additions
coordinatorAssignments: CoordinatorPatient[]
coordinatorRemindersSent: CoordinatorReminder[]
coordinatorFlagsRaised: CoordinatorEntryFlag[]

// Patient model additions
coordinatorAssignments: CoordinatorPatient[]
coordinatorReminders: CoordinatorReminder[]
coordinatorFlags: CoordinatorEntryFlag[]
```

### REMOVED FROM COORDINATOR:

- `questionnaireTemplates` relation
- `analysisRequests` relation
- Complex audit logging
- Auditor-specific fields

---

## 📊 API Routes Quick Map

### SHARED ROUTES (Both versions):

```
/api/admin               → Admin operations
/api/auth               → Authentication
/api/patient            → Patient operations
/api/patients           → Patient list/search
/api/doctor             → Doctor operations
/api/upload             → File uploads
/api/blockchain         → Blockchain ops
/api/alert              → Alerts (base)
/api/chatbot            → Chatbot
/api/jarvis             → AI assistant
/api/ai-assign          → AI assignment
```

### MAIN ONLY:

```
/api/diagnostic         → Diagnostic system
/api/analysis-requests  → Request analysis
/api/questionnaires     → Questionnaire API
/api/wearables          → Wearable data
/api/download           → Export/download
/api/me                 → Current user data
```

### COORDINATOR ONLY:

```
/api/coordinator        → Coordinator operations
/api/coordinator/ai     → AI-assisted features
/api/coordinator/guide  → Patient guidance
/api/test-alert         → Alert testing
/api/test-sms           → SMS testing
```

---

## 🎯 Component Architecture

### ADMIN COMPONENTS:

**Both Have:**

- `AdminCommandPalette.tsx` - Command palette UI
- `AdminSidebar.tsx` - Admin navigation
- `LiveAdminDashboard.tsx` - Admin dashboard
- `ThemeToggle.tsx` - Theme switching

**Main Only:**

- `AdminHeader.tsx` - Admin header
- `AdminNotificationBell.tsx` - Notifications
- `AlertProgressBar.tsx` - Progress visualization
- `ProgressBar.tsx` - Progress indicator

**Coordinator Only:**

- `AdminNotificationBell.tsx` - Enhanced notifications

### SPECIALIST COMPONENTS:

**Main Only:**

- `AuditDashboard.tsx`
- `auditor/*` - Auditor components
- `BlockchainAuditTab.tsx`
- `DoctorNotesSection.tsx`
- `PatientQuestionnaire.tsx`
- `QuestionnaireManagement.tsx`
- `SituationReportEditor.tsx`

**Coordinator Only:**

- `CoordinatorGuideVideoMaker.tsx`
- `PatientGuideChatbot.tsx`
- `VitalsAiAgent.tsx`

---

## 🛠️ Action Files Quick Reference

### Core Actions (Both):

```
admin.actions.ts            → Admin operations
ai-assign.actions.ts        → AI assignment
alert.actions.ts            → Alert management
appointment.actions.ts      → Appointments
auth.actions.ts             → Authentication
blockchain-access.actions.ts → Blockchain access
doctor.actions.ts           → Doctor operations
patient.actions.ts          → Patient operations
vital.actions.ts            → Vital signs
```

### Main Project Actions:

```
auditor.actions.ts          → Auditor operations
auditor.actions.ts          → Advanced auditing
blockchain-audit.actions.ts → Blockchain audit
blockchain-explorer.actions.ts → Blockchain explorer
doctor-notes.actions.ts     → Doctor notes
nurse.actions.ts            → Nurse operations
reports.actions.ts          → Report generation
situation-reports.actions.ts → Situation reporting
wearable.actions.ts         → Wearable data
```

### Coordinator Actions:

```
coordinator.actions.ts      → Coordinator ops
blockchain.actions.ts       → Simplified blockchain
export.actions.ts           → Export functionality
notification.actions.ts     → Notifications
questionnaire.actions.ts    → Simplified questionnaires
```

---

## 📚 Library Services

### Main Project:

```
lib/services/
├── audit.service.ts        → Comprehensive audit logging
└── notification.service.ts → Basic notifications
```

### Coordinator Branch:

```
lib/services/
├── hfBiomedAlert.service.ts      → Biomedical alerts
├── hfInference.shared.ts         → Shared ML inference
├── hfMistralClinical.service.ts  → Clinical AI (Mistral)
├── hfVitalGuide.service.ts       → Vital guidance
└── notification.service.ts       → Enhanced notifications
```

### New Libraries in Coordinator:

```
lib/ai/                → AI capabilities
lib/mongodb.ts         → Direct MongoDB
lib/pusher.ts          → Real-time notifications
lib/translations.ts    → i18n support
```

---

## 🧪 Testing & Setup Scripts

### Auditor Setup (Main Only):

```bash
node scripts/create-auditor.js
node scripts/create-auditor-test.js
```

### Cardiology Setup (Main Only):

```bash
npm run test:cardio
npm run test:cardio-complete
npm run test:cardio-demo
npm run test:cardio-analyses
```

### Coordinator Setup (Both):

```bash
node add-coordinator.js <email> <password> [firstName] [lastName]
node add-nurses.js
```

### General Setup (Both):

```bash
npm run prisma:seed          → Seed database
npm run prisma:studio        → View/edit data
npm run prisma:generate      → Generate client
node scripts/create-doctor.js → Create doctor
```

### Testing (Coordinator):

```bash
node check-users.js
node test-db.js
node test-create-user.js
node test-email-config.js
```

---

## 🔐 Role-Based Access Mapping

### Main Project:

```
PATIENT
├── Dashboard: /dashboard/patient
├── Features: Vitals, appointments, analysis, questionnaires
└── Limited access: No admin features

DOCTOR
├── Dashboard: /dashboard/doctor
├── Features: Patient management, vitals, diagnostics, notes
└── Permissions: View patients, create orders

NURSE
├── Dashboard: /dashboard/nurse
├── Features: Patient care, alerts, reminders
└── Permissions: Limited patient updates

AUDITOR
├── Dashboard: /dashboard/auditor
├── Features: Audit logs, user management, blockchain transactions
└── Permissions: Full read, limited write

COORDINATOR
├── Dashboard: /dashboard/coordinator (in prisma only)
├── Features: Not fully implemented in main
└── Status: Defined but unused

ADMIN
├── Dashboard: /dashboard/admin
├── Features: Complete system management
└── Permissions: Full access
```

### Coordinator Branch:

```
PATIENT
├── Dashboard: /dashboard/patient
├── Features: Vitals, appointments, guides
└── Reduced features: No analysis or questionnaires

DOCTOR
├── Dashboard: /dashboard/doctor
├── Features: Patient management, vitals, reports
└── Simplified: Fewer features than main

NURSE/COORDINATOR
├── Dashboard: /dashboard/coordinator
├── Features: Patient guidance, vital review, alerts
└── Combined: Nurse functionality merged into coordinator

COORDINATOR (Primary)
├── Dashboard: /dashboard/coordinator
├── Features: AI-guided care, patient reminders, vital analysis
└── Specialization: Care coordination focus

ADMIN
├── Dashboard: /dashboard/admin
├── Features: System management
└── Simplified: Fewer admin features
```

---

## 🎨 Dashboard Navigation Flow

### Main Project Flow:

```
Login
  ├── PATIENT → /dashboard/patient/*
  ├── DOCTOR → /dashboard/doctor/*
  ├── NURSE → /dashboard/nurse/*
  ├── AUDITOR → /dashboard/auditor/*
  ├── COORDINATOR → /dashboard/coordinator (undefined)
  └── ADMIN → /dashboard/admin/*
```

### Coordinator Branch Flow:

```
Login
  ├── PATIENT → /dashboard/patient/*
  ├── DOCTOR → /dashboard/doctor/*
  ├── NURSE → /dashboard/coordinator/* (redirected)
  ├── COORDINATOR → /dashboard/coordinator/*
  └── ADMIN → /dashboard/admin/*
```

---

## 📋 Documentation Map

### Setup & Getting Started:

```
Main & Coordinator:
  ✅ QUICK_START.md
  ✅ README.md, README-FR.md
  ✅ GUIDE-DEMARRAGE.md
  ✅ IMPLEMENTATION_GUIDE.md

Main Only:
  ⚠️  EXECUTIVE_SUMMARY.md
  ⚠️  PHASE3_4_NEXT_STEPS.md
  ⚠️  RECAP-COMPLET.md
```

### System Documentation:

```
Main & Coordinator:
  ✅ DOCUMENTATION.md
  ✅ PATIENT_MANAGEMENT_DOCUMENTATION.md
  ✅ DIAGRAMMES.md

Main Only:
  ⚠️  AUDITOR_SPACE_DOCUMENTATION.md
  ⚠️  DIAGNOSTIC_GUIDE.md
  ⚠️  API_ADMIN_ENDPOINTS.md
  ⚠️  FIX_PATIENT_NOT_FOUND.md
```

### Testing:

```
Main Only:
  ⚠️  QUESTIONNAIRE_TESTING_GUIDE.md
  ⚠️  QUESTIONNAIRE_TESTING_QUICK_START.md
  ⚠️  CREATE_TEST_NURSE.md
  ⚠️  TEST_NURSE_ACCOUNT.md
  ⚠️  AUDIT_QUICK_START.md

Coordinator:
  ❌ No testing documentation
```

### Integration & Blockchain:

```
Main Only:
  ⚠️  BLOCKCHAIN_API_IMPLEMENTATION.md
  ⚠️  BLOCKCHAIN_TRANSACTIONS_MODULE.md
  ⚠️  BLOCKCHAIN_TRANSACTIONS_QUICK_START.md

Both:
  ✅ INTEGRATION_FINAL_SUMMARY.md
  ✅ INTEGRATION_PHASE1_2_SUMMARY.md
  ✅ INTEGRATION_VISUAL_SUMMARY.md
```

---

## 🔧 Environment & Configuration

### Shared .env Variables:

```
DATABASE_URL              → MongoDB connection
JWT_SECRET               → Auth encryption
JWT_REFRESH_SECRET       → Token refresh
JWT_ACCESS_EXPIRY        → Token lifetime
JWT_REFRESH_EXPIRY       → Refresh token lifetime
BCRYPT_ROUNDS           → Password hashing
NEXT_PUBLIC_*           → Client-side config
SENTRY_AUTH_TOKEN       → Error tracking
AZURE_EMAIL_KEY         → Email service
APPWRITE_*              → Appwrite config
```

### Main Project Specific:

```
BLOCKCHAIN_API_URL
ANALYSIS_SERVICE_KEY
DIAGNOSTIC_API_KEY
```

### Coordinator Specific:

```
PUSHER_APP_ID           → Real-time notifications
PUSHER_APP_KEY
PUSHER_APP_SECRET
MISTRAL_API_KEY         → Clinical AI
HUGGINGFACE_TOKEN       → ML services
```

---

## ⚠️ Migration Considerations

### If Migrating from Main → Coordinator:

**Remove:**

- Auditor role and all related code
- Questionnaire system (models, components, API, actions)
- Diagnostic system
- Wearable integration
- Analysis request system
- Doctor notes system
- Situation reports system
- Blockchain audit trails

**Add:**

- Coordinator role enhancements
- Coordinator dashboard and API
- Coordinator-specific models
- Real-time notification infrastructure
- Advanced AI services
- Patient guidance features

**Update:**

- Prisma schema (remove auditor, enhance coordinator)
- Role enum (remove AUDITOR)
- Type definitions
- Authentication redirects
- Action files (swap for coordinator versions)

---

## 📞 Quick Troubleshooting

### "AUDITOR role not found"

- **Cause**: Running coordinator code with main database
- **Fix**: Use coordinator branch or update schema

### "Coordinator dashboard missing"

- **Cause**: Running main version
- **Fix**: Checkout coordinator branch

### "Missing AI services"

- **Cause**: Running main version
- **Fix**: Use coordinator branch which has HuggingFace services

### "Questionnaire API not working"

- **Cause**: Running coordinator which removed it
- **Fix**: Use main branch for questionnaire features

---

## 🎓 Learning Path

### For Main Project Team:

1. Start with patient registration
2. Learn audit system (AUDITOR role)
3. Explore doctor workflows
4. Study questionnaire system
5. Understand blockchain integration
6. Review diagnostic tools

### For Coordinator Team:

1. Start with patient enrollment
2. Learn coordinator workflows
3. Explore AI-assisted vitals
4. Study real-time alerts
5. Master patient guidance
6. Review care coordination flows

---

**Document Version**: 1.0  
**Last Updated**: April 11, 2026  
**Maintainer**: Healthcare Platform Team
