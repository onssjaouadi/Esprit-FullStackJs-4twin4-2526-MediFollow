# Fix: Patient Non Trouvé

## 🔴 Problème

Les utilisateurs avec le rôle `PATIENT` n'avaient pas de profil `Patient` associé, ce qui causait des erreurs "Patient non trouvé" sur les pages patients.

## ✅ Solution Implémentée

### 1. **Modification de la fonction d'inscription** (`lib/actions/auth.actions.ts`)

La fonction `register()` crée maintenant automatiquement un profil `Patient` quand on crée un utilisateur avec le rôle `PATIENT`.

**Changements:**

- Génération automatique d'un numéro de dossier médical (MRN) unique
- Création du patient avec des valeurs par défaut:
  - Date de naissance: 18 ans (ajustable par l'utilisateur)
  - Genre: `OTHER`
  - Utilisateur actif par défaut

**Avant:**

```typescript
const user = await prisma.user.create({
  data: {
    email: validated.email,
    // ...
  },
});
```

**Après:**

```typescript
const user = await prisma.user.create({
  data: {
    email: validated.email,
    // ... autres champs
    patient: {
      create: {
        medicalRecordNumber: "MRN..." // Généré automatiquement
        dateOfBirth: // 18 ans par défaut
        gender: "OTHER",
        isActive: true,
      },
    },
  },
  include: {
    patient: true,
  },
});
```

### 2. **Correction des patients manquants existants**

Deux options pour corriger les utilisateurs `PATIENT` sans profil:

#### Option A: Exécuter le script de correction

```bash
npm run fix:missing-patients
```

Ce script va:

- ✅ Trouver tous les utilisateurs `PATIENT` sans profil `Patient`
- ✅ Créer un profil `Patient` pour chacun automatiquement
- ✅ Afficher un rapport des corrections

#### Option B: Utiliser la fonction serveur

```typescript
import { fixMissingPatients } from "@/lib/actions/fix-missing-patients";

const result = await fixMissingPatients();
// result.fixed = nombre de patients créés
// result.results = détails de chaque création
```

## 🧪 Vérifier que c'est résolu

### Via la base de données (Prisma Studio):

```bash
npm run prisma:studio
```

Vérifier que tous les utilisateurs `PATIENT` ont un enregistrement associé dans la table `patients`.

### Via le code:

```typescript
const user = await getCurrentUser();
const patient = user.patient; // Doit exister, pas être null
```

## 📝 Notes

- Les utilisateurs créés via inscription auront maintenant automatiquement un profil Patient
- Les patients peuvent éditer leurs informations (date de naissance, genre, etc.) après l'inscription
- Le numéro de dossier médical (MRN) est généré automatiquement et garanti unique
- Cette modification ne s'applique pas aux utilisateurs `DOCTOR` ou `ADMIN`

## 🔗 Fichiers modifiés

- `lib/actions/auth.actions.ts` - Fonction `register()`
- `lib/actions/fix-missing-patients.ts` - Fonction de correction (nouveau)
- `fix-missing-patients.ts` - Script CLI (nouveau)
- `package.json` - Ajout du script npm
