# 📊 SCHÉMA VISUEL DU PROJET HEALTHCARE

## 🏗️ ARCHITECTURE GLOBALE

```
┌─────────────────────────────────────────────────────────────────┐
│                        HEALTHCARE APP                            │
│                     (Next.js 14 + TypeScript)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │  PATIENT │   │  ADMIN   │   │ APPWRITE │
        │   SIDE   │   │   SIDE   │   │ BACKEND  │
        └──────────┘   └──────────┘   └──────────┘
```

---

## 🔄 FLUX DÉTAILLÉ PATIENT

```
START
  │
  ▼
┌─────────────────────────────────┐
│     PAGE D'ACCUEIL (/)          │
│  • Logo CarePulse               │
│  • Formulaire PatientForm       │
│    - Nom                        │
│    - Email                      │
│    - Téléphone                  │
│  • Lien "Admin"                 │
└─────────────────────────────────┘
  │
  │ [Soumettre]
  ▼
┌─────────────────────────────────┐
│  ACTION: createUser()           │
│  • Appel SDK Appwrite           │
│  • Création dans Users table    │
│  • Génération userId            │
└─────────────────────────────────┘
  │
  │ [Succès]
  ▼
┌─────────────────────────────────────────────┐
│  PAGE REGISTER                              │
│  /patients/[userId]/register                │
│  ────────────────────────────────────────   │
│  📝 FORMULAIRE EN 6 SECTIONS:               │
│                                             │
│  1️⃣ INFORMATIONS PERSONNELLES               │
│     • Nom, Email, Téléphone (pré-remplis)  │
│     • Date de naissance                     │
│     • Sexe (Male/Female/Other)              │
│     • Adresse                               │
│     • Profession                            │
│                                             │
│  2️⃣ INFORMATIONS MÉDICALES                  │
│     • Médecin traitant (liste de 9)        │
│     • Allergies (optionnel)                 │
│     • Médicaments actuels (optionnel)       │
│     • Antécédents familiaux (optionnel)     │
│     • Antécédents personnels (optionnel)    │
│                                             │
│  3️⃣ IDENTIFICATION                          │
│     • Type de pièce (11 types)              │
│     • Numéro d'identification               │
│     • Upload document (drag & drop)         │
│                                             │
│  4️⃣ CONTACT D'URGENCE                       │
│     • Nom du contact                        │
│     • Téléphone                             │
│                                             │
│  5️⃣ ASSURANCE                               │
│     • Nom de l'assureur                     │
│     • Numéro de police                      │
│                                             │
│  6️⃣ CONSENTEMENTS (OBLIGATOIRES)            │
│     ☑ Consentement au traitement           │
│     ☑ Consentement à la divulgation        │
│     ☑ Politique de confidentialité         │
└─────────────────────────────────────────────┘
  │
  │ [Soumettre]
  ▼
┌─────────────────────────────────┐
│  ACTION: registerPatient()      │
│  • Upload fichier → Bucket      │
│  • Création doc PATIENTS        │
│  • Stockage URL document        │
└─────────────────────────────────┘
  │
  │ [Succès]
  ▼
┌─────────────────────────────────────────────┐
│  PAGE NEW APPOINTMENT                       │
│  /patients/[userId]/new-appointment         │
│  ────────────────────────────────────────   │
│  📅 FORMULAIRE DE RENDEZ-VOUS               │
│                                             │
│  • Sélection du médecin                     │
│    (dropdown avec photos)                   │
│                                             │
│  • Date et heure                            │
│    (DatePicker interactif)                  │
│                                             │
│  • Raison de la visite                      │
│    (textarea, requis)                       │
│                                             │
│  • Notes additionnelles                     │
│    (textarea, optionnel)                    │
└─────────────────────────────────────────────┘
  │
  │ [Soumettre]
  ▼
┌─────────────────────────────────┐
│  ACTION: createAppointment()    │
│  • Création doc APPOINTMENTS    │
│  • Status: "pending"            │
│  • Génération appointmentId     │
└─────────────────────────────────┘
  │
  │ [Succès]
  ▼
┌─────────────────────────────────────────────┐
│  PAGE SUCCESS                               │
│  /patients/[userId]/new-appointment/success │
│  ────────────────────────────────────────   │
│  ✅ GIF SUCCÈS ANIMÉ                         │
│                                             │
│  📋 RÉCAPITULATIF:                          │
│     • Nom du patient                        │
│     • Médecin (photo + nom)                 │
│     • Date formatée                         │
│     • Heure                                 │
│                                             │
│  ⏳ "En attente de confirmation admin"      │
│                                             │
│  🔘 [Créer un nouveau rendez-vous]         │
└─────────────────────────────────────────────┘
  │
END
```

---

## 👨‍💼 FLUX DÉTAILLÉ ADMIN

```
START
  │
  ▼
┌─────────────────────────────────┐
│  PAGE D'ACCUEIL + ?admin=true   │
│  ────────────────────────────   │
│  🔐 MODAL PASSKEY                │
│     [⚫][⚫][⚫][⚫][⚫][⚫]      │
│                                 │
│     Code admin: 123456          │
└─────────────────────────────────┘
  │
  │ [Code correct]
  ▼
┌─────────────────────────────────────────────────────┐
│  DASHBOARD ADMIN (/admin)                           │
│  ─────────────────────────────────────────────────  │
│  📊 STATISTIQUES (3 cartes)                         │
│                                                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │ ✅ 3    │  │ ⏳ 3    │  │ ❌ 1    │            │
│  │Scheduled│  │ Pending │  │Cancelled│            │
│  └─────────┘  └─────────┘  └─────────┘            │
│                                                     │
│  📋 TABLEAU DES RENDEZ-VOUS                         │
│  ───────────────────────────────────────────────   │
│  ┌──────┬────────┬────────┬─────────┬────────┐    │
│  │Patient│  Date  │ Status │ Médecin │ Actions│    │
│  ├──────┼────────┼────────┼─────────┼────────┤    │
│  │ 👤   │15/03/26│  ⏳   │ Dr.Green│  📅❌ │    │
│  │Ahmed │ 10:00  │Pending │         │        │    │
│  ├──────┼────────┼────────┼─────────┼────────┤    │
│  │ 👤   │16/03/26│  ✅   │Dr.Leila │  📅❌ │    │
│  │Samira│ 14:30  │Schedule│Cameron  │        │    │
│  └──────┴────────┴────────┴─────────┴────────┘    │
│                                                     │
│  🔍 [Recherche globale...]                         │
└─────────────────────────────────────────────────────┘
  │
  │ [Clic action 📅]
  ▼
┌─────────────────────────────────────────┐
│  MODAL: SCHEDULE APPOINTMENT            │
│  ───────────────────────────────────    │
│  📅 Programmer le rendez-vous           │
│                                         │
│  Médecin: [Dr. John Green     ▼]       │
│  Date:    [15/03/2026        📅]       │
│  Heure:   [10:00             🕐]       │
│  Raison:  Consultation générale         │
│  Note:    [Apporter analyses...]        │
│                                         │
│          [Annuler] [Programmer]         │
└─────────────────────────────────────────┘
  │
  │ [Programmer]
  ▼
┌─────────────────────────────────┐
│  ACTION: updateAppointment()    │
│  • Status: pending → scheduled  │
│  • Mise à jour date/heure       │
│  • Envoi SMS au patient 📱      │
└─────────────────────────────────┘
  │
  │ [Succès]
  ▼
┌─────────────────────────────────┐
│  NOTIFICATION SMS (Twilio)      │
│  ───────────────────────────    │
│  "Greetings from CarePulse.     │
│   Your appointment is confirmed │
│   for 15/03/2026 at 10:00      │
│   with Dr. John Green"          │
└─────────────────────────────────┘
  │
  │ [Retour dashboard]
  ▼
┌─────────────────────────────────┐
│  DASHBOARD ACTUALISÉ            │
│  • Compteurs mis à jour         │
│  • Statut dans tableau changé   │
│  • Badge vert "Scheduled"       │
└─────────────────────────────────┘
  │
END
```

---

## 🗄️ STRUCTURE BASE DE DONNÉES

```
┌─────────────────────────────────────────────────────────┐
│                    APPWRITE DATABASE                    │
│                  (69a44b0e000cdd810e18)                 │
└─────────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┬───────────────┐
         ▼               ▼               ▼               ▼
    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
    │ PATIENTS│    │ DOCTORS │    │APPOINTS │    │ STORAGE │
    └─────────┘    └─────────┘    └─────────┘    └─────────┘

┌────────────────────────────────────────────────────────────────┐
│  PATIENTS (69a44eef0007e88d2a1e)                               │
├────────────────────────────────────────────────────────────────┤
│  📋 Attributes (24 champs):                                    │
│  • userId: string (lien vers Appwrite Users)                   │
│  • name, email, phone: string                                  │
│  • birthDate: datetime                                         │
│  • gender: string (Male/Female/Other)                          │
│  • address, occupation: string                                 │
│  • emergencyContactName, emergencyContactNumber: string        │
│  • primaryPhysician: string                                    │
│  • insuranceProvider, insurancePolicyNumber: string            │
│  • allergies, currentMedication: string (optional)             │
│  • familyMedicalHistory, pastMedicalHistory: string (optional) │
│  • identificationType, identificationNumber: string (optional) │
│  • identificationDocumentId: string (lien Storage)             │
│  • identificationDocumentUrl: string                           │
│  • privacyConsent: boolean                                     │
│  • disclosureConsent: boolean                                  │
│  • treatmentConsent: boolean                                   │
│                                                                │
│  👥 Données actuelles: 5 patients                              │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  DOCTORS (69a44f0b001b21022a8c)                                │
├────────────────────────────────────────────────────────────────┤
│  📋 Attributes (2 champs):                                     │
│  • name: string                                                │
│  • image: string (chemin de l'image)                           │
│                                                                │
│  👨‍⚕️ Données actuelles: 9 médecins                            │
│  1. John Green        6. Alex Ramirez                          │
│  2. Leila Cameron     7. Jasmine Lee                           │
│  3. David Livingston  8. Alyana Cruz                           │
│  4. Evan Peter        9. Hardik Sharma                         │
│  5. Jane Powell                                                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  APPOINTMENTS (69a44f1300357ed151e0)                           │
├────────────────────────────────────────────────────────────────┤
│  📋 Attributes (8 champs):                                     │
│  • patient: string (ID du document patient)                    │
│  • userId: string (ID utilisateur Appwrite)                    │
│  • schedule: datetime                                          │
│  • status: enum (pending | scheduled | cancelled)              │
│  • primaryPhysician: string                                    │
│  • reason: string                                              │
│  • note: string (optional)                                     │
│  • cancellationReason: string (optional)                       │
│                                                                │
│  📅 Données actuelles: 7 rendez-vous                           │
│     • 3 scheduled (programmés)                                 │
│     • 3 pending (en attente)                                   │
│     • 1 cancelled (annulé)                                     │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  STORAGE BUCKET (69a44fc6001b58606e0e)                         │
├────────────────────────────────────────────────────────────────┤
│  📦 Configuration:                                             │
│  • Nom: patient-documents                                      │
│  • Extensions: Toutes autorisées                               │
│  • Taille max: Illimitée                                       │
│  • Permissions: Any (Read/Create/Update/Delete)                │
│                                                                │
│  📄 Contenu: Documents d'identification des patients           │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔗 RELATIONS ENTRE ENTITÉS

```
┌──────────────┐
│  Appwrite    │
│    Users     │
│  (Auth)      │
└──────┬───────┘
       │
       │ userId (string)
       │
       ▼
┌──────────────┐         patientId          ┌──────────────┐
│   PATIENTS   │◄─────────────────────────┤ APPOINTMENTS │
│  Collection  │                           │  Collection  │
└──────┬───────┘                           └──────┬───────┘
       │                                          │
       │ identificationDocumentId                 │ primaryPhysician (string)
       │                                          │
       ▼                                          ▼
┌──────────────┐                           ┌──────────────┐
│   STORAGE    │                           │   DOCTORS    │
│    Bucket    │                           │  Collection  │
└──────────────┘                           └──────────────┘

LÉGENDE:
─► Relation directe (Foreign Key)
──┤ Relation de lookup (par nom)
```

---

## 🎨 COMPOSANTS & HIÉRARCHIE

```
App Layout (layout.tsx)
│
├── Home Page (/)
│   ├── PasskeyModal (si ?admin=true)
│   ├── PatientForm
│   │   ├── CustomFormField (INPUT)
│   │   ├── CustomFormField (PHONE_INPUT)
│   │   └── SubmitButton
│   └── Image (onboarding-img)
│
├── Register Page (/patients/[userId]/register)
│   ├── RegisterForm
│   │   ├── CustomFormField × 20+
│   │   │   ├── INPUT
│   │   │   ├── PHONE_INPUT
│   │   │   ├── DATE_PICKER
│   │   │   ├── SELECT
│   │   │   ├── TEXTAREA
│   │   │   └── CHECKBOX × 3
│   │   ├── FileUploader
│   │   └── SubmitButton
│   └── Image (register-img)
│
├── New Appointment (/patients/[userId]/new-appointment)
│   ├── AppointmentForm (type="create")
│   │   ├── CustomFormField (SELECT) - Médecin
│   │   ├── CustomFormField (DATE_PICKER)
│   │   ├── CustomFormField (TEXTAREA) - Raison
│   │   ├── CustomFormField (TEXTAREA) - Note
│   │   └── SubmitButton
│   └── Image (appointment-img)
│
├── Success Page (/patients/[userId]/new-appointment/success)
│   ├── Image (success.gif)
│   ├── Récapitulatif
│   │   ├── Info patient
│   │   ├── Info médecin
│   │   └── Date/heure
│   └── Button (Nouveau rendez-vous)
│
└── Admin Page (/admin)
    ├── Header
    ├── StatCard × 3
    │   ├── Icon
    │   ├── Count
    │   └── Label
    ├── DataTable
    │   ├── Search (global)
    │   ├── Columns × 5
    │   │   ├── Patient (avatar + nom)
    │   │   ├── Date
    │   │   ├── Status (StatusBadge)
    │   │   ├── Doctor (image + nom)
    │   │   └── Actions (icons)
    │   └── Rows (appointments)
    └── AppointmentModal
        └── AppointmentForm (type="schedule" ou "cancel")
```

---

## 🔄 CYCLE DE VIE D'UN RENDEZ-VOUS

```
┌───────────┐
│  PATIENT  │
│  Crée RDV │
└─────┬─────┘
      │
      ▼
┌─────────────────┐
│   📝 PENDING    │◄──────┐
│  (En attente)   │       │
│                 │       │ Admin peut
│  • Nouveau      │       │ re-programmer
│  • Non confirmé │       │
│  • Attente      │       │
│    validation   │       │
└────────┬────────┘       │
         │                │
         │ Admin          │
         │ programme      │
         │                │
         ▼                │
┌─────────────────┐       │
│  ✅ SCHEDULED   │───────┘
│  (Programmé)    │
│                 │
│  • Date/heure   │
│    confirmée    │
│  • SMS envoyé   │
│  • Affiché en   │
│    vert         │
└────────┬────────┘
         │
         │ Admin peut
         │ annuler
         │
         ▼
┌─────────────────┐
│  ❌ CANCELLED   │
│   (Annulé)      │
│                 │
│  • Raison       │
│    notée        │
│  • SMS envoyé   │
│  • Affiché en   │
│    rouge        │
│  • Définitif    │
└─────────────────┘

ÉTATS:
• PENDING → SCHEDULED : ✅ (via admin)
• PENDING → CANCELLED : ❌ (via admin)
• SCHEDULED → CANCELLED : ❌ (via admin)
• SCHEDULED → PENDING : 🔄 (pas implémenté)
```

---

## 📦 STACK TECHNIQUE COMPLET

```
┌──────────────────────────────────────────────────────────────┐
│                      FRONTEND STACK                          │
├──────────────────────────────────────────────────────────────┤
│  🎨 Interface                                                │
│     • Next.js 14 (App Router, Server Components)             │
│     • React 18 (Hooks, Context)                              │
│     • TypeScript (Typage strict)                             │
│                                                              │
│  💅 Styling                                                  │
│     • Tailwind CSS (Utility-first)                           │
│     • CSS Modules (Scoped styles)                            │
│     • tailwindcss-animate (Animations)                       │
│                                                              │
│  🧩 Composants UI                                            │
│     • Radix UI (Headless components)                         │
│     • shadcn/ui (Pre-built components)                       │
│     • Lucide React (Icons)                                   │
│                                                              │
│  📝 Formulaires                                              │
│     • React Hook Form (State management)                     │
│     • Zod (Schema validation)                                │
│     • @hookform/resolvers (Intégration)                      │
│                                                              │
│  📊 Tableaux                                                 │
│     • TanStack Table v8 (Headless table)                     │
│     • Sorting, Filtering, Pagination                         │
│                                                              │
│  📅 Date & Time                                              │
│     • react-datepicker (Date picker)                         │
│     • date-fns (Date manipulation)                           │
│                                                              │
│  📞 Téléphone                                                │
│     • react-phone-number-input (International)               │
│     • libphonenumber-js (Validation)                         │
│                                                              │
│  📁 Upload                                                   │
│     • react-dropzone (Drag & drop)                           │
│     • File API (Browser native)                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                      BACKEND STACK                           │
├──────────────────────────────────────────────────────────────┤
│  🗄️ Base de données                                          │
│     • Appwrite (BaaS)                                        │
│       - Users (Auth)                                         │
│       - Databases (NoSQL)                                    │
│       - Storage (Files)                                      │
│       - Messaging (SMS via Twilio)                           │
│                                                              │
│  🔐 Authentification                                         │
│     • Appwrite Users API                                     │
│     • Code admin (passkey simple)                            │
│                                                              │
│  📡 API                                                      │
│     • Next.js Server Actions                                 │
│     • node-appwrite SDK                                      │
│                                                              │
│  📱 Notifications                                            │
│     • Twilio (SMS)                                           │
│     • Appwrite Messaging                                     │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    MONITORING & TOOLS                        │
├──────────────────────────────────────────────────────────────┤
│  🐛 Error Tracking                                           │
│     • Sentry (Client/Server/Edge)                            │
│     • Source maps upload                                     │
│                                                              │
│  🔍 Development                                              │
│     • ESLint (Linting)                                       │
│     • Prettier (Formatting)                                  │
│     • TypeScript (Type checking)                             │
│                                                              │
│  📦 Package Manager                                          │
│     • npm (Node Package Manager)                             │
│                                                              │
│  🚀 Deployment                                               │
│     • Vercel (Recommandé)                                    │
│     • Docker (Possible)                                      │
└──────────────────────────────────────────────────────────────┘
```

---

**📄 Documentation créée le 2 Mars 2026**  
**✍️ Auteur: AI Assistant**  
**📌 Version: 1.0**
