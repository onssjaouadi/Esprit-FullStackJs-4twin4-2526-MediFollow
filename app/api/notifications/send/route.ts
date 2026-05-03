import { getCurrentUser } from "@/lib/actions/auth.actions";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "COORDINATOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipientRole, title, message, type, relatedAlertId } =
      await request.json();

    if (!recipientRole || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find all users with the specified role
    const recipients = await prisma.user.findMany({
      where: { role: recipientRole === "ADMIN" ? "ADMIN" : "NURSE" },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: `No ${recipientRole.toLowerCase()} found` },
        { status: 404 }
      );
    }

    // Create notifications for each recipient
    const notifications = await Promise.all(
      recipients.map((recipient) =>
        prisma.notification.create({
          data: {
            recipientId: recipient.id,
            type: type || "ALERT",
            title: title,
            message: message,
            sentVia: ["IN_APP"],
            data: relatedAlertId ? { relatedAlertId } : null,
          },
        })
      )
    );

    console.log(
      `✅ [Send Notification] Created ${notifications.length} notifications for ${recipientRole}`
    );
    console.log(`   Recipients: ${recipients.map((r) => r.email).join(", ")}`);

    return NextResponse.json({
      success: true,
      message: `Notification sent to ${recipients.length} ${recipientRole.toLowerCase()}(s)`,
      data: { notificationsCreated: notifications.length },
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
