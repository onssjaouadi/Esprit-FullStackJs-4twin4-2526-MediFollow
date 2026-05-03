import Pusher from "pusher";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; 
import { sendAdminAlertSMS } from "@/lib/actions/notification.actions";
import { AlertType, AlertSeverity, AlertStatus } from "@/types/medifollow.types";

const pusherServer = new Pusher({
  appId: "2137291",
  key: "ba707a9085e391ba151b",
  secret: "cf52ff92044e670f8ec0",
  cluster: "eu",
  useTLS: true,
});

export async function POST() {
  try {
    // 1. Trouver un patient existant (obligatoire selon ton schéma Prisma)
    const existingPatient = await prisma.patient.findFirst();

    if (!existingPatient) {
      return NextResponse.json(
        { error: "Désolé, aucun patient n'existe en base pour créer cette alerte de test." }, 
        { status: 400 }
      );
    }

    const title = "TEST MONGODB CONNECTÉ";
    const desc = "L'alerte a été enregistrée avec succès dans la collection 'alerts'.";

    // 2. CRÉATION DANS MONGODB
    // On utilise AlertSeverity.LOW car INFO n'existe pas dans ton enum Prisma
    const newDbAlert = await prisma.alert.create({
      data: {
        message: desc,
        alertType: AlertType.SYSTEM,
        severity: AlertSeverity.LOW, 
        status: AlertStatus.OPEN,
        // On lie l'alerte au patient trouvé (contrainte de ton schéma)
        patient: { connect: { id: existingPatient.id } }
      },
    });

    // 3. ENVOI PUSHER
    await pusherServer.trigger("admin-updates", "new-alert", {
      title: title,
      desc: desc,
      alertId: newDbAlert.id
    });

    await sendAdminAlertSMS(`⚠️ ALERTE TEST\n${desc}`);

    return NextResponse.json({ 
      success: true, 
      message: "Alerte liée au patient et envoyée !",
      patientName: existingPatient.id 
    });

  } catch (error) {
    console.error("Erreur complète:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'insertion MongoDB" }, 
      { status: 500 }
    );
  }
}