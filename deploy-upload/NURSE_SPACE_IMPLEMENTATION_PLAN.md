# MediFollow - Plan de Fusion & Recommandations

## 🎯 Décision Stratégique

**RECOMMANDATION: Standardiser sur l'Espace Nurse Dédié** ✅

Raison:

- Architecture supérieure
- Features modernes (voice, AI)
- Code modulaire et réutilisable
- Vraies données vs mock
- Meilleur UX/DX

---

## 📋 Phase 1: Complétion de l'Espace Nurse (2-3 sprints)

### 1.1 - Ajouter la gestion des Rappels (Reminders)

**Créer**: `nurse/app/dashboard/nurse/reminders/page.tsx`

```typescript
// Structure esperée
export default function RemindersPage() {
  // Utiliser les actions existantes de lib/actions/nurse.actions
  // OU créer des nouvelles pour consistency

  const [reminders, setReminders] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Fetch reminders
  async function loadReminders() {
    const result = await getNurseReminders(userId);
    // BUT: utiliser l'action du projet nurse, pas lib/actions
  }

  // IMPORTANT: Décider si reminders="assignations"
  // OU si reminders = "tasks/notifications separées"
}
```

**Décision à prendre**:

- Reminders ≠ Patient Assignments?
- Ou Reminders = Patient Follow-up Tasks?
- Si oui, introduire `ReminderTask` table

**Fichiers à modifier**:

```
✏️ nurse/lib/actions/nurse.actions.ts
   └─ Ajouter getNurseReminders()
   └─ Ajouter createReminder()
   └─ Ajouter sendReminder()
   └─ Ajouter updateReminder()

✏️ nurse/app/dashboard/nurse/layout.tsx
   └─ Ajouter "Reminders" au navItems

✨ nurse/components/nurse/ReminderForm.tsx (NEW)
   └─ Formulaire création rappel

✨ nurse/components/nurse/ReminderList.tsx (NEW)
   └─ Liste avec actions
```

**Estimation**: ~8 heures

---

### 1.2 - Ajouter la Section Profil

**Créer**: `nurse/app/dashboard/nurse/profile/page.tsx`

```typescript
export default function NurseProfilePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Load nurse profile
  async function loadProfile() {
    const result = await getNurseProfile(userId);
    if (result.success) {
      setProfile(result.data);
    }
  }

  // Save changes
  async function handleSave() {
    const result = await updateNurseProfile(userId, formData);
    // Handle...
  }
}
```

**Fichiers à modifier/créer**:

```
✏️ nurse/lib/actions/nurse.actions.ts
   └─ getNurseProfile() ✅ EXISTS, utiliser
   └─ updateNurseProfile() ✅ EXISTS, utiliser

✏️ nurse/app/dashboard/nurse/layout.tsx
   └─ Ajouter "Profile" au navItems (optional)

✨ nurse/components/nurse/ProfileForm.tsx (NEW)
   └─ Edit form avec validation

✨ nurse/components/nurse/ProfileCard.tsx (NEW)
   └─ Display card profile
```

**Estimation**: ~6 heures

---

### 1.3 - Finaliser Page Patient [ID]

**Créer/Compléter**: `nurse/app/dashboard/nurse/patients/[id]/page.tsx`

Status: ⚠️ Importée depuis espace principal, mais **structure manquante**

```typescript
export default function PatientDetailPage({
  params: { id }
}: {
  params: { id: string }
}) {
  const [patient, setPatient] = useState(null);
  const [vitals, setVitals] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [showAIReport, setShowAIReport] = useState(false);
  const [aiReport, setAiReport] = useState(null);

  // Load patient complet
  async function loadPatient() {
    // 1. Get patient base info
    const patientResult = await getPatient(id);

    // 2. Get vitals history (derniers 30 jours)
    const vitalsResult = await getPatientVitals(id, 30);

    // 3. Get related alerts
    const alertsResult = await getPatientAlerts(id);

    // 4. Generate AI report (optional)
    if (vitalsResult.data?.length) {
      const report = await generateVitalReport(vitalsResult.data);
      setAiReport(report);
    }
  }

  return (
    <div>
      {/* Header Tabs */}
      <Tabs defaultValue="vitals">
        <TabsList>
          <TabsTrigger value="vitals">Vitals History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="notes">Care Notes</TabsTrigger>
        </TabsList>

        {/* Vitals Tab */}
        <TabsContent value="vitals">
          <VitalsTable vitals={vitals} />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <VitalsAnalytics vitals={vitals} />
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts">
          <AlertsList alerts={alerts} />
        </TabsContent>

        {/* AI Report */}
        {aiReport && (
          <AIReportDialog
            isOpen={showAIReport}
            onClose={() => setShowAIReport(false)}
            report={aiReport}
            title={`${patient.firstName} ${patient.lastName} - Analysis`}
          />
        )}
      </Tabs>
    </div>
  );
}
```

**Fichiers à modifier/créer**:

```
✏️ nurse/app/dashboard/nurse/patients/[id]/page.tsx
   └─ Compléter la page

✨ nurse/components/nurse/VitalsTable.tsx
   └─ Tableau vitaux avec pagination

✨ nurse/components/nurse/VitalsAnalytics.tsx
   └─ Charts (6-month trends)

✨ nurse/components/nurse/VitalsChart.tsx
   └─ Recharts/Chart.js integration

✏️ nurse/lib/actions/vital.actions.ts
   └─ getPatientVitals(patientId, days?)
   └─ getPatientAlerts(patientId)

✏️ nurse/app/dashboard/nurse/patients/page.tsx
   └─ Link to [id] pages
```

**Dépendances**:

- Chart library (recharts recommended)
- Tabs component UI
- Table component UI

**Estimation**: ~12 heures

---

### 1.4 - Liens de Navigation

**Mise à jour**: `nurse/app/dashboard/nurse/patients/page.tsx`

```typescript
// Ajouter link vers patient detail
<Link href={`/dashboard/nurse/patients/${patient.id}`}>
  <PatientCard patient={patient} />
</Link>
```

**Estimation**: ~2 heures

---

### 1.5 - Ajouter Settings/Preferences Page (Optional)

**Créer**: `nurse/app/dashboard/nurse/settings/page.tsx`

```typescript
export default function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>

      {/* Notifications */}
      <section>
        <label>
          <input type="checkbox" defaultChecked />
          Email Alerts
        </label>
      </section>

      {/* Theme */}
      <section>
        <select defaultValue={theme}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>
      </section>

      {/* Language */}
      <section>
        <select defaultValue="en">
          <option value="en">English</option>
          <option value="fr">Français</option>
        </select>
      </section>
    </div>
  );
}
```

**Estimation**: ~4 heures

---

## 📊 Phase 2: Migration & Nettoyage (2 sprints)

### 2.1 - Backup de l'Espace Principal

```bash
# Copier l'ancien espace
cp -r app/dashboard/nurse app/dashboard/nurse.backup

# Documentation
echo "Archived: Old nurse space backed up to nurse.backup/" > MIGRATION_NOTES.md
```

**Fichiers à sauvegarder**:

```
app/dashboard/nurse/ (complet)
lib/actions/nurse.actions.ts (v1)
```

---

### 2.2 - Merger les Actions

**Décision**: Quelle version d'actions garder?

**Option A: Garder `/nurse/lib/actions/nurse.actions.ts`**

- Plus moderne
- Utilise `NurseAssignment` table (meilleur)
- À jour pour les features modernes

**Option B: Merger les deux versions**

- Garder les deux fonctions (renommer)
- Trop complexe, déconseillé

**RECOMMANDATION: Option A** ✅

```typescript
// nurse/lib/actions/nurse.actions.ts
// Ajouter les functkons manquantes du vieux:
- createPatientReminder() // FROM old
- sendPatientReminder()   // FROM old
- getNurseReminders()     // Adapter

// Move to:
lib/actions/nurse.actions.ts (renommer de /nurse/lib)
```

---

### 2.3 - Redirection 301 (Old → New)

**Créer**: `app/dashboard/nurse/page.ts` (NOT tsx)

```typescript
import { redirect } from "next/navigation";

export default function NurseDashboardRedirect() {
  // Redirect old path to new path with 301
  redirect("/dashboard/nurse", "replace");
}
```

**Pour tous les anciens paths**:

```
/dashboard/nurse                    → /dashboard/nurse
/dashboard/nurse/patients           → /dashboard/nurse/patients
/dashboard/nurse/alerts             → /dashboard/nurse/alerts
/dashboard/nurse/reminders          → /dashboard/nurse/reminders
/dashboard/nurse/profile            → /dashboard/nurse/profile
/dashboard/nurse/alerts/[id]        → (handled in new space)
```

---

### 2.4 - Tester tous les flows

```
Checklist:
□ Login → Dashboard
□ Dashboard loads real stats
□ Patients → List all
□ Patients → Click patient → Detail view
□ Patients → Enter Data → Voice → Submit
□ Patients → Enter Data → Manual → Submit
□ Alerts → List
□ Alerts → Acknowledge
□ Reminders → Create (NEW)
□ Reminders → Send (NEW)
□ Profile → View & Edit (NEW)
□ Logout
□ Mobile responsive
□ Dark mode toggle
□ Old paths redirect
```

**Estimation**: ~8 heures

---

## 🗂️ Phase 3: Cleanup & Documentation (1 sprint)

### 3.1 - Supprimer code dupliqué

```
DELETE:
- app/dashboard/nurse/alerts/page.tsx
- app/dashboard/nurse/patients/page.tsx
- app/dashboard/nurse/profile/page.tsx
- app/dashboard/nurse/reminders/page.tsx
- app/dashboard/nurse/layout.tsx
- app/dashboard/nurse/page.tsx

KEEP:
- Redirects in app/dashboard/nurse/page.ts
- Redirects in app/dashboard/nurse/[section]/page.ts
```

---

### 3.2 - Mettre à jour imports

**Partout dans le code**:

```typescript
// OLD
import { getNurseAlerts } from "@/lib/actions/nurse.actions";

// NEW
import { getNursePatientAlerts as getNurseAlerts } from "@/lib/actions/nurse.actions";
```

---

### 3.3 - Documentation

**Créer**: `NURSE_SPACE_MIGRATION.md`

```markdown
# Migration Documentation

## Changements

- Consolidation des espaces nurse
- Nouvelle architecture modulaire
- Features modernes (voice, AI)

## Checklist de migration

- [x] Phase 1: Completion
- [x] Phase 2: Migration
- [x] Phase 3: Cleanup
- [x] Staging: QA
- [x] Production: Deploy

## Breaking changes

- Ancien paths redirigés 301
- Certains action names changés
- Database schema unifiée via NurseAssignment

## Roll-back plan

- Ancien code backé à nurse.backup/
- Revert git si problème majeur
```

---

## 📈 Estimation Totale

| Phase     | Tâche            | Heures        | Priorité |
| --------- | ---------------- | ------------- | -------- |
| 1.1       | Reminders        | 8             | HIGH     |
| 1.2       | Profile          | 6             | MEDIUM   |
| 1.3       | Patient [id]     | 12            | HIGH     |
| 1.4       | Navigation links | 2             | LOW      |
| 1.5       | Settings         | 4             | LOW      |
| 2.1       | Backup           | 1             | HIGH     |
| 2.2       | Merger actions   | 4             | HIGH     |
| 2.3       | Redirects        | 2             | HIGH     |
| 2.4       | Testing          | 8             | HIGH     |
| 3.1       | Delete dups      | 2             | LOW      |
| 3.2       | Update imports   | 3             | MEDIUM   |
| 3.3       | Documentation    | 2             | MEDIUM   |
| **TOTAL** |                  | **54 heures** |          |

**Timeline**: ~2-3 sprints (si 1 sprint = 40h)

---

## 🎯 Priorités Recommandées

### Sprint 1 (Semaine 1-2): CRITICAL FEATURES

1. ✅ Compléter Patient [ID] page
2. ✅ Ajouter Reminders section
3. ✅ Test tous les flows

**Livrable**: Espace nurse 100% fonctionnel

---

### Sprint 2 (Semaine 3-4): POLISHING & MIGRATION

1. ✅ Merger actions
2. ✅ Setup redirects
3. ✅ Backup ancien code
4. ✅ QA complet

**Livrable**: Old space redirects, zero broken links

---

### Sprint 3 (Semaine 5): CLEANUP

1. ✅ Supprimer ancien code
2. ✅ Update imports globalement
3. ✅ Final testing
4. ✅ Deploy production

**Livrable**: Code 100% migré, ancien supprimé

---

## 🚀 Go/No-Go Criteria

### Before Phase 1

- [ ] All team agrees on architecture
- [ ] Database schema unified
- [ ] Tests written for new features

### Before Phase 2

- [ ] All Phase 1 features 100% functional
- [ ] User acceptance testing passed
- [ ] Zero critical bugs

### Before Phase 3

- [ ] Phase 2 tested in staging
- [ ] Rollback plan documented
- [ ] Monitoring setup for production

---

## ⚠️ Risks & Mitigations

| Risk                            | Mitigation                           |
| ------------------------------- | ------------------------------------ |
| User confusion during migration | Redirect with banner "New interface" |
| Data loss                       | Backup + DB snapshots                |
| Performance regression          | Load testing before phase 3          |
| Feature regression              | Comprehensive test suite             |
| Language inconsistency (EN/FR)  | Decide: standardize on one           |

---

## 📝 Configuration Language

**DECISION REQUIRED**:

- Garder Français (ancien espace)?
- Utiliser English (nouveau espace)?
- Supporter les deux (i18n)?

**RECOMMANDATION**:

- English by default (modern standard)
- I18n pour FR/EN (future proof)

---

## 🔗 Related Documents

- `NURSE_SPACE_COMPARISON.md` - Comparaison complète
- `NURSE_SPACE_ARCHITECTURE.md` - Vue technique
- `.backup/` - Ancien code conservé

---

**Plan créé**: 14 Avril 2026  
**Durée estimée**: 2-3 sprints  
**Priorité**: HIGH - Améliore UX & maintenabilité
