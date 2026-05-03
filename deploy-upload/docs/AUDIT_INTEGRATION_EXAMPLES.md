/\*\*

- EXEMPLE D'INTÉGRATION DU SYSTÈME D'AUDIT
-
- Ce fichier montre comment intégrer les logs d'audit
- dans une API existante (par exemple, créer/modifier des signes vitaux)
-
- Copier le pattern pour les autres APIs
  \*/

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AuditService } from "@/lib/services/audit.service";
import { AuditActionType } from "@/lib/constants/audit.constants";

// ============================================
// EXEMPLE 1: Créer un signe vital
// ============================================

export async function exampleCreateVitalSign() {
const session = await auth();

if (!session?.user?.id) {
throw new Error("Unauthorized");
}

// 1. Créer le signe vital
const vitalData = {
patientId: "patient123",
systolicBP: 140,
diastolicBP: 85,
heartRate: 78,
temperature: 36.8,
oxygenSaturation: 98,
status: "NORMAL",
};

const vital = await prisma.vitalRecord.create({
data: vitalData,
});

// 2. ✨ ENREGISTRER L'ACTION D'AUDIT
await AuditService.logAction({
userId: session.user.id,
action: AuditActionType.CREATE_VITAL_SIGN as any,
entityType: "VitalRecord",
entityId: vital.id,
changes: {
created: {
oldValue: null,
newValue: vitalData,
},
},
ipAddress: "192.168.1.1", // À extraire du request
userAgent: "Mozilla/5.0...", // À extraire du request
});

return vital;
}

// ============================================
// EXEMPLE 2: Modifier un signe vital
// ============================================

export async function exampleUpdateVitalSign() {
const session = await auth();

if (!session?.user?.id) {
throw new Error("Unauthorized");
}

const vitalId = "vital123";

// 1. Récupérer les données AVANT modification
const oldVital = await prisma.vitalRecord.findUnique({
where: { id: vitalId },
});

// 2. Modifier le signe vital
const newData = {
systolicBP: 150,
diastolicBP: 90,
status: "A_VERIFIER",
};

const newVital = await prisma.vitalRecord.update({
where: { id: vitalId },
data: newData,
});

// 3. ✨ ENREGISTRER L'ACTION D'AUDIT AVEC LES CHANGEMENTS
await AuditService.logAction({
userId: session.user.id,
action: AuditActionType.UPDATE_VITAL_SIGN as any,
entityType: "VitalRecord",
entityId: vitalId,
changes: {
systolicBP: {
oldValue: oldVital?.systolicBP,
newValue: newVital.systolicBP,
},
diastolicBP: {
oldValue: oldVital?.diastolicBP,
newValue: newVital.diastolicBP,
},
status: {
oldValue: oldVital?.status,
newValue: newVital.status,
},
},
});

return newVital;
}

// ============================================
// EXEMPLE 3: Supprimer un signe vital
// ============================================

export async function exampleDeleteVitalSign() {
const session = await auth();

if (!session?.user?.id) {
throw new Error("Unauthorized");
}

const vitalId = "vital123";

// 1. Récupérer les données AVANT suppression
const vital = await prisma.vitalRecord.findUnique({
where: { id: vitalId },
});

// 2. Supprimer
await prisma.vitalRecord.delete({
where: { id: vitalId },
});

// 3. ✨ ENREGISTRER LA SUPPRESSION COMME ACTION CRITIQUE
await AuditService.logAction({
userId: session.user.id,
action: AuditActionType.DELETE_VITAL_SIGN as any,
entityType: "VitalRecord",
entityId: vitalId,
changes: {
deleted: {
oldValue: vital, // Garder un registre complet
newValue: null,
},
},
});
}

// ============================================
// EXEMPLE 4: Recevoir une alerte
// ============================================

export async function exampleAcknowledgeAlert() {
const session = await auth();

if (!session?.user?.id) {
throw new Error("Unauthorized");
}

const alertId = "alert123";

// 1. Récupérer l'alerte
const oldAlert = await prisma.alert.findUnique({
where: { id: alertId },
});

// 2. Marquer comme reconnue
const newAlert = await prisma.alert.update({
where: { id: alertId },
data: {
status: "ACKNOWLEDGED",
acknowledgedById: session.user.id,
acknowledgedAt: new Date(),
},
});

// 3. ✨ ENREGISTRER L'ACCUSÉ DE RÉCEPTION
await AuditService.logAcknowledgeAlert(session.user.id, alertId);

return newAlert;
}

// ============================================
// EXEMPLE 5: Créer un patient
// ============================================

export async function exampleCreatePatient() {
const session = await auth();

if (!session?.user?.id) {
throw new Error("Unauthorized");
}

const patientData = {
userId: "user123",
mrn: "MRN123456",
dateOfBirth: new Date("1980-01-15"),
gender: "M",
address: "123 Rue de....",
};

// 1. Créer le patient
const patient = await prisma.patient.create({
data: patientData,
});

// 2. ✨ ENREGISTRER LA CRÉATION
await AuditService.logCreatePatient(session.user.id, patient.id, patientData);

return patient;
}

// ============================================
// EXEMPLE 6: Accorder l'accès à un patient
// ============================================

export async function exampleGrantAccess() {
const session = await auth();

if (!session?.user?.id) {
throw new Error("Unauthorized");
}

const doctorId = "doctor123";
const patientId = "patient123";

// 1. Créer l'AccessGrant
const accessGrant = await prisma.accessGrant.create({
data: {
doctorId,
patientId,
grantedBy: session.user.id,
status: "ACTIVE",
},
});

// 2. ✨ ENREGISTRER L'ATTRIBUTION D'ACCÈS
await AuditService.logGrantAccess(session.user.id, doctorId, "PATIENT_ACCESS");

return accessGrant;
}

// ============================================
// API ROUTE EXAMPLE: POST /api/vitals
// ============================================

/\*
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
const session = await auth();

if (!session?.user?.id) {
return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

const body = await request.json();

try {
// 1. Créer le signe vital
const vital = await prisma.vitalRecord.create({
data: {
patientId: body.patientId,
systolicBP: body.systolicBP,
diastolicBP: body.diastolicBP,
heartRate: body.heartRate,
temperature: body.temperature,
oxygenSaturation: body.oxygenSaturation,
status: body.status || "NORMAL",
},
});

    // 2. ✨ ENREGISTRER L'ACTION D'AUDIT
    await AuditService.logCreateVitalSign(
      session.user.id,
      vital.id,
      body
    );

    return NextResponse.json(vital);

} catch (error) {
console.error("Error creating vital:", error);
return NextResponse.json(
{ error: "Failed to create vital" },
{ status: 500 }
);
}
}

export async function PATCH(request: NextRequest) {
const session = await auth();

if (!session?.user?.id) {
return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

const { id, ...updates } = await request.json();

try {
// 1. Récupérer les données AVANT
const oldVital = await prisma.vitalRecord.findUnique({
where: { id },
});

    // 2. Mettre à jour
    const newVital = await prisma.vitalRecord.update({
      where: { id },
      data: updates,
    });

    // 3. ✨ ENREGISTRER L'AUDIT AVEC COMPARAISON OLD/NEW
    await AuditService.logUpdateVitalSign(
      session.user.id,
      id,
      oldVital,
      newVital
    );

    return NextResponse.json(newVital);

} catch (error) {
console.error("Error updating vital:", error);
return NextResponse.json(
{ error: "Failed to update vital" },
{ status: 500 }
);
}
}
\*/

// ============================================
// SERVER ACTION EXAMPLE
// ============================================

/\*
"use server";

import { AuditService } from "@/lib/services/audit.service";
import { AuditActionType } from "@/lib/constants/audit.constants";
import { auth } from "@/auth";

export async function createVitalSignAction(vitalData: any) {
const session = await auth();

if (!session?.user?.id) {
throw new Error("Unauthorized");
}

// 1. Créer
const vital = await prisma.vitalRecord.create({
data: vitalData,
});

// 2. Auditer
await AuditService.logAction({
userId: session.user.id,
action: AuditActionType.CREATE_VITAL_SIGN as any,
entityType: "VitalRecord",
entityId: vital.id,
changes: {
created: {
oldValue: null,
newValue: vitalData,
},
},
});

return vital;
}
\*/

// ============================================
// CHECKLIST D'INTÉGRATION
// ============================================

/\*
Pour intégrer l'audit dans une API:

1. [ ] Importer AuditService
       import { AuditService } from "@/lib/services/audit.service";

2. [ ] Importer AuditActionType (optionnel mais recommandé)
       import { AuditActionType } from "@/lib/constants/audit.constants";

3. [ ] Après l'action principale (CREATE/UPDATE/DELETE), ajouter:
       await AuditService.log[Action](userId, entityId, data);

   Exemples:
   - await AuditService.logCreateVitalSign(userId, vitalId, data);
   - await AuditService.logUpdateVitalSign(userId, vitalId, oldData, newData);
   - await AuditService.logAcknowledgeAlert(userId, alertId);

4. [ ] Pour UPDATE, toujours récupérer les OLD values:
       const oldData = await prisma.model.findUnique({ where: { id } });
       const newData = await prisma.model.update({ where: { id }, data });
       await AuditService.logUpdate(..., oldData, newData);

5. [ ] Les DELETE sont CRITIQUES - toujours enregistrer les données deleted:
       await AuditService.logDeleteVitalSign(userId, id, oldData);

6. [ ] Tester avec:
       node scripts/test-audit.js

7. [ ] Vérifier dans le dashboard:
       /admin/audit
       \*/
