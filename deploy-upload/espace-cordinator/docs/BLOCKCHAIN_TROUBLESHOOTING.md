# 🚨 Résolution des Problèmes Blockchain

## Problème: Erreur de Connexion au Testnet Aptos

### Symptômes

```
Error initializing access control: RequestError: read ECONNRESET
POST /api/blockchain/initialize 500 in 64612ms
```

### Causes Possibles

1. **Le testnet Aptos est temporairement indisponible**

   - Les testnets publics peuvent avoir des périodes de maintenance
   - Les serveurs peuvent être surchargés

2. **Problèmes de réseau local**

   - Firewall bloquant les connexions sortantes
   - Proxy d'entreprise bloquant l'accès
   - Connexion internet instable

3. **Compte sans fonds**

   - Le compte doit avoir des tokens APT pour payer les frais de transaction
   - Le faucet peut être indisponible

4. **Timeout de transaction**
   - La transaction prend trop de temps à se confirmer
   - Le réseau est congestionné

## ✅ Solutions

### Solution 1: Désactiver temporairement la blockchain (Recommandé pour développement)

**Dans votre fichier `.env`:**

```env
BLOCKCHAIN_ENABLED="false"
```

**Avantages:**

- ✅ Continue le développement sans bloquer
- ✅ Teste les autres fonctionnalités
- ✅ Réactive la blockchain quand le testnet est disponible

**Redémarrer l'application:**

```bash
# Arrêter le serveur (Ctrl+C)
npm run dev
```

### Solution 2: Réessayer avec le testnet

**Étape 1: Vérifier le statut du testnet Aptos**
Visitez: https://status.aptoslabs.com

**Étape 2: Financer votre compte**

```bash
# Méthode 1: Via Aptos CLI
aptos account fund-with-faucet --account 0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1

# Méthode 2: Via le faucet web
# https://aptoslabs.com/testnet-faucet
```

**Étape 3: Vérifier le solde**

```bash
aptos account list --account 0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1
```

**Étape 4: Réessayer l'initialisation**

- Ouvrez: http://localhost:3000/dashboard/admin/blockchain
- Cliquez sur "Initialiser la Blockchain"

### Solution 3: Utiliser un autre endpoint RPC

**Dans votre fichier `.env`:**

```env
# Essayez un endpoint alternatif
APTOS_NODE_URL="https://testnet.aptoslabs.com/v1"
# ou
APTOS_NODE_URL="https://aptos-testnet.public.blastapi.io"
```

**Redémarrer l'application:**

```bash
npm run dev
```

### Solution 4: Augmenter les timeouts

Le code a maintenant un timeout de 30 secondes. Si vous avez une connexion lente:

**Dans `lib/actions/blockchain-access.actions.ts`:**

```typescript
// Changez 30000 (30s) à 60000 (60s)
setTimeout(() => reject(new Error("Transaction timeout (60s)")), 60000);
```

### Solution 5: Utiliser un compte local (devnet)

**Créer un nouveau compte sur devnet:**

```bash
# Générer une nouvelle clé
aptos init --network devnet

# Copier les informations dans .env
BLOCKCHAIN_NETWORK="aptos-devnet"
APTOS_NODE_URL="https://fullnode.devnet.aptoslabs.com/v1"
APTOS_FAUCET_URL="https://faucet.devnet.aptoslabs.com"
```

## 🔍 Diagnostic

### Vérifier la connexion au testnet

```bash
# Test de connectivité
curl -s https://fullnode.testnet.aptoslabs.com/v1 | head -10

# Vérifier le compte
curl -s https://fullnode.testnet.aptoslabs.com/v1/accounts/0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1
```

### Vérifier les logs de l'application

```bash
# Dans le terminal Node.js, regardez les erreurs détaillées
# Les messages commençant par "Error initializing access control:"
```

### Tester le smart contract

```bash
# Compiler seulement (pas de réseau requis)
cd aptos
aptos move compile --named-addresses medifollow_addr=0x43f2e7420983c87eb131d936c18237d68f19952aeac6fd49778c7507062347f1

# Test unitaire (local)
aptos move test
```

## 📊 Mode Développement Sans Blockchain

Vous pouvez développer toute l'application **SANS** la blockchain active:

**Configuration `.env`:**

```env
BLOCKCHAIN_ENABLED="false"
```

**Ce qui continue de fonctionner:**

- ✅ Authentification utilisateurs
- ✅ Gestion des patients
- ✅ Gestion des docteurs
- ✅ Rendez-vous
- ✅ Documents médicaux
- ✅ Dashboard statistiques
- ✅ Alertes et notifications
- ✅ Paramètres

**Ce qui est désactivé:**

- ❌ Vérification blockchain des permissions
- ❌ Logs d'accès sur blockchain
- ❌ Interface d'administration blockchain

**Réactiver plus tard:**

```env
BLOCKCHAIN_ENABLED="true"
```

## 🔄 Workflow Recommandé

### Pour le développement local:

1. **Désactivez** la blockchain initialement

   ```env
   BLOCKCHAIN_ENABLED="false"
   ```

2. **Développez** toutes les fonctionnalités

3. **Activez** la blockchain pour les tests finaux

   ```env
   BLOCKCHAIN_ENABLED="true"
   ```

4. **Vérifiez** que le testnet est disponible sur: https://status.aptoslabs.com

5. **Initialisez** une seule fois

6. **Testez** les permissions d'accès

### Pour la production:

1. **Utilisez** le mainnet Aptos

   ```env
   BLOCKCHAIN_NETWORK="aptos-mainnet"
   APTOS_NODE_URL="https://fullnode.mainnet.aptoslabs.com/v1"
   ```

2. **Financez** votre compte avec de vrais APT tokens

3. **Déployez** le smart contract sur mainnet

4. **Gardez** `BLOCKCHAIN_ENABLED="true"`

## 🆘 Support

### Ressources Aptos

- **Statut**: https://status.aptoslabs.com
- **Explorer**: https://explorer.aptoslabs.com/?network=testnet
- **Faucet**: https://www.aptosfaucet.com
- **Discord**: https://discord.gg/aptoslabs
- **Documentation**: https://aptos.dev

### Problèmes Courants

**Q: "Account does not exist"**
R: Financez le compte avec le faucet

**Q: "Insufficient balance"**
R: Obtenez plus de tokens depuis le faucet

**Q: "Module not found"**
R: Déployez le smart contract: `npm run blockchain:publish`

**Q: "Transaction timeout"**
R: Le testnet est lent, réessayez ou désactivez la blockchain

**Q: "ECONNRESET / ETIMEDOUT"**
R: Le testnet est indisponible, désactivez temporairement avec `BLOCKCHAIN_ENABLED="false"`

## 📝 Notes

- Le testnet Aptos est **gratuit** mais peut être instable
- Les testnets peuvent être réinitialisés sans préavis
- Pour une production stable, utilisez le **mainnet**
- En développement, vous pouvez travailler **sans blockchain**

## ✨ Prochaines Étapes

Une fois le testnet disponible:

1. ✅ Activez la blockchain: `BLOCKCHAIN_ENABLED="true"`
2. ✅ Financez le compte: `aptos account fund-with-faucet`
3. ✅ Initialisez: http://localhost:3000/dashboard/admin/blockchain
4. ✅ Testez les permissions
5. ✅ Consultez les transactions sur l'explorer

**🎯 Pour l'instant, continuez le développement avec `BLOCKCHAIN_ENABLED="false"`**
