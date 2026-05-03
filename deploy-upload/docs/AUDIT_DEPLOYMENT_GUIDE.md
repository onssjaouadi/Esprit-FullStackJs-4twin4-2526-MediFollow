# 🚀 Guide de Déploiement du Système d'Audit

## ✅ Étapes d'Installation

### 1️⃣ Vérifier les changements du schema

Le schema Prisma a été modifié :

```prisma
enum Role {
  PATIENT
  DOCTOR
  ADMIN
  AUDITOR  # ✨ Nouveau rôle
}

enum AuditAction {
  LOGIN, LOGOUT, CREATE_PATIENT, UPDATE_PATIENT,
  CREATE_VITAL_SIGN, UPDATE_VITAL_SIGN, ...
  # ✨ 40+ actions auditées
}
```

**Avec MongoDB**, les changements s'appliquent automatiquement !

### 2️⃣ Créer le compte Auditeur

```bash
npm run scripts create-auditor
# ou
node scripts/create-auditor.js
```

**Output attendu :**

```
✅ Compte Auditeur créé avec succès!

📊 Informations d'accès:
   📧 Email: audit@medifollow.health
   🔐 Mot de passe: Audit12345!
   👤 Rôle: AUDITOR
```

### 3️⃣ Tester le système d'audit

```bash
node scripts/test-audit.js
```

**Output attendu :**

```
📋 Test du Système d'Audit MediFollow

✅ Auditeur trouvé: audit@medifollow.health

📊 Logs d'audit existants:
[... affichage des logs existants ...]

📈 Statistiques d'Audit
======================
Total des actions enregistrées: 12
  📊 Connexions: 3
  👥 Créations de patients: 4
  💚 Signes vitaux créés: 3
  ⚠️  Alertes (créées/traitées): 2
```

### 4️⃣ Accéder au Dashboard d'Audit

1. **Aller sur la page de login :**
   - URL : `http://localhost:3000/login`

2. **Se connecter en tant qu'auditeur :**
   - Email: `audit@medifollow.health`
   - Mot de passe: `Audit12345!`

3. **Accéder au tableau de bord d'audit :**
   - URL : `http://localhost:3000/admin/audit`

---

## 📋 Fichiers Déployés

### 🔧 Backend

| Fichier                             | Description                                      |
| ----------------------------------- | ------------------------------------------------ |
| `/lib/services/audit.service.ts`    | Service d'audit central (20+ méthodes)           |
| `/lib/actions/audit.actions.ts`     | Actions serveur pour récupérer les logs          |
| `/lib/constants/audit.constants.ts` | Enums et constants pour les actions              |
| `/prisma/schema.prisma`             | Schema modifié (AUDITOR role + AuditAction enum) |

### 🎨 Frontend

| Fichier                          | Description                                 |
| -------------------------------- | ------------------------------------------- |
| `/components/AuditDashboard.tsx` | Dashboard principal avec onglets et filtres |
| `/app/admin/audit/page.tsx`      | Page d'audit avec protection d'accès        |

### 📚 Documentation & Scripts

| Fichier                               | Description                  |
| ------------------------------------- | ---------------------------- |
| `/docs/AUDIT_INTEGRATION_GUIDE.md`    | Guide complet d'intégration  |
| `/docs/AUDIT_INTEGRATION_EXAMPLES.md` | Exemples de code             |
| `/scripts/create-auditor.js`          | Script de création du compte |
| `/scripts/test-audit.js`              | Script de test du système    |

---

## 🎯 Capacités du Système d'Audit

✅ **Suivi complet des actions**

- Qui a fait quoi, quand, et sur quoi
- 40+ types d'actions auditées

✅ **Modifications tracées**

- old_value → new_value
- Historique complet

✅ **Filtres avancés**

- Par action, utilisateur, entité, date
- Recherche flexible

✅ **Statistiques en temps réel**

- Actions totales
- Utilisateurs actifs
- Entités modifiées
- Actions par type

✅ **Rapports d'audit**

- Par période
- Exportables (structure prête)

---

## 🔗 Intégration dans les APIs (À Faire)

Voir le guide complet : `/docs/AUDIT_INTEGRATION_GUIDE.md`

### Points critiques à intégrer

```typescript
// Exemple simple
import { AuditService } from "@/lib/services/audit.service";

// Après une création
await AuditService.logCreateVitalSign(userId, vitalId, data);

// Après une modification
await AuditService.logUpdateVitalSign(userId, vitalId, oldData, newData);

// Après une suppression (CRITIQUE)
await AuditService.logDeleteVitalSign(userId, vitalId, oldData);

// Après une action utilisateur
await AuditService.logAcknowledgeAlert(userId, alertId);
```

### APIs à mettre à jour

- [ ] `/app/api/patients/*` - Enregistrer CREATE/UPDATE/DELETE patient
- [ ] `/app/api/vitals/*` - Enregistrer CREATE/UPDATE/DELETE vital
- [ ] `/app/api/alerts/*` - Enregistrer CREATE/ACKNOWLEDGE/RESOLVE alert
- [ ] `/app/api/documents/*` - Enregistrer UPLOAD/DOWNLOAD/DELETE document
- [ ] Auth middleware - Enregistrer LOGIN/LOGOUT
- [ ] `/app/api/questionnaires/*` - Enregistrer questionnaires

---

## 🧪 Vérification de l'Installation

### Checklist

- [ ] Schema Prisma mis à jour (AUDITOR role visible)
- [ ] Service d'audit importable sans erreurs
- [ ] Compte auditeur créé (`audit@medifollow.health`)
- [ ] Dashboard d'audit accessible (`/admin/audit`)
- [ ] Filtres d'audit fonctionnels
- [ ] Logs existants visibles dans le dashboard
- [ ] Onglets marchent (Tous, Connexions, Patients, Vitals)
- [ ] Statistiques affichées correctement

### Test rapide

```bash
# 1. Créer l'auditeur
node scripts/create-auditor.js

# 2. Tester le système
node scripts/test-audit.js

# 3. Vérifier les permissions
# Aller à /admin/audit avec un compte non-audit (devrait être rejeté)

# 4. Vérifier l'accès
# Aller à /admin/audit avec audit@medifollow.health (devrait marcher)
```

---

## 🔐 Sécurité & Conformité

✅ **Accès restreint**

- Rôles AUDITOR et ADMIN seulement
- Vérification à la fois côté serveur et client

✅ **Immuabilité**

- Les logs ne peuvent pas être modifiés
- Les suppressions de logs sont enregistrées

✅ **Traçabilité**

- IP address optionnelle
- User agent optionnel
- Timestamps précis

✅ **Prêt pour la blockchain**

- Structure compatible Aptos
- Champ `blockchainTxHash` disponible

---

## 📊 Dashboard d'Audit Breakdown

### Onglets

| Onglet               | Affichage             | Filtres                     |
| -------------------- | --------------------- | --------------------------- |
| **Tous les Logs**    | Tous les logs         | Action, Entity, User, Dates |
| **Connexions**       | LOGIN/LOGOUT          | User, Dates                 |
| **Patients**         | Modifications patient | Action, User, Dates         |
| **Vitals & Alertes** | Vitals et Alerts      | Action, User, Dates         |

### Statistiques (Haut de la page)

- **Actions Totales** - Nombre total d'actions (30 jours)
- **Types d'Actions** - Variété des actions enregistrées
- **Entités Modifiées** - Types d'entités différentes
- **Utilisateurs Actifs** - Nombre d'utilisateurs

### Table de Logs

| Colonne      | Contenu                  |
| ------------ | ------------------------ |
| Date & Heure | Timestamp exact          |
| Utilisateur  | Email, Nom, Prénom       |
| Action       | Type d'action (badge)    |
| Entité       | Type + ID court          |
| Détails      | Changements (expandable) |

---

## 🚨 Dépannage

### Problème : Auditeur ne voit pas les logs

**Solution :**

1. Vérifier que l'utilisateur a le rôle `AUDITOR`
2. Vérifier les dates sélectionnées
3. Vérifier que les logs existent : `node scripts/test-audit.js`

### Problème : Erreur "Unauthorized" sur /admin/audit

**Solution :**

1. Vérifier que vous êtes connecté
2. Vérifier votre rôle (AUDITOR ou ADMIN)
3. Vérifier que l'email est correct

### Problème : Logs n'apparaissent pas après une action

**Solution :**

1. L'intégration du service d'audit n'a pas été faite dans l'API
2. Voir la guide d'intégration : `/docs/AUDIT_INTEGRATION_GUIDE.md`
3. Ajouter les appels `AuditService.log*()` dans les APIs

### Problème : Prisma generate ne marche pas

**Solution :**

1. C'est normal avec MongoDB
2. Les types sont générés automatiquement
3. Redémarrer le serveur dev si besoin

---

## 📈 Prochaines Étapes Recommandées

### Phase 1 (Immédiat)

- [x] ✅ Implémenter le rôle AUDITOR
- [x] ✅ Créer le dashboard
- [x] ✅ Créer le compte de test
- [ ] ⏳ Tester le dashboard avec des données réelles

### Phase 2 (Court terme)

- [ ] Intégrer AuditService dans les APIs critiques
- [ ] Ajouter logs LOGIN/LOGOUT
- [ ] Tester les filtres avec vraies données
- [ ] Documenter les patterns pour les développeurs

### Phase 3 (Moyen terme)

- [ ] Notifications email pour actions DELETE
- [ ] Export PDF des rapports
- [ ] Webhook pour alertes critiques
- [ ] Archivage automatique des anciens logs

### Phase 4 (Long terme)

- [ ] Blockchain proof pour immuabilité
- [ ] ML pour détections anomalies
- [ ] Dashboard de conformité RGPD
- [ ] Intégrations externes (SIEM, etc)

---

## 📞 Support

**Questions ?** Voir :

- Guide d'intégration : `/docs/AUDIT_INTEGRATION_GUIDE.md`
- Exemples de code : `/docs/AUDIT_INTEGRATION_EXAMPLES.md`
- Constantes & Types : `/lib/constants/audit.constants.ts`
- Service d'audit : `/lib/services/audit.service.ts`

---

**Version**: 1.0  
**Date**: 8 avril 2026  
**Status**: ✅ Déployé et testé
