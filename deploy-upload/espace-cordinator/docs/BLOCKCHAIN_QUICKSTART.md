# 🚀 Guide de Démarrage Rapide - Blockchain Aptos

## Vue d'ensemble

Ce système utilise la blockchain Aptos pour gérer le contrôle d'accès décentralisé entre les docteurs et les patients.

## ✅ Étape 1: Vérifier les Prérequis

### Vérifier l'installation du CLI Aptos

```bash
aptos --version
```

Si le CLI n'est pas installé, téléchargez-le depuis:

- Windows: https://github.com/aptos-labs/aptos-core/releases
- macOS: `brew install aptos`
- Linux: Voir docs/APTOS_SETUP.md

### Vérifier les variables d'environnement

Assurez-vous que votre fichier `.env` contient:

```env
BLOCKCHAIN_NETWORK="aptos-testnet"
APTOS_NODE_URL="https://fullnode.testnet.aptoslabs.com/v1"
APTOS_FAUCET_URL="https://faucet.testnet.aptoslabs.com"
APTOS_PRIVATE_KEY="0xd8c98320e8fb3694e752f74d8a71ffa72b1d50394d08c0e932592c5d97416b4e"
APTOS_ACCOUNT_ADDRESS="0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1"
APTOS_CONTRACT_MODULE="0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1::access_control"
```

## 🔨 Étape 2: Compiler le Smart Contract

```bash
cd aptos
aptos move compile --named-addresses medifollow_addr=0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1
```

**Résultat attendu:**

```
Compiling, may take a little while to download git dependencies...
INCLUDING DEPENDENCY AptosFramework
INCLUDING DEPENDENCY AptosStdlib
INCLUDING DEPENDENCY MoveStdlib
BUILDING MediFollow
Success
```

## 🚀 Étape 3: Déployer le Contrat (si nécessaire)

### Option A: Vérifier le déploiement existant

Vérifiez si le contrat est déjà déployé:

```bash
aptos move view --function-id "0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1::access_control::has_access" \
  --args address:0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1 \
  --args address:0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1 \
  --args "string:test" \
  --url https://fullnode.testnet.aptoslabs.com/v1
```

### Option B: Déployer le contrat

Si le contrat n'est pas déployé:

```bash
cd aptos
aptos move publish \
  --named-addresses medifollow_addr=0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1 \
  --assume-yes
```

**Note:** Vous aurez besoin de fonds sur le compte testnet. Utilisez le faucet:

```bash
aptos account fund-with-faucet --account 0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1
```

## 🎯 Étape 4: Initialiser le Système

### Via l'interface d'administration (recommandé)

1. Démarrez votre application Next.js:

   ```bash
   npm run dev
   ```

2. Ouvrez votre navigateur:

   ```
   http://localhost:3000/dashboard/admin/blockchain
   ```

3. Cliquez sur **"Initialiser la Blockchain"**

### Via l'API directement

```bash
curl -X POST http://localhost:3000/api/blockchain/initialize
```

### Via le script de test

```bash
node scripts/test-blockchain.js
```

## ✅ Étape 5: Tester le Système

### Test 1: Accorder un accès

```bash
curl -X POST http://localhost:3000/api/blockchain/grant-access \
  -H "Content-Type: application/json" \
  -d '{
    "doctorAddress": "0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1",
    "patientId": "test_patient_123",
    "durationDays": 365
  }'
```

### Test 2: Vérifier un accès

```bash
curl "http://localhost:3000/api/blockchain/verify-access?doctorAddress=0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1&patientId=test_patient_123"
```

### Test 3: Script complet

```bash
node scripts/test-blockchain.js
```

## 📊 Étape 6: Monitorer la Blockchain

### Via Aptos Explorer

Visitez: https://explorer.aptoslabs.com/account/0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1?network=testnet

### Via le dashboard de monitoring

Ouvrez: `public/blockchain-monitor.html` dans votre navigateur

### Via l'interface d'administration

http://localhost:3000/dashboard/admin/blockchain

## 🔍 Diagnostic des Problèmes

### Problème: "Module not found"

**Solution:** Le contrat n'est pas déployé. Suivez l'étape 3.

```bash
cd aptos
aptos move publish --named-addresses medifollow_addr=0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1 --assume-yes
```

### Problème: "Insufficient balance"

**Solution:** Financez votre compte testnet.

```bash
aptos account fund-with-faucet --account 0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1
```

### Problème: "Transaction failed"

**Solution:** Vérifiez les logs et réessayez après quelques secondes.

```bash
aptos account list --account 0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1
```

### Problème: Compilation échoue

**Solution:** Vérifiez la syntaxe Move et les dépendances.

```bash
cd aptos
aptos move test
```

## 📚 Architecture du Système

```
┌────────────────┐
│  Application   │  (Next.js)
│   Frontend     │
└────────┬───────┘
         │
         ▼
┌────────────────┐
│  API Routes    │  /api/blockchain/*
│  (Server)      │
└────────┬───────┘
         │
         ▼
┌────────────────┐
│  blockchain-   │  lib/actions/
│  access.       │  blockchain-access.actions.ts
│  actions.ts    │
└────────┬───────┘
         │
         ▼
┌────────────────┐
│  Aptos SDK     │  @aptos-labs/ts-sdk
│  (TypeScript)  │
└────────┬───────┘
         │
         ▼
┌────────────────┐
│  Aptos Testnet │  Blockchain Network
│  Smart Contract│  access_control.move
└────────────────┘
```

## 🔐 Fonctions du Smart Contract

### Fonctions d'écriture (Entry Functions)

1. **initialize(account)** - Initialise les registres
2. **grant_access(admin, doctor, patient_id, duration)** - Accorde un accès
3. **revoke_access(admin, doctor, patient_id)** - Révoque un accès
4. **log_access(admin, doctor, patient_id)** - Enregistre un accès

### Fonctions de lecture (View Functions)

1. **has_access(registry, doctor, patient_id)** - Vérifie un accès
2. **get_permission_details(...)** - Détails d'une permission

## 🎯 Commandes Utiles

### Voir le statut du compte

```bash
aptos account list --account 0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1
```

### Voir les modules déployés

```bash
aptos move view --function-id "0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1::access_control::has_access" --help
```

### Tester le contrat localement

```bash
cd aptos
aptos move test
```

### Nettoyer et recompiler

```bash
cd aptos
rm -rf build/
aptos move compile --named-addresses medifollow_addr=0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1
```

## 📖 Documentation Complète

- **BLOCKCHAIN_ACCESS_CONTROL.md** - Guide complet du système
- **APTOS_SETUP.md** - Configuration détaillée d'Aptos
- **blockchain-monitor.html** - Interface de monitoring

## 🆘 Support

En cas de problème:

1. Vérifiez les logs: `console` dans le navigateur
2. Consultez Aptos Explorer pour les transactions
3. Lisez la documentation complète dans `docs/`
4. Testez avec le script: `node scripts/test-blockchain.js`

## ✨ Prochaines Étapes

Une fois le système initialisé:

1. ✅ Créer des comptes docteurs avec des adresses blockchain
2. ✅ Accorder des accès via l'interface d'administration
3. ✅ Intégrer la vérification blockchain dans l'accès aux documents
4. ✅ Monitorer les logs d'accès sur la blockchain
5. ✅ Implémenter la révocation automatique après expiration

**🎉 Félicitations! Votre système blockchain est prêt à fonctionner!**
