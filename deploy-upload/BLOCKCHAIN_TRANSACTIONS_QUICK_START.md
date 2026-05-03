# 🚀 Guide Rapide : Module Transactions Blockchain

## Accès au Module

1. Connectez-vous avec un compte ayant le rôle **AUDITOR**
2. Allez dans le dashboard auditor : `http://localhost:3000/dashboard/auditor`
3. Dans la sidebar gauche, cliquez sur **"Transactions Blockchain"**
4. Vous êtes maintenant dans le module de tracking blockchain 🎉

## Interface Principale

### Haut de la page

- **Titre** : "🔗 Transactions Blockchain"
- **Bouton Rafraîchir** : Mets à jour les données en temps réel
- **Description** : Explique le but du module

### Cartes de Statistiques (4 colonnes)

Affichent en temps réel :

1. **🔓 Accès accordés** : Nombre total d'accès blockchain accordés
2. **🔒 Accès révoqués** : Nombre total d'accès révoqués
3. **👛 Portefeuilles créés** : Nombre de portefeuilles Aptos créés
4. **⚠️ Erreurs** : Nombre d'erreurs blockchain

### Section Filtres

Permet de filtrer les transactions par :

- **Action** : Sélectionnez le type de transaction (dropdown)
- **Du** : Date de début (date picker)
- **Au** : Date de fin (date picker)
- **Exporter** : Télécharger les résultats en CSV

### Liste des Transactions

Pour chaque transaction, affiche :

- **Icône et Label** : Type de transaction avec couleur
- **Utilisateur et Heure** : Qui a fait quoi et quand
- **Hash** : Aperçu du hash de transaction (complet en détail)
- **Chevron** : Cliquez pour développer les détails

### Pagination

Navigation entre les pages (20 transactions par page)

## Utilisation Courante

### ✅ Voir toutes les transactions

1. Ne sélectionnez aucun filtre
2. Cliquez sur la première ligne de la pagination

### ✅ Filtrer par type

1. Ouvrez le dropdown "Action"
2. Sélectionnez un type (ex: "Accès accordé")
3. La liste se met à jour automatiquement

### ✅ Rechercher par date

1. Entrez une date de début dans "Du"
2. Entrez une date de fin dans "Au"
3. Les transactions apparaissent

### ✅ Voir les détails complets

1. Trouvez une transaction dans la liste
2. Cliquez sur le chevron (▼) à droite
3. Développement complet avec tous les détails

### ✅ Exporter les données

1. Appliquez les filtres souhaités
2. Cliquez sur "Exporter"
3. Un fichier CSV est téléchargé automatiquement

## Interprétation des Symboles

| Symbole        | Signification                  |
| -------------- | ------------------------------ |
| 🔓 Unlock      | Accès blockchain accordé       |
| 🔒 Lock        | Accès blockchain révoqué       |
| 👁️ Eye         | Vérification d'accès effectuée |
| 📄 File        | Accès aux données enregistré   |
| 👛 Wallet      | Portefeuille blockchain créé   |
| ⚠️ AlertCircle | Erreur blockchain              |

## Types de Transactions Expliqués

### 🔓 Accès accordé (BLOCKCHAIN_GRANT_ACCESS)

Un médecin a reçu l'accès blockchain aux données d'un patient.

- **Détails** : Adresse wallet, patient, durée, hash transaction

### 🔒 Accès révoqué (BLOCKCHAIN_REVOKE_ACCESS)

Un accès blockchain a été retiré à un médecin.

- **Détails** : Adresse wallet, patient, hash transaction

### 👁️ Vérification d'accès (BLOCKCHAIN_ACCESS_VERIFY)

Le système a vérifié si un médecin a l'accès.

- **Détails** : Résultat (✓ ou ✗), adresse wallet, patient

### 📄 Accès enregistré (BLOCKCHAIN_LOG_ACCESS)

Un accès aux données a été enregistré sur la blockchain.

- **Détails** : Médecin, patient, hash transaction

### 👛 Portefeuille créé (WALLET_CREATED)

Un nouveau portefeuille Aptos a été créé pour un utilisateur.

- **Détails** : Adresse wallet, utilisateur, timestamp

### ⚠️ Erreur blockchain (BLOCKCHAIN_ERROR)

Une opération blockchain a échoué.

- **Détails** : Type d'erreur, message, contexte

## Cas d'Usage Courants

### 📌 Vérifier qui a accès à un patient

1. Allez au module Transactions Blockchain
2. Filtrez par "Accès accordé"
3. Vous verrez tous les médecins ayant accès

### 📌 Auditer les accès du jour

1. Entrez la date d'aujourd'hui dans "Du" et "Au"
2. Consultez tous les accès accordés/révoqués
3. Exportez pour archivage

### 📌 Chercher un problème d'accès

1. Entrez les dates approximatives
2. Filtrez par "Erreur blockchain"
3. Analysez le message d'erreur

### 📌 Créer un rapport mensuel

1. Définissez la plage du mois complet
2. Cliquez sur "Exporter"
3. Ouvrez le fichier CSV dans Excel

## Informations Techniques

### Détails complets (quand développé)

```
Timestamp: 2024-04-10T14:23:45Z
Action: BLOCKCHAIN_GRANT_ACCESS
Utilisateur: Dr. Jean Dupont (jean@hospital.fr)
Type d'entité: BlockchainTransaction
Hash: 0x1a2b3c4d5e6f7g8h...
Status: SUCCESS
Durée: 365 jours
Gaz utilisé: 12500
```

### Signification du Statut

- ✅ **SUCCESS** : Transaction acceptée par la blockchain
- ❌ **FAILED** : Transaction rejetée/échouée

## Conseils

💡 **Conseil 1** : Consultez le module chaque matin pour un audit rapide  
💡 **Conseil 2** : Exportez mensuellement pour l'archivage de conformité  
💡 **Conseil 3** : Alertez si vous voyez des accès non justifiés  
💡 **Conseil 4** : Investiguer toute erreur blockchain répétée

## Questions Fréquentes

**Q: Comment puis-je savoir qui a accès à un patient?**  
R: Allez à Logs d'Audit et filtrez par le ID du patient
Ou regardez les transactions de type "Accès accordé"

**Q: Que signifie un hash de transaction?**  
R: C'est l'identifiant unique sur la blockchain Aptos
Vous pouvez vérifier le statut sur l'explorateur Aptos

**Q: Comment puis-je voir les détails complets d'une transaction?**  
R: Cliquez sur le chevron (▼) pour développer la transaction

**Q: Puis-je imprimer les données?**  
R: Oui ! Exportez en CSV puis ouvrez dans Excel

## Support

Pour toute question sur ce module :

- Consultez la documentation complète : `BLOCKCHAIN_TRANSACTIONS_MODULE.md`
- Contactez l'équipe IT
- Vérifiez les logs d'erreur système

---

**Dernière mise à jour** : April 10, 2024
**Version** : 1.0
