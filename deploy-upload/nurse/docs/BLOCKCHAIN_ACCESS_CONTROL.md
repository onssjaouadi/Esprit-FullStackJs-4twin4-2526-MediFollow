# 🔐 Configuration du Contrôle d'Accès Blockchain Aptos

## 🎯 Vue d'ensemble

Ce guide explique comment configurer le système de **contrôle d'accès basé sur la blockchain Aptos** pour MediFollow, où seuls les docteurs autorisés peuvent voir les données des patients.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CONTRÔLE D'ACCÈS                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Docteur demande accès aux données patient               │
│  2. Backend vérifie le smart contract Aptos                │
│  3. Smart contract retourne permission (Oui/Non)           │
│  4. Si autorisé → données affichées + log blockchain       │
│  5. Si refusé → erreur 403 Unauthorized                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Fichiers Créés

1. **Smart Contract** : `aptos/sources/access_control.move`
2. **Configuration** : `aptos/Move.toml`
3. **Backend Actions** : `lib/actions/blockchain-access.actions.ts`
4. **Middleware** : Intégré dans `lib/actions/azure-storage.actions.ts`

## 🚀 Installation et Configuration

### Étape 1 : Installer les Dépendances

```bash
npm install @aptos-labs/ts-sdk
```

### Étape 2 : Mettre à Jour la Base de Données

Le champ `blockchainAddress` a été ajouté au modèle `User` :

```bash
npx prisma db push
npx prisma generate
```

### Étape 3 : Compiler le Smart Contract Aptos

```bash
cd aptos
aptos move compile --named-addresses medifollow_addr=<VOTRE_ADRESSE_APTOS>
```

### Étape 4 : Déployer le Smart Contract

```bash
aptos move publish --named-addresses medifollow_addr=default
```

**Note** : Assurez-vous d'avoir des APT de test dans votre compte avant de déployer !

### Étape 5 : Initialiser le Smart Contract

Créer un script pour initialiser :

```bash
# Dans le terminal Node.js
node -e "require('./lib/actions/blockchain-access.actions').initializeAccessControl().then(console.log)"
```

Ou créer une route API `/api/blockchain/initialize` :

```typescript
// app/api/blockchain/initialize/route.ts
import { initializeAccessControl } from "@/lib/actions/blockchain-access.actions";

export async function POST() {
  const result = await initializeAccessControl();
  return Response.json(result);
}
```

## 🔧 Configuration des Variables d'Environnement

Votre `.env` doit contenir :

```env
# Blockchain Aptos
APTOS_PRIVATE_KEY="0xd8c98320e8fb3694e752f74d8a71ffa72b1d50394d08c0e932592c5d97416b4e"
APTOS_ACCOUNT_ADDRESS="0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1"
APTOS_CONTRACT_MODULE="0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1::access_control"
BLOCKCHAIN_NETWORK="aptos-testnet"
```

## 👨‍⚕️ Utilisation : Donner l'Accès à un Docteur

### Option 1 : Programmatiquement

```typescript
import { grantDoctorAccess } from "@/lib/actions/blockchain-access.actions";

// Donner accès au docteur pour consulter le patient Jean Martin pendant 365 jours
const result = await grantDoctorAccess(
  "0x1234...abcd", // Adresse blockchain du docteur
  "69a4f648...", // ID MongoDB du patient
  365 // Durée en jours
);

console.log(result.transactionHash);
```

### Option 2 : Via une Interface Admin

Créer une page `/dashboard/admin/access-control` qui permet de :

- Lister les docteurs et patients
- Accorder/révoquer les permissions
- Voir l'historique des accès

## 📊 Workflow Complet

### 1. Enregistrer un Docteur

```typescript
// Lors de la création du compte docteur
const doctorUser = await prisma.user.create({
  data: {
    email: "doctor@example.com",
    passwordHash: hashedPassword,
    firstName: "Dr. Marie",
    lastName: "Dupont",
    role: "DOCTOR",
    blockchainAddress: "0x1234567890abcdef...", // Adresse Aptos du docteur
  },
});
```

### 2. Accorder l'Accès sur la Blockchain

```typescript
// Quand un patient est assigné à un docteur
await grantDoctorAccess(
  doctorUser.blockchainAddress,
  patient.id,
  365 // 1 an
);
```

### 3. Vérification Automatique

Quand le docteur essaie de voir les documents :

```typescript
// La fonction getDoctorPatientDocuments() vérifie automatiquement :
// 1. Rôle DOCTOR dans la DB
// 2. Permission sur blockchain ✅
// 3. Patient actif
// 4. Log l'accès sur blockchain (audit trail)
```

### 4. Révoquer l'Accès

```typescript
import { revokeDoctorAccess } from "@/lib/actions/blockchain-access.actions";

await revokeDoctorAccess(doctorUser.blockchainAddress, patient.id);
```

## 🔐 Sécurité

### Ce qui est Vérifié

✅ **Rôle utilisateur** (DOCTOR) dans MongoDB  
✅ **Permission blockchain** via smart contract Aptos  
✅ **Expiration** de la permission (durée configurable)  
✅ **Patient actif** dans la base de données  
✅ **Audit trail** : Tous les accès sont enregistrés sur blockchain

### Avantages de la Blockchain

1. **Immuable** : Les logs ne peuvent pas être modifiés
2. **Transparent** : Tout est vérifiable sur l'explorateur Aptos
3. **Décentralisé** : Pas de point de défaillance unique
4. **Auditabilité** : Traçabilité complète des accès
5. **RGPD compliant** : Preuve d'accès horodatée

## 📝 Logs et Audit Trail

### Vérifier les Permissions

```typescript
import { getPermissionDetails } from "@/lib/actions/blockchain-access.actions";

const details = await getPermissionDetails("0x1234...abcd", "patient_id_123");

console.log({
  hasPermission: details.hasPermission,
  grantedAt: new Date(details.grantedAt! * 1000),
  expiresAt: new Date(details.expiresAt! * 1000),
});
```

### Explorer Blockchain

Voir tous les événements sur [Aptos Explorer](https://explorer.aptoslabs.com/?network=testnet) :

- `AccessGrantedEvent` : Quand une permission est accordée
- `AccessRevokedEvent` : Quand une permission est révoquée
- `DataAccessEvent` : Chaque fois qu'un docteur accède aux données

## 🧪 Tests

### Test 1 : Accès Autorisé

```bash
# 1. Accorder l'accès
node scripts/grant-access.js doctor_address patient_id 365

# 2. Se connecter comme docteur
# 3. Voir le patient → ✅ Documents affichés

# 4. Vérifier les logs
console.log("✅ Blockchain access verified")
console.log("📝 Access logged on blockchain")
```

### Test 2 : Accès Refusé

```bash
# 1. Ne PAS accorder l'accès (ou révoquer)

# 2. Se connecter comme docteur
# 3. Voir le patient → ❌ Erreur 403

# Message: "Blockchain access verification failed"
```

### Test 3 : Expiration

```bash
# 1. Accorder l'accès pour 1 minute
await grantDoctorAccess(doctorAddress, patientId, 0.0007) // 1 minute

# 2. Attendre 2 minutes
# 3. Essayer d'accéder → ❌ Permission expirée
```

## 🔄 Mode de Compatibilité

Le système fonctionne en **mode hybride** :

```typescript
// Si blockchain configurée → Vérification blockchain
if (
  APTOS_PRIVATE_KEY &&
  APTOS_ACCOUNT_ADDRESS &&
  doctorUser.blockchainAddress
) {
  verifyOnBlockchain();
}
// Sinon → Vérification database uniquement
else {
  verifyInDatabase();
}
```

Cela permet de :

- ✅ Développer sans blockchain (mode démo)
- ✅ Migrer progressivement vers blockchain
- ✅ Désactiver temporairement si Aptos est down

## 🐛 Dépannage

### Erreur : "APTOS_PRIVATE_KEY not configured"

**Solution** : Vérifier le `.env` et s'assurer que les variables Aptos sont définies.

### Erreur : "Blockchain access verification failed"

**Causes possibles** :

1. Permission pas encore accordée → Exécuter `grantDoctorAccess()`
2. Permission expirée → Renouveler avec `grantDoctorAccess()`
3. Adresse blockchain du docteur manquante → Mettre à jour `user.blockchainAddress`

### Erreur : "Module not found"

**Solution** : Le smart contract n'est pas déployé → Exécuter `aptos move publish`

### Logs silencieux

**Solution** : Vérifier la console du serveur Next.js :

```bash
🔐 Verifying blockchain access for doctor 0x...
✅ Blockchain access verified for doctor doctor@example.com
📝 Access logged on blockchain
```

## 📚 Ressources

- **Aptos Documentation** : https://aptos.dev/
- **TS SDK** : https://aptos.dev/sdks/ts-sdk/
- **Move Language** : https://aptos.dev/move/move-on-aptos/
- **Explorer Testnet** : https://explorer.aptoslabs.com/?network=testnet

## 🎯 Prochaines Étapes

1. ✅ Déployer le smart contract sur testnet
2. ✅ Créer une interface admin pour gérer les permissions
3. ✅ Ajouter des tests unitaires
4. ✅ Implémenter la révocation automatique
5. ✅ Créer un dashboard d'audit des accès
6. ✅ Migrer vers mainnet en production

---

**Date de création** : 3 mars 2026  
**Version** : 1.0.0  
**Blockchain** : Aptos Testnet
