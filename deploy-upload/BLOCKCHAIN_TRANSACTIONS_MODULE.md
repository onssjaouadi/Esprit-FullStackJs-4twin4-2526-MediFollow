# 🔗 Module Transactions Blockchain Aptos

## Vue d'ensemble

Le module **Transactions Blockchain** permet aux auditeurs de tracker et surveiller tous les échanges blockchain de la plateforme MediFollow. Il fournit une interface complète pour visualiser, filtrer et analyser les transactions Aptos ainsi que les opérations de portefeuille.

## Fonctionnalités

### 📊 Tableau de Bord

- **Statistiques en temps réel** : Nombre total de transactions, accès accordés, révoqués, etc.
- **Informations de dernière transaction** : Affiche quand la dernière transaction a été exécutée
- **Métriques d'erreur** : Suivi des erreurs blockchain

### 🔍 Filtrage Avancé

- **Par action** : Filtrer par type de transaction
  - Accès accordé (BLOCKCHAIN_GRANT_ACCESS)
  - Accès révoqué (BLOCKCHAIN_REVOKE_ACCESS)
  - Vérification d'accès (BLOCKCHAIN_ACCESS_VERIFY)
  - Accès enregistré (BLOCKCHAIN_LOG_ACCESS)
  - Portefeuille créé (WALLET_CREATED)
  - Erreur blockchain (BLOCKCHAIN_ERROR)

- **Par date** : Plage de dates personnalisée
- **Pagination** : Navigation facile à travers les transactions

### 💾 Export de Données

- **Format CSV** : Exporte toutes les transactions filtrées en CSV
- **Contenu complet** : Inclut timestamp, action, utilisateur, entité, hash, gaz utilisé, statut

### 📋 Détails des Transactions

Chaque transaction affiche :

- **Utilisateur** : Qui a effectué la transaction
- **Action** : Type de transaction blockchain
- **Hash de Transaction** : Identifiant unique Aptos
- **Détails** : Informations complètes (gaz, statut, etc.)
- **Timestamp** : Date et heure précise

## Structure des Fichiers

```
app/dashboard/auditor/
├── blockchain-transactions/
│   └── page.tsx                    # Page principale du module

lib/actions/
└── blockchain-explorer.actions.ts  # Actions serveur pour récupérer les données

components/auditor/
└── BlockchainTransactionsList.tsx  # Composant d'affichage des transactions
```

## Routes Disponibles

- **Dashboard** : `/dashboard/auditor/blockchain-transactions`
- **Avec filtres** : `/dashboard/auditor/blockchain-transactions?action=GRANT_ACCESS&from=2024-01-01&to=2024-12-31`

## Types de Transactions Trackées

### 1. BLOCKCHAIN_GRANT_ACCESS

**Description** : Accord d'accès blockchain à un médecin
**Déclencheur** : `grantDoctorAccess()`
**Données stockées** :

- Adresse wallet du médecin
- ID du patient
- Durée d'accès
- Hash de transaction Aptos

### 2. BLOCKCHAIN_REVOKE_ACCESS

**Description** : Révocation d'accès blockchain
**Déclencheur** : `revokeDoctorAccess()`
**Données stockées** :

- Adresse wallet du médecin
- ID du patient
- Hash de transaction Aptos

### 3. BLOCKCHAIN_ACCESS_VERIFY

**Description** : Vérification d'accès blockchain
**Déclencheur** : `verifyDoctorAccess()`
**Données stockées** :

- Résultat de vérification (true/false)
- Adresse wallet du médecin
- ID du patient

### 4. BLOCKCHAIN_LOG_ACCESS

**Description** : Enregistrement d'accès aux données
**Déclencheur** : `logDataAccess()`
**Données stockées** :

- Adresse wallet du médecin
- ID du patient
- Hash de transaction Aptos

### 5. WALLET_CREATED

**Description** : Création de portefeuille pour un utilisateur
**Déclencheur** : `assignWalletToUser()`
**Données stockées** :

- ID de l'utilisateur
- Adresse du portefeuille
- Timestamp

### 6. BLOCKCHAIN_ERROR

**Description** : Erreur lors d'une opération blockchain
**Déclencheur** : Tout appel blockchain échouant
**Données stockées** :

- Type d'erreur
- Message d'erreur
- Contexte de l'opération

## API Disponibles

### getBlockchainTransactions()

Récupère les transactions blockchain avec filtrage et pagination.

```typescript
const result = await getBlockchainTransactions(
  skip = 0,
  take = 20,
  filters = {
    action?: string,
    userId?: string,
    dateFrom?: Date,
    dateTo?: Date
  }
);
```

**Réponse** :

```typescript
{
  success: boolean,
  transactions: AuditLog[],
  total: number,
  pages: number
}
```

### getBlockchainStats()

Récupère les statistiques d'ensemble des transactions.

```typescript
const result = await getBlockchainStats();
```

**Réponse** :

```typescript
{
  success: boolean,
  stats: {
    totalGrants: number,
    totalRevokes: number,
    totalVerifications: number,
    totalWalletCreations: number,
    totalErrors: number,
    totalTransactions: number,
    lastTransactionTime: Date
  }
}
```

### getAptosTransactionDetails()

Récupère les détails complets d'une transaction Aptos.

```typescript
const result = await getAptosTransactionDetails(txHash);
```

**Réponse** :

```typescript
{
  success: boolean,
  transaction: {
    hash: string,
    status: "SUCCESS" | "FAILED",
    sender: string,
    gasUsed: number,
    maxGas: number,
    gasPrice: number,
    timestamp: number,
    version: number
  }
}
```

### exportBlockchainTransactions()

Exporte les transactions en format CSV.

```typescript
const result = await exportBlockchainTransactions(filters);
```

**Réponse** :

```typescript
{
  success: boolean,
  csv: string,
  count: number
}
```

## Intégration avec AuditLog

Les transactions blockchain sont enregistrées dans la table `AuditLog` avec :

```typescript
{
  id: string,
  userId: string,
  action: "BLOCKCHAIN_*" | "WALLET_CREATED",
  entityType: "BlockchainTransaction",
  entityId: string,  // Hash de transaction Aptos
  changes: {
    transaction: {
      oldValue: null,
      newValue: {
        txType: string,
        entityId: string,
        timestamp: string,
        network: string,
        status: "SUCCESS" | "FAILED",
        ...additionalData
      }
    }
  },
  createdAt: Date
}
```

## Configuration Environnement

Assurez-vous que les variables d'environnement sont configurées :

```env
# Blockchain
BLOCKCHAIN_ENABLED=true
BLOCKCHAIN_NETWORK=aptos-testnet  # ou aptos-mainnet
APTOS_ACCOUNT_ADDRESS=0x...
APTOS_PRIVATE_KEY=0x...

# Base de données
DATABASE_URL=...
```

## Performance et Scalabilité

- **Index** : Considérez l'ajout d'index sur `AuditLog.action` pour des requêtes rapides
- **Pagination** : Les requêtes utilisent la pagination avec un page size de 20 par défaut
- **Cache** : Les statistiques sont mises à jour toutes les 30 secondes côté client

## Sécurité

- ✅ Accès restreint aux utilisateurs avec le rôle `AUDITOR`
- ✅ Audit trail complet de qui a consulté quelles transactions
- ✅ Aucune sensibilité des données stockées (pas de clés privées)
- ✅ Validation des hashes Aptos côté serveur

## Cas d'Usage

### 1. Audit de Conformité

Vérifier que tous les accès blockchain aux données patient sont correctement enregistrés et justifiés.

### 2. Détection d'Anomalies

Identifier les patterns inhabituels :

- Accès illégitimes
- Portefeuilles suspects
- Erreurs répétées

### 3. Rapports de Sécurité

Générer des rapports d'accès pour les auditeurs externes.

### 4. Troubleshooting

Diagnostiquer les problèmes blockchain :

- Erreurs de gaz
- Timeouts
- Problèmes de transaction

## Bonnes Pratiques

1. **Vérification régulière** : Consultez le module une fois par jour pour vérifier les patterns anormaux
2. **Export mensuel** : Exportez et archivez les transactions blockchain mensuelment
3. **Alertes** : Configurez des alertes pour les erreurs blockchain critiques
4. **Maintenance** : Archivez les transactions anciennes (>1 an) pour les performances

## Troubleshooting

### Aucune transaction visible

- Vérifier que `BLOCKCHAIN_ENABLED` est `true` dans .env
- S'assurer que des fonctions blockchain ont été appelées
- Vérifier que l'utilisateur a le rôle AUDITOR

### Erreurs "Transaction not found on blockchain"

- Le hash Aptos peut être invalide
- La transaction peut avoir expiré du cache Aptos
- Vérifier la connexion réseau au testnet/mainnet

### Lenteur des requêtes

- Ajouter un index sur `AuditLog.action`
- Réduire la plage de dates filtrées
- Archiver les anciennes transactions

## Évolutions Futures

- 📱 Graphiques temps réel des transactions
- 🔔 Notifications pour les erreurs blockchain
- 🌐 Support multi-chaînes (Ethereum, Solana, etc.)
- 📊 Rapports d'analyse blockchain avancés
- 💾 Archivage automatique des anciennes transactions
