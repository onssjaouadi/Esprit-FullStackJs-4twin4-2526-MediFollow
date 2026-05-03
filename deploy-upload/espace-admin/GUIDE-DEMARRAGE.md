# 🚀 GUIDE DE DÉMARRAGE RAPIDE

## ⚡ Installation en 5 minutes

### **Prérequis**

- ✅ Node.js 18+ installé
- ✅ npm ou yarn
- ✅ Compte Appwrite (gratuit)
- ✅ Git

---

## 📝 ÉTAPES D'INSTALLATION

### **1️⃣ Cloner le projet**

```bash
cd healthcare-main
```

### **2️⃣ Installer les dépendances**

```bash
npm install
```

### **3️⃣ Configuration Appwrite**

#### Option A: Automatique (Recommandé) ✨

```bash
# Le fichier .env est déjà configuré avec:
NEXT_PUBLIC_ENDPOINT=https://fra.cloud.appwrite.io/v1
PROJECT_ID=69a44a5f0000c59533af
DATABASE_ID=69a44b0e000cdd810e18
PATIENT_COLLECTION_ID=69a44eef0007e88d2a1e
DOCTOR_COLLECTION_ID=69a44f0b001b21022a8c
APPOINTMENT_COLLECTION_ID=69a44f1300357ed151e0
NEXT_PUBLIC_BUCKET_ID=69a44fc6001b58606e0e
NEXT_PUBLIC_ADMIN_PASSKEY=123456
```

**✅ La base de données est déjà créée et configurée !**

#### Option B: Configuration manuelle (Si besoin)

```bash
# Créer les collections automatiquement
node setup-appwrite.js

# Ajouter des données de démonstration
node add-demo-data.js

# Ajouter des rendez-vous
node add-appointments.js
```

### **4️⃣ Lancer l'application**

```bash
npm run dev
```

### **5️⃣ Ouvrir dans le navigateur**

```
http://localhost:3000
```

---

## 🎯 TESTER L'APPLICATION

### **A. Créer un nouveau patient**

1. Accédez à `http://localhost:3000`
2. Remplissez le formulaire:
   - **Nom**: Votre nom
   - **Email**: votre.email@example.com
   - **Téléphone**: +212612345678 (format international)
3. Cliquez sur **"Get Started"**

4. Complétez le formulaire d'enregistrement:
   - Informations personnelles
   - Informations médicales
   - **Important**: Uploadez un document (any file)
   - **Important**: Cochez les 3 cases de consentement
5. Cliquez sur **"Submit and Continue"**

6. Créez votre premier rendez-vous:
   - Choisissez un médecin
   - Sélectionnez une date/heure
   - Décrivez la raison
7. Cliquez sur **"Submit Appointment"**

✅ **Succès !** Vous verrez la page de confirmation

---

### **B. Accéder au Dashboard Admin**

1. Accédez à `http://localhost:3000/?admin=true`
2. Entrez le code: **`123456`**
3. Cliquez sur **"Access Admin"**

Vous verrez:

- 📊 **3 statistiques** (programmés, en attente, annulés)
- 📋 **Tableau des rendez-vous**
- 🔍 **Recherche** et tri

#### **Gérer un rendez-vous:**

**Pour programmer un rendez-vous en attente:**

1. Cliquez sur l'icône 📅 dans la colonne **Actions**
2. Confirmez ou modifiez la date/heure
3. Cliquez sur **"Schedule Appointment"**
4. ➜ Le statut passe à **scheduled** (vert)

**Pour annuler un rendez-vous:**

1. Cliquez sur l'icône ❌ dans la colonne **Actions**
2. Entrez une raison d'annulation
3. Cliquez sur **"Cancel Appointment"**
4. ➜ Le statut passe à **cancelled** (rouge)

---

## 📱 FONCTIONNALITÉS DISPONIBLES

### **Côté Patient**

✅ Inscription (nom, email, téléphone)  
✅ Enregistrement complet (toutes les informations)  
✅ Upload de documents d'identification  
✅ Prise de rendez-vous  
✅ Page de confirmation  
✅ Choix parmi 9 médecins

### **Côté Admin**

✅ Dashboard avec statistiques en temps réel  
✅ Vue de tous les rendez-vous  
✅ Tri et recherche dans le tableau  
✅ Programmer les rendez-vous (pending → scheduled)  
✅ Annuler les rendez-vous  
✅ Badges de statut colorés

### **Notifications** (si Twilio configuré)

📱 SMS de confirmation de rendez-vous  
📱 SMS d'annulation

---

## 🗂️ DONNÉES DE DÉMONSTRATION

### **5 Patients pré-chargés:**

| Nom              | Email                        | Profession  |
| ---------------- | ---------------------------- | ----------- |
| Ahmed Benali     | ahmed.benali@example.com     | Ingénieur   |
| Samira El Amrani | samira.elamrani@example.com  | Professeur  |
| Youssef Tazi     | youssef.tazi@example.com     | Commerçant  |
| Leila Benjelloun | leila.benjelloun@example.com | Architecte  |
| Hamza Alaoui     | hamza.alaoui@example.com     | Développeur |

### **9 Médecins disponibles:**

- Dr. John Green
- Dr. Leila Cameron
- Dr. David Livingston
- Dr. Evan Peter
- Dr. Jane Powell
- Dr. Alex Ramirez
- Dr. Jasmine Lee
- Dr. Alyana Cruz
- Dr. Hardik Sharma

### **7 Rendez-vous pré-chargés:**

- 3 × **scheduled** (programmés et confirmés)
- 3 × **pending** (en attente de validation)
- 1 × **cancelled** (annulé avec raison)

---

## 🔧 SCRIPTS UTILES

```bash
# Développement
npm run dev          # Lance le serveur de développement

# Production
npm run build        # Build l'application
npm start            # Lance en production

# Maintenance
npm run lint         # Vérification du code

# Scripts Appwrite personnalisés
node setup-appwrite.js              # Créer toute la structure
node add-demo-data.js               # Ajouter 5 patients
node add-appointments.js            # Ajouter 7 rendez-vous
node fix-appointments-attributes.js # Corriger les attributs
node update-bucket.js               # Mettre à jour le bucket
```

---

## 📂 STRUCTURE DES FICHIERS IMPORTANTS

```
healthcare-main/
├── .env                    ← Variables d'environnement
├── package.json            ← Dépendances
├── DOCUMENTATION.md        ← Documentation complète
├── DIAGRAMMES.md          ← Schémas visuels
├── GUIDE-DEMARRAGE.md     ← Ce fichier
│
├── app/                    ← Pages Next.js
│   ├── page.tsx           ← Page d'accueil
│   ├── admin/page.tsx     ← Dashboard admin
│   └── patients/
│       └── [userId]/
│           ├── register/page.tsx
│           └── new-appointment/page.tsx
│
├── components/             ← Composants React
│   ├── forms/             ← Formulaires
│   ├── table/             ← Tableau de données
│   └── ui/                ← Composants UI (shadcn)
│
├── lib/                    ← Logique métier
│   ├── actions/           ← Server actions
│   ├── appwrite.config.ts ← Config Appwrite
│   ├── utils.ts           ← Utilitaires
│   └── validation.ts      ← Schémas Zod
│
└── constants/
    └── index.ts           ← Constantes (médecins, etc.)
```

---

## ⚙️ CONFIGURATION

### **Variables d'environnement (.env)**

Toutes les variables sont déjà configurées. Voici leur signification :

| Variable                    | Description              | Valeur actuelle  |
| --------------------------- | ------------------------ | ---------------- |
| `NEXT_PUBLIC_ENDPOINT`      | URL API Appwrite         | Frankfurt server |
| `PROJECT_ID`                | ID du projet Appwrite    | 69a44a5f...      |
| `API_KEY`                   | Clé API serveur (SECRET) | standard_c11...  |
| `DATABASE_ID`               | ID de la base de données | 69a44b0e...      |
| `PATIENT_COLLECTION_ID`     | Collection patients      | 69a44eef...      |
| `DOCTOR_COLLECTION_ID`      | Collection médecins      | 69a44f0b...      |
| `APPOINTMENT_COLLECTION_ID` | Collection rendez-vous   | 69a44f13...      |
| `NEXT_PUBLIC_BUCKET_ID`     | Bucket de stockage       | 69a44fc6...      |
| `NEXT_PUBLIC_ADMIN_PASSKEY` | Code d'accès admin       | 123456           |

⚠️ **Important**: Les variables `NEXT_PUBLIC_*` sont exposées côté client.

---

## 🎨 PERSONNALISATION

### **Changer les couleurs** (`tailwind.config.ts`)

```typescript
colors: {
  green: {
    500: "#24AE7C", // Couleur principale
  },
  blue: {
    500: "#79B5EC", // Couleur pending
  },
  red: {
    500: "#F37877", // Couleur annulation
  },
}
```

### **Changer le code admin** (`.env`)

```env
NEXT_PUBLIC_ADMIN_PASSKEY=votre_code_secret
```

### **Ajouter un médecin**

Console Appwrite → Collection DOCTORS → Create Document

```json
{
  "name": "Dr. Nouveau Médecin",
  "image": "/assets/images/dr-nouveau.png"
}
```

Puis mettre à jour `constants/index.ts`:

```typescript
export const Doctors = [
  // ... médecins existants
  {
    image: "/assets/images/dr-nouveau.png",
    name: "Nouveau Médecin",
  },
];
```

---

## 🐛 DÉPANNAGE

### **Problème: "Module not found"**

```bash
# Réinstaller les dépendances
rm -rf node_modules
rm package-lock.json
npm install
```

### **Problème: "Can't connect to Appwrite"**

1. Vérifiez le fichier `.env`
2. Vérifiez que les IDs sont corrects
3. Vérifiez la connexion internet

### **Problème: "File extension not allowed"**

```bash
# Exécuter le script de correction
node update-bucket.js
```

### **Problème: "Missing required attribute"**

```bash
# Recréer les attributs manquants
node fix-appointments-attributes.js
```

### **Problème: App ne démarre pas**

```bash
# Vérifier les erreurs
npm run lint

# Nettoyer le cache Next.js
rm -rf .next
npm run dev
```

---

## 📚 RESSOURCES

### **Documentation officielle**

- [Next.js](https://nextjs.org/docs) - Framework
- [Appwrite](https://appwrite.io/docs) - Backend
- [TailwindCSS](https://tailwindcss.com/docs) - CSS
- [shadcn/ui](https://ui.shadcn.com) - Composants UI
- [React Hook Form](https://react-hook-form.com) - Formulaires
- [Zod](https://zod.dev) - Validation

### **Tutoriels**

- [JavaScript Mastery - YouTube](https://www.youtube.com/@javascriptmastery)
- Guide complet vidéo du projet

### **Support**

- Discord JavaScript Mastery (34k+ membres)
- GitHub Issues du projet

---

## 🎓 CONCEPTS À COMPRENDRE

### **1. Next.js App Router**

- Routes basées sur les fichiers
- Server Components par défaut
- Loading states automatiques

### **2. Server Actions**

- Fonctions serveur appelables côté client
- Préfixe `"use server"`
- Pas besoin d'API routes

### **3. Appwrite BaaS**

- Backend hébergé (pas de serveur à gérer)
- Auth, Database, Storage intégrés
- SDK Node.js pour interactions

### **4. React Hook Form + Zod**

- Gestion d'état des formulaires
- Validation côté client
- Messages d'erreur automatiques

### **5. TypeScript**

- Typage statique pour éviter les erreurs
- Autocomplétion intelligente
- Interfaces pour les données

---

## 🚀 PROCHAINES ÉTAPES

### **Pour apprendre:**

1. ✅ Testez toutes les fonctionnalités
2. ✅ Créez plusieurs patients
3. ✅ Gérez les rendez-vous en admin
4. ✅ Explorez le code source
5. ✅ Modifiez les styles
6. ✅ Ajoutez un nouveau médecin

### **Pour améliorer:**

1. 🔐 Ajoutez un vrai système d'auth
2. 📧 Intégrez les emails (Resend)
3. 📅 Ajoutez un calendrier visuel
4. 💬 Ajoutez un chat patient-médecin
5. 📊 Créez des statistiques avancées
6. 🌍 Traduisez en plusieurs langues
7. 📱 Créez une app mobile

### **Pour déployer:**

1. Créez un compte [Vercel](https://vercel.com)
2. Connectez votre repo GitHub
3. Configurez les variables d'env
4. Déployez en 1 clic !

---

## ✅ CHECKLIST DE DÉMARRAGE

- [ ] Node.js 18+ installé
- [ ] Projet téléchargé
- [ ] `npm install` exécuté
- [ ] Fichier `.env` configuré
- [ ] `npm run dev` lancé
- [ ] Application ouverte (`localhost:3000`)
- [ ] Patient de test créé
- [ ] Rendez-vous créé
- [ ] Dashboard admin testé (`?admin=true`)
- [ ] Code admin fonctionnel (`123456`)
- [ ] Documentation lue

---

## 💡 CONSEILS

### **Pour débuter:**

- ✅ Commencez par créer un patient
- ✅ Testez le flow complet avant de modifier
- ✅ Utilisez les données de démo
- ✅ Explorez le dashboard admin

### **Pour développer:**

- ✅ Modifiez un fichier à la fois
- ✅ Testez après chaque changement
- ✅ Utilisez TypeScript pour éviter les erreurs
- ✅ Consultez la console pour les erreurs

### **Pour personnaliser:**

- ✅ Commencez par les couleurs (Tailwind)
- ✅ Modifiez le texte dans les composants
- ✅ Ajoutez vos propres images
- ✅ Changez le logo

---

## 🎉 C'EST PARTI !

Vous êtes prêt à utiliser l'application. Si vous avez des questions:

1. 📖 Consultez `DOCUMENTATION.md` pour les détails
2. 📊 Consultez `DIAGRAMMES.md` pour les schémas
3. 💬 Rejoignez la communauté Discord
4. 🐛 Ouvrez une issue sur GitHub

**Bon développement ! 🚀**

---

_Guide créé le 2 Mars 2026_  
_Version 1.0 - Healthcare Management System_
