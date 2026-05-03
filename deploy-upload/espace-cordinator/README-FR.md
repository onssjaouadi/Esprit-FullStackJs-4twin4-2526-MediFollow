# 🏥 HEALTHCARE - Système de Gestion de Patients

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Appwrite](https://img.shields.io/badge/Appwrite-1.8-f02e65?style=for-the-badge&logo=appwrite)](https://appwrite.io/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

> **Application web complète de gestion de rendez-vous médicaux avec dashboard administrateur, notifications SMS et gestion de documents.**

---

## 📋 Table des Matières

- [✨ Aperçu](#-aperçu)
- [🎯 Fonctionnalités](#-fonctionnalités)
- [🚀 Démarrage Rapide](#-démarrage-rapide)
- [📱 Utilisation](#-utilisation)
- [🗄️ Base de Données](#️-base-de-données)
- [🛠️ Technologies](#️-technologies)
- [📚 Documentation](#-documentation)
- [🤝 Contribution](#-contribution)

---

## ✨ Aperçu

**CarePulse** est une plateforme moderne de gestion de santé permettant aux patients de prendre des rendez-vous avec des médecins et aux administrateurs de gérer ces rendez-vous efficacement.

### 🎬 Démo

```bash
npm run dev
# Ouvrez http://localhost:3000
```

**Accès Admin** : http://localhost:3000/?admin=true  
**Code Admin** : `123456`

---

## 🎯 Fonctionnalités

### 👤 **Côté Patient**

| Fonctionnalité                | Description                                                |
| ----------------------------- | ---------------------------------------------------------- |
| 📝 **Inscription**            | Création de compte avec nom, email et téléphone            |
| 📋 **Enregistrement complet** | Formulaire détaillé avec toutes les informations médicales |
| 🆔 **Upload de documents**    | Upload sécurisé de pièces d'identité (drag & drop)         |
| 📅 **Prise de rendez-vous**   | Sélection médecin, date/heure, raison de consultation      |
| ✅ **Confirmation**           | Page de succès avec récapitulatif du rendez-vous           |
| 👨‍⚕️ **Choix de médecins**      | 9 médecins disponibles avec photos                         |

### 👨‍💼 **Côté Administrateur**

| Fonctionnalité           | Description                                      |
| ------------------------ | ------------------------------------------------ |
| 📊 **Dashboard**         | Vue d'ensemble avec 3 statistiques en temps réel |
| 📋 **Gestion des RDV**   | Tableau complet avec tri, recherche et filtres   |
| ✅ **Programmer**        | Validation des rendez-vous en attente            |
| ❌ **Annuler**           | Annulation avec raison obligatoire               |
| 📱 **Notifications SMS** | Envoi automatique via Twilio                     |
| 🔍 **Recherche**         | Recherche globale dans tous les champs           |

### 🔐 **Sécurité & Autres**

| Fonctionnalité            | Description                          |
| ------------------------- | ------------------------------------ |
| 🔒 **Code d'accès admin** | Protection par code à 6 chiffres     |
| 📱 **Responsive**         | Compatible mobile, tablette, desktop |
| 🐛 **Monitoring Sentry**  | Suivi des erreurs en production      |
| ✨ **UI Moderne**         | Design dark avec animations fluides  |
| 📝 **Validation**         | Validation complète avec Zod         |

---

## 🚀 Démarrage Rapide

### **Prérequis**

- Node.js 18+
- npm ou yarn
- Compte Appwrite (gratuit)

### **Installation**

```bash
# 1. Installer les dépendances
npm install

# 2. Configuration déjà faite !
# Le fichier .env est pré-configuré avec la base de données

# 3. Lancer l'application
npm run dev

# 4. Ouvrir dans le navigateur
# → http://localhost:3000
```

### **🎉 C'est tout ! L'application est prête à utiliser.**

---

## 📱 Utilisation

### **Créer un nouveau patient**

1. Accédez à `http://localhost:3000`
2. Remplissez : Nom, Email, Téléphone
3. Cliquez sur **"Get Started"**
4. Complétez le formulaire d'enregistrement
5. ⚠️ **Important** : Cochez les 3 cases de consentement
6. Créez votre rendez-vous

### **Accéder au Dashboard Admin**

1. Accédez à `http://localhost:3000/?admin=true`
2. Entrez le code : **`123456`**
3. Gérez les rendez-vous :
   - 📅 **Programmer** : Passer de "pending" à "scheduled"
   - ❌ **Annuler** : Annuler avec raison

---

## 🗄️ Base de Données

### **Collections Appwrite**

```
┌─────────────────────────────────────────────┐
│              BASE DE DONNÉES                │
├─────────────────────────────────────────────┤
│                                             │
│  PATIENTS (69a44eef0007e88d2a1e)            │
│  ├─ 24 attributs                            │
│  ├─ Infos personnelles                      │
│  ├─ Infos médicales                         │
│  ├─ Assurance                               │
│  └─ Documents                               │
│                                             │
│  DOCTORS (69a44f0b001b21022a8c)             │
│  ├─ 9 médecins pré-chargés                  │
│  └─ Nom + Photo                             │
│                                             │
│  APPOINTMENTS (69a44f1300357ed151e0)        │
│  ├─ 7 rendez-vous de démo                   │
│  ├─ Status: pending/scheduled/cancelled     │
│  └─ Date, médecin, raison                   │
│                                             │
│  STORAGE (69a44fc6001b58606e0e)             │
│  └─ Documents d'identification              │
│                                             │
└─────────────────────────────────────────────┘
```

### **Données de Démonstration**

**5 Patients** : Ahmed, Samira, Youssef, Leila, Hamza  
**9 Médecins** : Dr. Green, Dr. Cameron, Dr. Livingston, etc.  
**7 Rendez-vous** : 3 scheduled, 3 pending, 1 cancelled

---

## 🛠️ Technologies

### **Frontend**

- **Next.js 14** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling utility-first
- **shadcn/ui** - Composants UI modernes
- **React Hook Form** - Gestion de formulaires
- **Zod** - Validation de schémas
- **TanStack Table** - Tableaux de données avancés

### **Backend**

- **Appwrite** - Backend-as-a-Service
  - Auth (Gestion utilisateurs)
  - Database (NoSQL)
  - Storage (Fichiers)
  - Messaging (SMS)
- **Twilio** - Envoi de SMS

### **Monitoring**

- **Sentry** - Tracking d'erreurs

---

## 📚 Documentation

Le projet inclut 3 documents complets :

| Fichier                                     | Description                                                      |
| ------------------------------------------- | ---------------------------------------------------------------- |
| 📖 [DOCUMENTATION.md](DOCUMENTATION.md)     | Documentation technique complète (architecture, API, composants) |
| 📊 [DIAGRAMMES.md](DIAGRAMMES.md)           | Schémas visuels (flux, base de données, composants)              |
| 🚀 [GUIDE-DEMARRAGE.md](GUIDE-DEMARRAGE.md) | Guide de démarrage rapide et dépannage                           |

### **Contenu détaillé**

- ✅ Architecture du projet
- ✅ Description de toutes les pages
- ✅ Structure de la base de données
- ✅ Flux utilisateur complet
- ✅ API et Server Actions
- ✅ Composants React
- ✅ Configuration et déploiement
- ✅ Dépannage

---

## 📁 Structure du Projet

```
healthcare-main/
├── 📱 app/                      # Pages Next.js (App Router)
│   ├── page.tsx                 # Accueil (inscription)
│   ├── admin/page.tsx           # Dashboard admin
│   └── patients/[userId]/
│       ├── register/            # Enregistrement patient
│       └── new-appointment/     # Prise de rendez-vous
│
├── 🧩 components/               # Composants React
│   ├── forms/                   # Formulaires
│   │   ├── PatientForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── AppointmentForm.tsx
│   ├── table/                   # Tableau de données
│   │   ├── DataTable.tsx
│   │   └── columns.tsx
│   └── ui/                      # Composants UI (shadcn)
│
├── 📚 lib/                      # Logique métier
│   ├── actions/                 # Server Actions
│   │   ├── patient.actions.ts
│   │   └── appointment.actions.ts
│   ├── appwrite.config.ts       # Config Appwrite
│   ├── utils.ts                 # Utilitaires
│   └── validation.ts            # Schémas Zod
│
├── 🎨 public/assets/            # Images et icônes
│   ├── images/                  # Photos médecins, backgrounds
│   ├── icons/                   # SVG icons
│   └── gifs/                    # Animations
│
├── 📝 Documentation/
│   ├── DOCUMENTATION.md         # Doc complète
│   ├── DIAGRAMMES.md           # Schémas
│   ├── GUIDE-DEMARRAGE.md      # Guide rapide
│   └── README-FR.md            # Ce fichier
│
└── ⚙️ Configuration
    ├── .env                     # Variables d'environnement
    ├── next.config.mjs          # Config Next.js
    ├── tailwind.config.ts       # Config Tailwind
    └── tsconfig.json            # Config TypeScript
```

---

## 🎨 Captures d'écran

### Page d'Accueil

```
┌─────────────────────────────────────────┐
│  🏥 CarePulse                           │
│  ───────────────────────────────────    │
│                                         │
│  Hi there 👋                            │
│  Get Started with Appointments          │
│                                         │
│  Full Name:    [John Doe          ]    │
│  Email:        [john@example.com  ]    │
│  Phone:        [+1 234 567 8900   ]    │
│                                         │
│         [Get Started →]                 │
│                                         │
│  © 2024 CarePulse         [Admin]      │
└─────────────────────────────────────────┘
```

### Dashboard Admin

```
┌─────────────────────────────────────────────────────┐
│  🏥 CarePulse          Admin Dashboard              │
│  ───────────────────────────────────────────────    │
│                                                     │
│  Welcome 👋                                         │
│  Start the day with managing new appointments      │
│                                                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │ ✅ 3    │  │ ⏳ 3    │  │ ❌ 1    │            │
│  │Scheduled│  │ Pending │  │Cancelled│            │
│  └─────────┘  └─────────┘  └─────────┘            │
│                                                     │
│  [🔍 Search...]                                     │
│                                                     │
│  ┌──────┬────────┬────────┬─────────┬────────┐    │
│  │Patient│  Date  │ Status │ Doctor  │ Actions│    │
│  ├──────┼────────┼────────┼─────────┼────────┤    │
│  │Ahmed │15/03/26│  ⏳   │Dr.Green │ 📅 ❌ │    │
│  │Samira│16/03/26│  ✅   │Dr.Leila │ 📅 ❌ │    │
│  └──────┴────────┴────────┴─────────┴────────┘    │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 Scripts Disponibles

| Commande                   | Description                       |
| -------------------------- | --------------------------------- |
| `npm run dev`              | Lance le serveur de développement |
| `npm run build`            | Build pour la production          |
| `npm start`                | Lance en mode production          |
| `npm run lint`             | Vérification ESLint               |
| `node setup-appwrite.js`   | Créer la structure Appwrite       |
| `node add-demo-data.js`    | Ajouter des patients de démo      |
| `node add-appointments.js` | Ajouter des rendez-vous           |

---

## ⚙️ Variables d'Environnement

Fichier `.env` déjà configuré :

```env
# 🔧 Appwrite
NEXT_PUBLIC_ENDPOINT=https://fra.cloud.appwrite.io/v1
PROJECT_ID=69a44a5f0000c59533af
API_KEY=standard_c11ace...
DATABASE_ID=69a44b0e000cdd810e18

# 📋 Collections
PATIENT_COLLECTION_ID=69a44eef0007e88d2a1e
DOCTOR_COLLECTION_ID=69a44f0b001b21022a8c
APPOINTMENT_COLLECTION_ID=69a44f1300357ed151e0

# 📦 Storage
NEXT_PUBLIC_BUCKET_ID=69a44fc6001b58606e0e

# 🔐 Sécurité
NEXT_PUBLIC_ADMIN_PASSKEY=123456
```

---

## 🐛 Dépannage

### Problèmes courants

**❌ Module introuvable**

```bash
rm -rf node_modules package-lock.json
npm install
```

**❌ Erreur de connexion Appwrite**

- Vérifiez le fichier `.env`
- Vérifiez votre connexion internet

**❌ Extension de fichier non autorisée**

```bash
node update-bucket.js
```

**❌ Attribut manquant**

```bash
node fix-appointments-attributes.js
```

---

## 🚀 Déploiement

### **Vercel (Recommandé)**

1. Push le code sur GitHub
2. Connectez-vous à [Vercel](https://vercel.com)
3. Importez le projet
4. Configurez les variables d'environnement
5. Déployez !

### **Autres plateformes**

- **Netlify** : Supporte Next.js
- **Railway** : Simple et rapide
- **Docker** : Image personnalisée possible

---

## 📈 Roadmap

### ✅ Fonctionnalités actuelles

- [x] Inscription patient
- [x] Enregistrement complet
- [x] Upload de documents
- [x] Prise de rendez-vous
- [x] Dashboard admin
- [x] Gestion des rendez-vous
- [x] Notifications SMS
- [x] Recherche et tri

### 🔜 Améliorations futures

- [ ] Authentification complète (Auth.js)
- [ ] Gestion des rôles (Patient, Doctor, Admin)
- [ ] Notifications email (Resend)
- [ ] Calendrier visuel (FullCalendar)
- [ ] Chat patient-médecin
- [ ] Rapports médicaux PDF
- [ ] Application mobile
- [ ] Multi-langues (i18n)
- [ ] Paiement en ligne (Stripe)
- [ ] Rappels automatiques

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

---

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

## 👨‍💻 Auteurs

- **Projet original** : [JavaScript Mastery](https://www.youtube.com/@javascriptmastery)
- **Documentation** : AI Assistant
- **Configuration** : Équipe de développement

---

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) - Framework
- [Appwrite](https://appwrite.io/) - Backend
- [shadcn/ui](https://ui.shadcn.com) - Composants UI
- [Tailwind CSS](https://tailwindcss.com/) - CSS
- [JavaScript Mastery](https://www.youtube.com/@javascriptmastery) - Tutoriel

---

## 📞 Support

- 📧 Email : support@carepulse.com
- 💬 Discord : [JavaScript Mastery](https://discord.com/invite/n6EdbFJ)
- 🐛 Issues : [GitHub Issues](https://github.com/adrianhajdin/healthcare/issues)

---

## 📊 Statistiques

![Next.js](https://img.shields.io/badge/Version-14.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![Status](https://img.shields.io/badge/Status-Production-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

<div align="center">

**⭐ N'oubliez pas de mettre une étoile au projet si vous l'aimez ! ⭐**

**Fait avec ❤️ par l'équipe CarePulse**

[📖 Documentation](DOCUMENTATION.md) • [🚀 Guide](GUIDE-DEMARRAGE.md) • [📊 Diagrammes](DIAGRAMMES.md)

</div>
