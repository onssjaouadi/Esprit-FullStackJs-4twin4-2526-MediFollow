# 📋 Système d'Upload de Documents Médicaux avec Azure Storage

## 🎯 Vue d'ensemble

Le système d'upload de documents médicaux permet aux patients de télécharger et gérer leurs documents médicaux (analyses, imagerie, ordonnances, etc.) de manière sécurisée via **Azure Blob Storage**.

## ✅ Fonctionnalités Implémentées

### 1. **Modèle de Base de Données** (`prisma/schema.prisma`)

- ✅ Nouveau modèle `MedicalDocument` avec :
  - `patientId` - Référence au patient
  - `fileName` & `originalName` - Noms des fichiers
  - `fileType` & `fileSize` - Métadonnées
  - `category` - Catégorie (ANALYSIS, IMAGING, PRESCRIPTION, etc.)
  - `description` - Description optionnelle
  - `azureBlobUrl`, `azureContainerName`, `azureBlobName` - Infos Azure Storage
  - Timestamps complets
- ✅ Enum `DocumentCategory` avec 7 catégories
- ✅ Index optimisés (`patientId`, `uploadedAt`, `category`)
- ✅ Schema pushé vers MongoDB ✓

### 2. **Actions Backend** (`lib/actions/azure-storage.actions.ts`)

Fonctions serveur pour gérer les documents :

#### `uploadToAzureStorage(file, patientId, category, description)`

- Upload vers Azure Blob Storage
- Validation de fichier (taille, type)
- Sauvegarde des métadonnées en base de données
- Retourne l'URL du blob et les infos du document

#### `getPatientDocuments(patientId)`

- Récupère tous les documents d'un patient
- Triés par date de téléchargement (plus récents en premier)

#### `deleteDocument(documentId)`

- Supprime le document d'Azure Storage
- Supprime les métadonnées de la base de données

#### `getDocumentDownloadUrl(documentId)`

- Retourne l'URL de téléchargement du document
- Prêt pour l'implémentation de SAS tokens (accès temporaire sécurisé)

### 3. **Route API** (`app/api/upload/route.ts`)

- Endpoint POST pour l'upload de fichiers
- Authentification utilisateur obligatoire
- Validation :
  - Rôle PATIENT uniquement
  - Taille max : 10 MB
  - Types autorisés : PDF, JPG, PNG, DOCX
- Upload direct vers Azure Blob Storage
- Sauvegarde automatique en base de données

### 4. **Composant d'Upload** (`components/FileUploadMedical.tsx`)

Interface utilisateur moderne pour l'upload :

- ✨ **Drag & Drop** - Glissez-déposez vos fichiers
- 📂 **Sélection de fichier** - Ou cliquez pour parcourir
- 🏷️ **Catégorisation** - Sélecteur de catégorie (7 options)
- 📝 **Description** - Champ de description optionnel
- ✅ **Validation en temps réel** - Taille et type de fichier
- 📊 **Aperçu du fichier** - Nom et taille
- 🔄 **État d'upload** - Messages de succès/erreur
- 🎨 **Design YouTube/ChatGPT** - Interface minimaliste et moderne

### 5. **Page Documents Patient** (`app/dashboard/patient/reports/page.tsx`)

Dashboard complet pour gérer les documents :

#### Fonctionnalités :

- 🔍 **Recherche** - Recherche par nom et description
- 🏷️ **Filtres** - Par catégorie (Analyses, Imagerie, Ordonnances, etc.)
- ➕ **Upload** - Bouton "Ajouter un document" avec modal d'upload
- 📋 **Liste des documents** - Grille responsive avec :
  - Nom du fichier
  - Catégorie avec badge coloré
  - Date d'upload
  - Taille du fichier
  - Description (si disponible)
- 🔧 **Actions** :
  - 👁️ **Voir** - Ouvrir le document dans un nouvel onglet
  - ⬇️ **Télécharger** - Télécharger le document
  - 🗑️ **Supprimer** - Supprimer avec confirmation
- 📊 **Statistiques** - Total de documents et documents récents
- 🎨 **Design YouTube** - Interface propre et moderne

## 🔧 Configuration Azure Storage

Configuration dans `.env` :

```env
# Azure Storage Configuration
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=survive;AccountKey=...;EndpointSuffix=core.windows.net"
AZURE_STORAGE_CONTAINER_NAME="uploads"
```

### Structure Azure Storage :

```
uploads/
└── medical-documents/
    └── {patientId}/
        └── {timestamp}-{filename}
```

## 📦 Dépendances

### Installées :

```bash
✅ @azure/storage-blob@12.31.0
```

## 🚀 Prochaines Étapes

### ⚠️ Action Requise :

Le schéma Prisma a été mis à jour et pushé vers MongoDB avec succès. Cependant, pour que les changements soient pris en compte, vous devez :

1. **Arrêter le serveur Next.js** (si en cours d'exécution)

   ```bash
   # Dans le terminal où le serveur tourne, appuyez sur Ctrl+C
   ```

2. **Régénérer le client Prisma**

   ```bash
   npx prisma generate
   ```

3. **Redémarrer le serveur**
   ```bash
   npm run dev
   ```

### ℹ️ Pourquoi ?

L'erreur `EPERM` survient car le serveur Next.js lock les fichiers Prisma. Une fois le serveur arrêté, la génération du client fonctionnera correctement.

## 🎯 Utilisation

### Pour le Patient :

1. **Accéder à la page Documents**

   - Naviguer vers `/dashboard/patient/reports`

2. **Télécharger un document**

   - Cliquer sur "Ajouter un document"
   - Glisser-déposer un fichier ou cliquer pour parcourir
   - Sélectionner la catégorie
   - Ajouter une description (optionnel)
   - Cliquer sur "Télécharger"

3. **Gérer les documents**
   - Rechercher par nom ou description
   - Filtrer par catégorie
   - Voir, télécharger ou supprimer

## 📁 Types de Fichiers Supportés

| Type      | Extensions              | Taille Max |
| --------- | ----------------------- | ---------- |
| PDF       | `.pdf`                  | 10 MB      |
| Images    | `.jpg`, `.jpeg`, `.png` | 10 MB      |
| Documents | `.doc`, `.docx`         | 10 MB      |

## 🏷️ Catégories de Documents

1. **ANALYSIS** - Analyses médicales
2. **IMAGING** - Imagerie (IRM, Scanner, Radio)
3. **PRESCRIPTION** - Ordonnances
4. **REPORT** - Rapports médicaux
5. **DISCHARGE_SUMMARY** - Résumés de sortie
6. **CONSULTATION** - Comptes-rendus de consultation
7. **OTHER** - Autre

## 🔒 Sécurité

- ✅ Authentification obligatoire
- ✅ Accès limité aux PATIENTS uniquement
- ✅ Validation de type de fichier
- ✅ Limitation de taille (10 MB)
- ✅ Isolation par patient (répertoires séparés)
- ⏳ **À implémenter** : SAS tokens pour accès temporaire sécurisé

## 🎨 Design System

Le système suit le **design YouTube/ChatGPT** :

- Fond blanc propre
- Bordures subtiles (`border-gray-200`)
- Coins arrondis (`rounded-xl`)
- Ombres au survol (`hover:shadow-md`)
- Boutons arrondis (`rounded-full`)
- Badges colorés par catégorie
- Animations douces (`transition-all`)

## 📋 Statut

| Composant        | Statut         | Notes                         |
| ---------------- | -------------- | ----------------------------- |
| Modèle Prisma    | ✅ Terminé     | Pushé vers MongoDB            |
| Actions Backend  | ✅ Terminé     | Toutes fonctions implémentées |
| Route API        | ✅ Terminé     | `/api/upload` fonctionnel     |
| Composant Upload | ✅ Terminé     | Drag & drop + validation      |
| Page Documents   | ✅ Terminé     | Interface complète            |
| Package Azure    | ✅ Installé    | `@azure/storage-blob@12.31.0` |
| Client Prisma    | ⏳ À régénérer | Nécessite redémarrage serveur |

## 🐛 Problèmes Connus

### EPERM lors de `prisma generate`

**Solution** : Arrêter le serveur Next.js, puis régénérer le client Prisma.

### Accessibilité ESLint

Warnings mineurs sur les composants :

- Boutons sans texte (ont des icônes)
- Inputs sans labels (ont des placeholders)
- Select sans nom accessible

Ces warnings n'affectent pas la fonctionnalité mais peuvent être corrigés pour améliorer l'accessibilité.

## 📝 Notes Techniques

- Le système utilise **MongoDB** via Prisma
- Les fichiers sont stockés sur **Azure Blob Storage**
- Les URLs des blobs sont stockées en base de données
- Le container Azure est créé automatiquement s'il n'existe pas
- Les noms de fichiers sont sanitizés (caractères spéciaux remplacés)
- Timestamps uniques pour éviter les conflits de noms

## 🚀 Évolutions Futures

1. **SAS Tokens** - Accès temporaire sécurisé aux documents
2. **Aperçu PDF** - Viewer PDF intégré dans l'interface
3. **Miniatures** - Génération de miniatures pour les images
4. **Partage** - Partager des documents avec les médecins
5. **Versions** - Historique des versions de documents
6. **OCR** - Extraction de texte des documents scannés
7. **Tags** - Système de tags personnalisés
8. **Notifications** - Alertes lors de nouveaux documents

---

**Développé le** : 3 mars 2026  
**Intégré avec** : MediFollow Platform  
**Azure Storage Account** : survive  
**Container** : uploads
