# 🔒 Configuration Azure Storage avec SAS Tokens

## Problème Résolu

**Erreur précédente:**

```
PublicAccessNotPermittedPublic access is not permitted on this storage account.
RequestId:85a1b276-c01e-0073-40a3-aae29d000000
```

## ✅ Solution Implémentée

Le système utilise maintenant des **SAS Tokens** (Shared Access Signature) pour générer des URLs temporaires sécurisées au lieu de l'accès public.

## 🔄 Changements Effectués

### 1. **lib/actions/azure-storage.actions.ts**

#### Nouvelle fonction `parseConnectionString()`

- Parse la connection string Azure
- Extrait AccountName et AccountKey

#### Nouvelle fonction `generateSasUrl()`

- Génère des SAS tokens avec permissions lecture seule
- Expiration: **1 heure**
- Permissions: **Read only**

#### Fonction `uploadToAzureStorage()` modifiée

- Container créé en mode **privé** (pas d'accès public)
- URL stockée sans SAS (générée à la demande)

#### Fonction `getDocumentDownloadUrl()` modifiée

- Génère une URL avec SAS token valide 1 heure
- Retourne `expiresIn: 3600` (secondes)

### 2. **app/api/upload/route.ts**

- Container créé en mode privé
- URL stockée sans SAS token

## 🔐 Sécurité

### Avant (Accès Public)

```
https://survive.blob.core.windows.net/uploads/medical-documents/...
```

❌ Accessible par n'importe qui avec l'URL

### Après (SAS Token)

```
https://survive.blob.core.windows.net/uploads/medical-documents/...?
  sv=2021-12-02&
  se=2026-03-03T01%3A23%3A14Z&
  sr=b&
  sp=r&
  sig=...
```

✅ Accessible uniquement pendant 1 heure
✅ Permissions lecture seule
✅ Token unique par demande

## 🚀 Actions Requises

### 1. Arrêter le serveur

```bash
# Ctrl+C dans le terminal du serveur
```

### 2. Régénérer le client Prisma

```bash
npx prisma generate
```

### 3. Redémarrer le serveur

```bash
npm run dev
```

### 4. (Optionnel) Nettoyer le container Azure

Si le container "uploads" existe déjà avec accès public, vous pouvez :

**Option A - Via Azure Portal:**

1. Aller sur https://portal.azure.com
2. Ouvrir le compte "survive"
3. Containers → "uploads"
4. Changer "Public access level" → **Private**

**Option B - Supprimer et recréer:**

1. Le code créera automatiquement un nouveau container privé
2. Vous devrez re-uploader vos documents

## 📊 Avantages des SAS Tokens

| Fonctionnalité | Avant            | Après                       |
| -------------- | ---------------- | --------------------------- |
| Accès          | Public permanent | Privé avec token temporaire |
| Sécurité       | ❌ Faible        | ✅ Élevée                   |
| Expiration     | ❌ Jamais        | ✅ 1 heure                  |
| Permissions    | ❌ Toutes        | ✅ Lecture seule            |
| GDPR           | ⚠️ Risque        | ✅ Conforme                 |

## 🔧 Configuration Technique

### Paramètres SAS Token

```typescript
const sasOptions = {
  containerName: "uploads",
  blobName: "medical-documents/...",
  permissions: BlobSASPermissions.parse("r"), // Read only
  startsOn: new Date(),
  expiresOn: new Date(new Date().valueOf() + 3600 * 1000), // 1 hour
};
```

### Permissions Disponibles

- `r` - Read (lecture)
- `w` - Write (écriture)
- `d` - Delete (suppression)
- `l` - List (liste)
- `a` - Add (ajout)
- `c` - Create (création)

**Notre configuration: Read only (r)**

## 🔍 Test

### Télécharger un document

1. Se connecter comme patient
2. Aller sur `/dashboard/patient/reports`
3. Cliquer sur "Ajouter un document"
4. Uploader un fichier
5. ✅ Upload réussi

### Voir un document

1. Cliquer sur "Voir"
2. ✅ Document s'affiche avec URL signée
3. ⏱️ URL valide pendant 1 heure

### Télécharger un document

1. Cliquer sur "Télécharger"
2. ✅ Fichier téléchargé avec URL signée

## 📝 Logs Attendus

### Upload réussi

```
POST /api/upload 200 in 2000ms
db.medical_documents.insertOne(...)
```

### Génération SAS réussie

```
Generated SAS URL for blob:
medical-documents/69a4f6484ab6351807c4a361/1772497058600-document.pdf
Expires: 2026-03-03T01:23:14Z
```

## ⚠️ Notes Importantes

1. **Expiration des URLs**: Les URLs avec SAS token expirent après 1 heure. Le viewer génère un nouveau token à chaque ouverture.

2. **Pas de cache**: Ne pas cacher les URLs avec SAS token côté client car elles expirent.

3. **Container privé**: Le container "uploads" ne doit JAMAIS être public pour des données médicales (RGPD/HIPAA).

4. **Rotation des clés**: En production, changer régulièrement l'AccountKey d'Azure Storage.

## 🔐 Conformité RGPD

✅ Les documents médicaux ne sont plus accessibles publiquement
✅ Accès temporaire uniquement (1 heure)
✅ Traçabilité des accès (logs Azure)
✅ Permissions minimales (lecture seule)
✅ Chiffrement en transit (HTTPS obligatoire)

## 🎯 Prochaines Améliorations

1. **Durée configurable**: Permettre de configurer la durée d'expiration
2. **IP whitelisting**: Restreindre l'accès par IP
3. **Audit logs**: Enregistrer chaque génération de SAS token
4. **User-level SAS**: SAS token spécifique par utilisateur
5. **Revocation**: Possibilité de révoquer les accès avant expiration

---

**Configuration mise à jour le**: 3 mars 2026
**Testé avec**: Azure Storage Account "survive"
**Container**: uploads (mode privé)
