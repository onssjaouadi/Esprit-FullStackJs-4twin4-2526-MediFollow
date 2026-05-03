# 🔗 Configuration Blockchain Aptos pour MediFollow

## ⚠️ Important sur la Sécurité

**NE JAMAIS** partager ou committer votre clé privée Aptos ! Elle donne un accès complet à votre compte blockchain.

## 📋 Options de Configuration

### Option 1 : Activer Aptos (Recommandé pour Production)

Si vous souhaitez utiliser la blockchain Aptos pour la preuve d'intégrité des données médicales.

### Option 2 : Désactiver Aptos (Pour Développement)

Si vous voulez tester l'application sans blockchain pour le moment.

---

## 🚀 Option 1 : Configuration Complète Aptos

### Étape 1 : Installer Aptos CLI

#### Windows (PowerShell)

```powershell
# Télécharger depuis GitHub
Invoke-WebRequest -Uri "https://github.com/aptos-labs/aptos-core/releases/download/aptos-cli-v2.0.0/aptos-Windows-x86_64.zip" -OutFile "aptos.zip"
Expand-Archive -Path "aptos.zip" -DestinationPath "C:\aptos"
$env:PATH += ";C:\aptos"
```

#### macOS/Linux

```bash
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
```

### Étape 2 : Créer un Compte Aptos Testnet

```bash
# Initialiser le CLI
aptos init

# Suivre les instructions :
# 1. Choisir le réseau : testnet
# 2. Le CLI va générer une nouvelle clé privée
# 3. Noter l'adresse du compte générée
```

**Sortie attendue :**

```
Aptos CLI is now set up for account 0x123abc...def at testnet
Private key saved to: ~/.aptos/config.yaml
```

### Étape 3 : Récupérer la Clé Privée

```bash
# Afficher la configuration
cat ~/.aptos/config.yaml
```

**Exemple de sortie :**

```yaml
profiles:
  default:
    network: Testnet
    private_key: "0x1234567890abcdef..."
    public_key: "0xabcdef..."
    account: 0x123abc...def
    rest_url: "https://fullnode.testnet.aptoslabs.com"
```

### Étape 4 : Obtenir des Tokens de Test

```bash
# Approvisionner votre compte avec des APT de test
aptos account fund-with-faucet --account default
```

### Étape 5 : Déployer le Smart Contract

#### 5.1 Créer le module Move (si pas déjà fait)

Créer `aptos/sources/medifollow_proof.move` :

```move
module medifollow_addr::medifollow_proof {
    use std::signer;
    use std::vector;
    use aptos_framework::timestamp;

    struct MedicalProof has key {
        data_hash: vector<u8>,
        timestamp: u64,
        patient_id: vector<u8>,
    }

    public entry fun store_proof(
        account: &signer,
        data_hash: vector<u8>,
        patient_id: vector<u8>
    ) {
        let proof = MedicalProof {
            data_hash,
            timestamp: timestamp::now_seconds(),
            patient_id,
        };
        move_to(account, proof);
    }

    #[view]
    public fun get_proof(addr: address): (vector<u8>, u64, vector<u8>) acquires MedicalProof {
        let proof = borrow_global<MedicalProof>(addr);
        (proof.data_hash, proof.timestamp, proof.patient_id)
    }
}
```

#### 5.2 Compiler et Déployer

```bash
# Compiler le module
aptos move compile --package-dir ./aptos

# Déployer sur testnet
aptos move publish --package-dir ./aptos --named-addresses medifollow_addr=default

# Noter l'adresse du module déployé
```

### Étape 6 : Mettre à Jour le .env

Une fois toutes les étapes complétées :

```env
# Aptos Private Key (depuis config.yaml)
APTOS_PRIVATE_KEY="0x1234567890abcdef..."

# Aptos Account Address (depuis aptos init)
APTOS_ACCOUNT_ADDRESS="0x123abc...def"

# Smart Contract Module Address (après déploiement)
APTOS_CONTRACT_MODULE="0x123abc...def::medifollow_proof"
```

---

## 🔧 Option 2 : Désactiver Aptos (Mode Développement)

Si vous voulez tester l'application sans blockchain :

### Étape 1 : Modifier le .env

Garder les valeurs par défaut :

```env
# Aptos Private Key (placeholder - blockchain désactivée)
APTOS_PRIVATE_KEY="0xYOUR_PRIVATE_KEY_HERE"

# Aptos Account Address (placeholder - blockchain désactivée)
APTOS_ACCOUNT_ADDRESS="0xYOUR_ACCOUNT_ADDRESS_HERE"

# Smart Contract Module Address (placeholder - blockchain désactivée)
APTOS_CONTRACT_MODULE="0xYOUR_MODULE_ADDRESS::medifollow_proof"
```

### Étape 2 : Modifier le Code pour Ignorer Blockchain

Ouvrir `lib/actions/blockchain.actions.ts` et ajouter :

```typescript
export async function storeOnBlockchain(data: any) {
  // Skip blockchain if not configured
  if (process.env.APTOS_PRIVATE_KEY === "0xYOUR_PRIVATE_KEY_HERE") {
    console.log("⚠️ Blockchain disabled - skipping proof storage");
    return {
      success: true,
      txHash: "BLOCKCHAIN_DISABLED",
      message: "Blockchain feature disabled in development",
    };
  }

  // Existing blockchain logic...
}
```

### Étape 3 : Redémarrer le Serveur

```bash
npm run dev
```

L'application fonctionnera normalement sans blockchain.

---

## 📊 Comparaison des Options

| Fonctionnalité     | Option 1 (Aptos)     | Option 2 (Sans Blockchain) |
| ------------------ | -------------------- | -------------------------- |
| Preuve d'intégrité | ✅ Sur blockchain    | ❌ Désactivée              |
| Temps de setup     | ⏱️ 30-60 minutes     | ⚡ Immédiat                |
| Coût               | 💰 Gratuit (testnet) | 💰 Gratuit                 |
| Complexité         | 🔧 Moyenne           | 🔧 Faible                  |
| Production ready   | ✅ Oui               | ⚠️ À activer plus tard     |

---

## 🔐 Sécurité - Checklist

### ✅ À Faire :

- [ ] Sauvegarder la clé privée dans un gestionnaire de mots de passe
- [ ] Ajouter `.env` au `.gitignore`
- [ ] Utiliser des variables d'environnement en production
- [ ] Créer un compte séparé pour dev/staging/prod
- [ ] Régénérer les clés si compromise

### ❌ À NE JAMAIS Faire :

- [ ] Committer le .env avec la vraie clé privée
- [ ] Partager la clé privée par email/Slack
- [ ] Utiliser la même clé en dev et prod
- [ ] Logger la clé privée dans les logs
- [ ] Hardcoder la clé dans le code source

---

## 🧪 Tester la Configuration

### Test 1 : Vérifier la Connexion Aptos

```bash
aptos account list --account default
```

**Sortie attendue :**

```
{
  "Result": {
    "sequence_number": 0,
    "authentication_key": "0x..."
  }
}
```

### Test 2 : Vérifier le Smart Contract

```bash
aptos move view --function-id "VOTRE_ADRESSE::medifollow_proof::get_proof" \
  --args address:VOTRE_ADRESSE
```

### Test 3 : Dans l'Application

1. Créer un enregistrement vital pour un patient
2. Vérifier les logs pour voir le hash blockchain
3. Aller sur [Aptos Explorer](https://explorer.aptoslabs.com/?network=testnet)
4. Chercher votre adresse
5. Vérifier les transactions

---

## 📚 Ressources Utiles

- **Documentation Aptos** : https://aptos.dev/
- **Aptos CLI** : https://aptos.dev/tools/aptos-cli/
- **Move Language** : https://aptos.dev/move/move-on-aptos/
- **Testnet Faucet** : https://faucet.testnet.aptoslabs.com/
- **Explorer Testnet** : https://explorer.aptoslabs.com/?network=testnet
- **Discord Aptos** : https://discord.gg/aptoslabs

---

## 🆘 Problèmes Courants

### Erreur : "Account not found"

**Solution :** Approvisionner le compte avec le faucet

```bash
aptos account fund-with-faucet --account default
```

### Erreur : "Invalid private key format"

**Solution :** S'assurer que la clé commence par `0x` et contient 64 caractères hexadécimaux

### Erreur : "Module not found"

**Solution :** Redéployer le smart contract

```bash
aptos move publish --package-dir ./aptos --named-addresses medifollow_addr=default
```

### Erreur : "Insufficient gas"

**Solution :** Obtenir plus d'APT de test

```bash
aptos account fund-with-faucet --amount 100000000
```

---

## 🎯 Recommandation pour MediFollow

### Pour le Développement (maintenant) :

👉 **Option 2** - Désactiver Aptos temporairement

- Focus sur les fonctionnalités principales
- Tester l'application sans dépendance blockchain
- Setup rapide

### Pour la Production (plus tard) :

👉 **Option 1** - Activer Aptos avec compte prod

- Déployer sur Aptos Mainnet
- Configurer un compte dédié
- Implémenter la preuve d'intégrité complète

---

## 📝 Prochaines Étapes

1. **Choisir l'option** (Aptos ou Sans Blockchain)
2. **Suivre le guide** correspondant
3. **Tester** la configuration
4. **Démarrer le développement** 🚀

---

**Date de création** : 3 mars 2026
**Version Aptos CLI** : v2.0.0+
**Réseau recommandé** : Testnet (pour dev)
