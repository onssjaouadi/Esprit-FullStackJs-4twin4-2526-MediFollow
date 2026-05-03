# 🔐 Guide d'Intégration du Système d'Audit

## 📋 Vue d'ensemble

Le système d'audit MediFollow enregistre **toutes les actions critiques** effectuées par les utilisateurs pour assurer la transparence, la conformité et la traçabilité.

### ✅ Objectifs du système d'audit

1. **Traçabilité complète** - Qui a fait quoi, quand et sur quoi
2. **Conformité médicale** - Respect des réglementations de santé
3. **Sécurité des données** - Détection des modifications suspectes
4. **Audit interne** - Rapports de conformité et d'inspection

---

## 🎯 Rôles et accès

### AUDITOR (Nouveau rôle)

L'auditeur peut :

- ✅ Consulter **tous les logs d'audit**
- ✅ Voir l'**historique complet des connexions**
- ✅ Consulter les **modifications de patients**
- ✅ Vérifier les **modifications de signes vitaux** (old_value → new_value)
- ✅ Voir les **alertes traitées** et leur résolution
- ✅ Générer des **rapports d'audit** par période
- ✅ Filtrer par : utilisateur, entité, type d'action, date

### Autres rôles

- **ADMIN** - Accès complet à l'audit + gestion système
- **DOCTOR** - Peut voir l'audit de ses propres actions
- **PATIENT** - Peut voir l'audit de ses données
- **NURSE** - Peut voir l'audit de ses actions

---

## 📊 Actions auditées

### Authentification

- `LOGIN` - Connexion utilisateur
- `LOGOUT` - Déconnexion
- `PASSWORD_RESET` - Réinitialisation de mot de passe

### Patients

- `CREATE_PATIENT` - Création de patient
- `UPDATE_PATIENT` - Modification du profil
- `DELETE_PATIENT` - Suppression
- `VIEW_PATIENT` - Consultation (optionnel)

### Signes Vitaux

- `CREATE_VITAL_SIGN` - Nouvelle mesure
- `UPDATE_VITAL_SIGN` - Modification avec old_value/new_value
- `DELETE_VITAL_SIGN` - Suppression

### Alertes

- `CREATE_ALERT` - Génération d'alerte
- `ACKNOWLEDGE_ALERT` - Accusé de réception
- `RESOLVE_ALERT` - Résolution avec notes
- `DELETE_ALERT` - Suppression

### Questionnaires

- `CREATE_QUESTIONNAIRE` - Création de template
- `SUBMIT_QUESTIONNAIRE` - Soumission de réponses

### Documents

- `UPLOAD_DOCUMENT` - Téléchargement de fichier
- `DOWNLOAD_DOCUMENT` - Téléchargement par utilisateur
- `DELETE_DOCUMENT` - Suppression

### Contrôle d'accès

- `GRANT_ACCESS` - Attribution d'accès patient
- `REVOKE_ACCESS` - Révocation d'accès

---

## 🔧 Intégration dans les API

### 1. Utiliser le Service d'Audit

```typescript
import { AuditService } from "@/lib/services/audit.service";

// Enregistrer une action simple
await AuditService.logAction({
  userId: user.id,
  action: "CREATE_VITAL_SIGN",
  entityType: "VitalRecord",
  entityId: vital.id,
  changes: {
    vital: {
      oldValue: null,
      newValue: vital,
    },
  },
  ipAddress: request.headers.get("x-forwarded-for"),
  userAgent: request.headers.get("user-agent"),
});

// Ou utiliser les méthodes de commodité
await AuditService.logCreateVitalSign(userId, vitalId, vitalData);
await AuditService.logUpdateVitalSign(userId, vitalId, oldData, newData);
await AuditService.logAcknowledgeAlert(userId, alertId);
```

### 2. API Route Example (Vital Signs)

```typescript
// app/api/vitals/route.ts
import { AuditService } from "@/lib/services/audit.service";

export async function POST(request: Request) {
  const session = await auth();
  const body = await request.json();

  // Create vital record
  const vital = await prisma.vitalRecord.create({
    data: body,
  });

  // Log the action
  await AuditService.logCreateVitalSign(session.user.id, vital.id, body);

  return Response.json(vital);
}

export async function PATCH(request: Request) {
  const { id, data } = await request.json();
  const session = await auth();

  // Get old data for comparison
  const oldVital = await prisma.vitalRecord.findUnique({
    where: { id },
  });

  // Update
  const newVital = await prisma.vitalRecord.update({
    where: { id },
    data,
  });

  // Log the changes
  await AuditService.logUpdateVitalSign(
    session.user.id,
    id,
    oldVital,
    newVital
  );

  return Response.json(newVital);
}
```

### 3. Server Actions Example

```typescript
// lib/actions/vitals.ts
import { AuditService } from "@/lib/services/audit.service";

("use server");

export async function createVitalSign(data: VitalData) {
  const session = await auth();

  const vital = await prisma.vitalRecord.create({
    data: {
      ...data,
      patientId: data.patientId,
    },
  });

  // Enregistrer l'action
  await AuditService.logCreateVitalSign(session.user.id, vital.id, data);

  return vital;
}
```

---

## 📈 Vérification des modifications

### Format des changements

```typescript
{
  "systolicBP": {
    "oldValue": 140,
    "newValue": 155
  },
  "status": {
    "oldValue": "NORMAL",
    "newValue": "A_VERIFIER"
  }
}
```

### Exemple réel

**Avant :**

- systolicBP: 140
- diastolicBP: 85

**Après :**

- systolicBP: 155
- diastolicBP: 90

**Log d'audit :**

```json
{
  "action": "UPDATE_VITAL_SIGN",
  "entityId": "vital123",
  "user": "doctor@example.com",
  "timestamp": "2026-04-08T10:30:00Z",
  "changes": {
    "systolicBP": { "oldValue": 140, "newValue": 155 },
    "diastolicBP": { "oldValue": 85, "newValue": 90 }
  }
}
```

---

## 🚀 Déploiement du compte Auditeur

### 1. Créer le compte Auditeur

```bash
node scripts/create-auditor.js
```

**Credentials:**

- 📧 Email: `audit@medifollow.health`
- 🔐 Mot de passe: `Audit12345!`
- 👤 Rôle: `AUDITOR`

### 2. Accéder au Dashboard d'Audit

1. Aller sur `/login`
2. Se connecter avec les identifiants ci-dessus
3. Accéder à `/admin/audit`

---

## 📊 Fonctionnalités du Dashboard d'Audit

### Onglets

1. **Tous les Logs** - Vue complète de tous les logs
2. **Historique des Connexions** - Tracking des accès
3. **Patients** - Modifications de données patients
4. **Signes Vitaux & Alertes** - Historique des mesures et alertes

### Filtres

- **Action** - Sélectionner le type d'action (LOGIN, UPDATE_PATIENT, etc.)
- **Type d'Entité** - Patient, VitalRecord, Alert, etc.
- **Utilisateur** - Filtrer par responsable de l'action
- **Plage de dates** - De ... à ...

### Statistiques

- **Actions Totales** - Nombre d'actions enregistrées
- **Types d'Actions** - Diversité des actions
- **Entités Modifiées** - Nombre de types différents
- **Utilisateurs Actifs** - Nombre d'utilisateurs ayant effectué des actions

---

## 🔗 Intégration complète (Checklist)

- [ ] Migration Prisma appliquée (Role = AUDITOR)
- [ ] Service d'audit importé dans les API critiques
- [ ] Logs enregistrés pour le CREATE_PATIENT
- [ ] Logs enregistrés pour UPDATE_VITAL_SIGN (avec old/new values)
- [ ] Logs enregistrés pour les alertes (CREATE, ACKNOWLEDGE, RESOLVE)
- [ ] Compte auditeur créé
- [ ] Dashboard d'audit accessible
- [ ] Filtres d'audit fonctionnels
- [ ] Tests de conformité réussis

---

## 🚨 Points d'intégration critiques

### 1. Authentification

- **Fichier** : `auth.ts` ou middleware de session
- **Action** : Enregistrer LOGIN/LOGOUT

### 2. Patients

- **Fichiers** : `/app/api/patients/*`, `/lib/actions/patient.actions.ts`
- **Actions** : CREATE_PATIENT, UPDATE_PATIENT, DELETE_PATIENT

### 3. Vitals

- **Fichiers** : `/app/api/vitals/*`, `/lib/actions/vitals.actions.ts`
- **Actions** : CREATE_VITAL_SIGN, UPDATE_VITAL_SIGN, DELETE_VITAL_SIGN

### 4. Alertes

- **Fichiers** : `/app/api/alerts/*`, `/lib/actions/alert.actions.ts`
- **Actions** : CREATE_ALERT, ACKNOWLEDGE_ALERT, RESOLVE_ALERT

### 5. Documents

- **Fichiers** : `/app/api/uploads/*`, `/lib/actions/document.actions.ts`
- **Actions** : UPLOAD_DOCUMENT, DOWNLOAD_DOCUMENT, DELETE_DOCUMENT

---

## 📝 Exemple de rapport d'audit

```
RAPPORT D'AUDIT - 01/04/2026 au 08/04/2026
==========================================

📊 Statistiques
- Actions totales : 1,247
- Créations : 145
- Modifications : 892
- Suppressions : 12
- Accès : 198

👥 Utilisateurs les plus actifs
1. arij@medifollow.health (425 actions)
2. doctor2@medifollow.health (312 actions)
3. admin@medifollow.health (198 actions)

🎯 Entités modifiées
- Patient : 87
- VitalRecord : 456
- Alert : 234
- Document : 45

⚠️ Actions critiques
- DELETE_PATIENT : 0
- DELETE_VITAL_SIGN : 3
- DELETE_ALERT : 1

✅ Conformité
✓ Toutes les actions enregistrées
✓ Traçabilité complète
✓ Intégrité des données vérifiée
```

---

## 🔄 Prochaines étapes

1. **Email d'alerte** - Envoyer un email à l'auditeur si action DELETE
2. **Blockchain proof** - Lier les logs d'audit à la blockchain (déjà structuré)
3. **Backup automatique** - Archiver les logs tous les mois
4. **Analytics avancées** - Tableau de bord avec tendances
5. **Export PDF** - Générer des rapports officiels

---

## 📞 Dépannage

### "Auditeur ne voit pas tous les logs"

- Vérifier que l'utilisateur a le rôle `AUDITOR` ou `ADMIN`
- Vérifier les permissions dans la page `/admin/audit`

### "Logs ne s'enregistrent pas"

- Vérifier que `AuditService.logAction()` est appelé
- Vérifier les erreurs dans les logs serveur
- Vérifier que Prisma est correctement configuré

### "Filtres ne marchent pas"

- Vérifier les noms des champs dans la base de données
- Vérifier la validité des formats de date
- Vérifier les IDs utilisateur en base

---

**Version**: 1.0  
**Date**: 8 avril 2026  
**Auteur**: MediFollow Audit Team
