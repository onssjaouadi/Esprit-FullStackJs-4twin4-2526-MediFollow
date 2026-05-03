import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import AlertDetailContent from "./alert-detail-content";

async function getAlert(alertId: string) {
  try {
    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        triggeredBy: true,
        acknowledgedBy: true,
        resolvedBy: true,
      },
    });
    return alert as any;
  } catch (error) {
    console.error("Error fetching alert:", error);
    return null;
  }
}

async function getVitalRecord(vitalId: string) {
  try {
    const vital = await prisma.vitalRecord.findUnique({
      where: { id: vitalId },
    });
    return vital as any;
  } catch (error) {
    console.error("Error fetching vital record:", error);
    return null;
  }
}

export default async function AlertDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const alert = await getAlert(params.id);
  if (!alert) {
    redirect("/dashboard/patient/alerts");
  }

  const vitalRecord = alert.vitalRecordId
    ? await getVitalRecord(alert.vitalRecordId)
    : null;

  return <AlertDetailContent alert={alert} vitalRecord={vitalRecord} />;
}
