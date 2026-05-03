# MediFollow - Aptos Smart Contract

## 📄 Description

Ce dossier contient le smart contract Aptos pour le contrôle d'accès décentralisé du système MediFollow.

## 📁 Structure

```
aptos/
├── Move.toml              # Configuration du projet Aptos Move
├── sources/
│   └── access_control.move  # Smart contract principal
└── build/                 # Artefacts de compilation (généré)
```

## 🔧 Smart Contract: access_control.move

### Module

```move
module medifollow_addr::access_control
```

### Structures de Données

#### AccessPermission

Représente une permission d'accès accordée à un docteur pour un patient.

```move
struct AccessPermission has store, copy {
    doctor_address: address,    // Adresse blockchain du docteur
    patient_id: vector<u8>,     // ID du patient (MongoDB)
    granted_at: u64,            // Timestamp d'octroi
    expires_at: u64,            // Timestamp d'expiration
    is_active: bool             // Statut de la permission
}
```

#### AccessRegistry

Registre contenant toutes les permissions d'accès.

```move
struct AccessRegistry has key {
    permissions: vector<AccessPermission>
}
```

#### AccessLog

Enregistrement d'une tentative d'accès.

```move
struct AccessLog has store, copy {
    doctor_address: address,
    patient_id: vector<u8>,
    accessed_at: u64
}
```

#### AccessLogs

Collection de tous les logs d'accès.

```move
struct AccessLogs has key {
    logs: vector<AccessLog>
}
```

### Fonctions Publiques

#### initialize(account: &signer)

Initialise le registre d'accès et les logs pour un compte.

- **Appelé par:** Admin (une seule fois)
- **Action:** Crée AccessRegistry et AccessLogs

#### grant_access(admin: &signer, doctor_address: address, patient_id: vector<u8>, duration_seconds: u64)

Accorde la permission à un docteur d'accéder aux données d'un patient.

- **Paramètres:**
  - `admin`: Signer autorisé (compte plateforme)
  - `doctor_address`: Adresse blockchain du docteur
  - `patient_id`: ID du patient (encodé en bytes)
  - `duration_seconds`: Durée de validité en secondes
- **Action:** Ajoute une nouvelle permission avec expiration
- **Erreur:** `E_ALREADY_GRANTED (2)` si la permission existe déjà

#### revoke_access(admin: &signer, doctor_address: address, patient_id: vector<u8>)

Révoque la permission d'accès d'un docteur.

- **Paramètres:**
  - `admin`: Signer autorisé
  - `doctor_address`: Adresse du docteur
  - `patient_id`: ID du patient
- **Action:** Met `is_active` à `false`
- **Erreur:** `E_PERMISSION_NOT_FOUND (3)` si la permission n'existe pas

#### log_access(admin: &signer, doctor_address: address, patient_id: vector<u8>)

Enregistre une tentative d'accès sur la blockchain.

- **Paramètres:**
  - `admin`: Signer autorisé
  - `doctor_address`: Adresse du docteur
  - `patient_id`: ID du patient
- **Action:** Ajoute un log avec timestamp actuel

### Fonctions de Lecture (View)

#### has_access(registry_address: address, doctor_address: address, patient_id: vector<u8>): bool

Vérifie si un docteur a la permission d'accéder aux données d'un patient.

- **Retourne:** `true` si l'accès est autorisé et non expiré, `false` sinon
- **Vérifications:**
  - Permission existe
  - `is_active == true`
  - `expires_at > timestamp_actuel`

#### get_permission_details(...)

Retourne les détails complets d'une permission (granted_at, expires_at, is_active).

### Codes d'Erreur

- `E_NOT_AUTHORIZED (1)`: Appelant non autorisé
- `E_ALREADY_GRANTED (2)`: Permission déjà accordée
- `E_PERMISSION_NOT_FOUND (3)`: Permission introuvable

## 🚀 Commandes

### Compiler le contrat

```bash
npm run blockchain:compile
```

Ou manuellement:

```bash
cd aptos
aptos move compile --named-addresses medifollow_addr=0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1
```

### Déployer sur le testnet

```bash
npm run blockchain:publish
```

Ou manuellement:

```bash
cd aptos
aptos move publish --named-addresses medifollow_addr=0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1 --assume-yes
```

### Tester le contrat

```bash
cd aptos
aptos move test
```

### Vérifier le déploiement

```bash
aptos move view --function-id "0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1::access_control::has_access" \
  --args address:0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1 \
  --args address:0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1 \
  --args "string:test" \
  --url https://fullnode.testnet.aptoslabs.com/v1
```

## 🔐 Configuration

### Adresses

- **Module Address:** `0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1`
- **Network:** Aptos Testnet
- **Node URL:** `https://fullnode.testnet.aptoslabs.com/v1`

### Variables d'Environnement (.env)

```env
BLOCKCHAIN_NETWORK="aptos-testnet"
APTOS_NODE_URL="https://fullnode.testnet.aptoslabs.com/v1"
APTOS_FAUCET_URL="https://faucet.testnet.aptoslabs.com"
APTOS_PRIVATE_KEY="0xd8c98320e8fb3694e752f74d8a71ffa72b1d50394d08c0e932592c5d97416b4e"
APTOS_ACCOUNT_ADDRESS="0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1"
APTOS_CONTRACT_MODULE="0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1::access_control"
```

## 📊 Exemple d'Utilisation

### Scénario: Accorder un accès de 1 an

```typescript
// Backend - TypeScript
import { grantDoctorAccess } from "@/lib/actions/blockchain-access.actions";

const result = await grantDoctorAccess(
  "0xDOCTOR_WALLET_ADDRESS", // Adresse blockchain du docteur
  "patient_mongodb_id", // ID du patient dans MongoDB
  365 // Durée en jours (1 an)
);

console.log("Transaction Hash:", result.transactionHash);
```

### Scénario: Vérifier un accès

```typescript
import { verifyDoctorAccess } from "@/lib/actions/blockchain-access.actions";

const { hasAccess } = await verifyDoctorAccess(
  "0xDOCTOR_WALLET_ADDRESS",
  "patient_mongodb_id"
);

if (hasAccess) {
  // Autoriser l'accès aux données
} else {
  // Bloquer l'accès
}
```

### Scénario: Enregistrer un accès

```typescript
import { logAccess } from "@/lib/actions/blockchain-access.actions";

await logAccess("0xDOCTOR_WALLET_ADDRESS", "patient_mongodb_id");
```

## 🔗 Liens Utiles

### Explorateur Blockchain

- **Compte:** https://explorer.aptoslabs.com/account/0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1?network=testnet
- **Transactions:** https://explorer.aptoslabs.com/txn/YOUR_TX_HASH?network=testnet

### Documentation Aptos

- **Move Language:** https://aptos.dev/move/move-on-aptos/
- **Aptos SDK:** https://aptos.dev/sdks/ts-sdk/
- **CLI Reference:** https://aptos.dev/tools/aptos-cli/

### Documentation Projet

- **BLOCKCHAIN_ACCESS_CONTROL.md** - Guide complet du système
- **APTOS_SETUP.md** - Configuration détaillée
- **BLOCKCHAIN_QUICKSTART.md** - Démarrage rapide

## 🛠️ Développement

### Modifier le Smart Contract

1. Éditez `sources/access_control.move`
2. Compilez: `npm run blockchain:compile`
3. Testez: `cd aptos && aptos move test`
4. Déployez: `npm run blockchain:publish`

### Ajouter une Fonction

```move
// Dans access_control.move

public entry fun ma_nouvelle_fonction(
    admin: &signer,
    param1: address,
    param2: u64
) acquires AccessRegistry {
    // Votre code ici
}
```

### Ajouter un Test

```move
#[test(admin = @medifollow_addr)]
public fun test_ma_fonction(admin: signer) {
    // Code de test
}
```

## 📈 Performance

- **Gas Cost (Grant Access):** ~1500 gas units
- **Gas Cost (Verify Access):** 0 (view function)
- **Gas Cost (Log Access):** ~800 gas units
- **Transaction Time:** 2-5 secondes (testnet)

## 🔒 Sécurité

### Bonnes Pratiques

1. **Ne jamais exposer la clé privée** dans le code
2. **Utiliser des variables d'environnement** pour les secrets
3. **Valider tous les inputs** avant l'appel blockchain
4. **Gérer les erreurs** (ALREADY_GRANTED, NOT_FOUND, etc.)
5. **Logger les transactions** pour audit

### Contrôles d'Accès

- Seul le compte admin peut modifier les permissions
- Les view functions sont publiques (lecture seule)
- Les logs sont immuables (audit trail)

## 🐛 Debugging

### Logs Verbose

```bash
RUST_LOG=debug aptos move publish --named-addresses medifollow_addr=0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1
```

### Simuler une Transaction

```bash
aptos move run --function-id "0x43f2e...::access_control::grant_access" \
  --args address:0x123... \
  --args "string:patient_id" \
  --args u64:31536000 \
  --assume-yes
```

### Inspecter les Ressources

```bash
aptos account list --account 0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1
```

## 🎯 Prochaines Améliorations

- [ ] Ajouter des événements (Events) pour le monitoring
- [ ] Implémenter la révocation batch (plusieurs à la fois)
- [ ] Ajouter des métadonnées aux permissions
- [ ] Créer une fonction de renouvellement automatique
- [ ] Optimiser le gas avec des structures de données efficaces

## 📞 Support

Pour toute question sur le smart contract, consultez:

- [BLOCKCHAIN_QUICKSTART.md](../docs/BLOCKCHAIN_QUICKSTART.md)
- [BLOCKCHAIN_ACCESS_CONTROL.md](../docs/BLOCKCHAIN_ACCESS_CONTROL.md)
- [Aptos Discord](https://discord.gg/aptoslabs)
