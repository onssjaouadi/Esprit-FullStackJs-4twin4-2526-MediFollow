/**
 * Notification Service
 * Handles multi-channel notifications (Email, SMS, In-app)
 * Integration with SendGrid (Email) and Twilio (SMS)
 * NOTE: Services are lazy-initialized to avoid webpack bundling issues
 */

import prisma from "@/lib/prisma";

// Lazy-loaded clients
let sgMail: any = null;
let twilioClient: any = null;
let initialized = false;

/**
 * Initialize external services (called on first use)
 */
function ensureInitialized() {
  if (initialized) return;

  try {
    // Lazy import SendGrid
    if (process.env.SENDGRID_API_KEY && !sgMail) {
      const sgMailModule = require("@sendgrid/mail");
      sgMail = sgMailModule.default || sgMailModule;
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }

    // Lazy import Twilio
    if (
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      !twilioClient
    ) {
      const twilioModule = require("twilio");
      const twilio = twilioModule.default || twilioModule;
      twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    }

    initialized = true;
  } catch (error) {
    console.warn(
      "⚠️ Failed to initialize external notification services:",
      error
    );
    // Continue anyway - services are optional
  }
}

export type NotificationChannel = "EMAIL" | "SMS" | "IN_APP";

export interface NotificationPayload {
  recipientId: string;
  title: string;
  message: string;
  type:
    | "ALERT"
    | "REMINDER"
    | "SYSTEM"
    | "MESSAGE"
    | "APPOINTMENT"
    | "VITAL_REVIEW";
  channels: NotificationChannel[];
  data?: Record<string, any>;
  urgentEmail?: boolean;
  smsMessage?: string;
}

export class NotificationService {
  /**
   * Send notification via multiple channels
   */
  static async send(payload: NotificationPayload): Promise<void> {
    try {
      ensureInitialized(); // Initialize services on first use

      // Get recipient user details
      const recipient = await prisma.user.findUnique({
        where: { id: payload.recipientId },
      });

      if (!recipient) {
        throw new Error(`User not found: ${payload.recipientId}`);
      }

      // Send via each channel in parallel
      await Promise.all(
        payload.channels.map((channel) => {
          switch (channel) {
            case "EMAIL":
              return this.sendEmail(recipient, payload);
            case "SMS":
              return this.sendSMS(recipient, payload);
            case "IN_APP":
              return this.saveInAppNotification(payload);
            default:
              return Promise.resolve();
          }
        })
      );

      console.log(
        `✅ Notification sent to ${recipient.email} via ${payload.channels.join(", ")}`
      );
    } catch (error) {
      console.error("❌ Notification Service Error:", error);
      throw error;
    }
  }

  /**
   * Send email via SendGrid
   */
  private static async sendEmail(
    recipient: any,
    payload: NotificationPayload
  ): Promise<void> {
    try {
      const subject = this.getEmailSubject(payload.type);
      const htmlContent = this.getEmailTemplate(payload);

      await sgMail.send({
        to: recipient.email,
        from: process.env.SENDGRID_FROM_EMAIL!,
        subject,
        html: htmlContent,
        priority: payload.urgentEmail ? "high" : "normal",
      });
    } catch (error) {
      console.error("❌ Email Send Error:", error);
      throw error;
    }
  }

  /**
   * Send SMS via Twilio
   */
  private static async sendSMS(
    recipient: any,
    payload: NotificationPayload
  ): Promise<void> {
    console.log("📱 SMS Send Attempt:", {
      userId: recipient.id,
      phoneNumber: recipient.phoneNumber,
      hasPhoneNumber: !!recipient.phoneNumber,
      hasTwilioSid: !!process.env.TWILIO_ACCOUNT_SID,
      hasTwilioToken: !!process.env.TWILIO_AUTH_TOKEN,
      hasMessagingServiceSid: !!process.env.TWILIO_MESSAGING_SERVICE_SID,
      smsText: payload.smsMessage || payload.message,
    });

    if (!recipient.phoneNumber) {
      console.warn(`❌ No phone number for user ${recipient.id}`);
      return;
    }

    try {
      const smsText =
        payload.smsMessage || this.getTruncatedMessage(payload.message, 160);

      console.log("📞 Sending SMS via Twilio:", {
        to: recipient.phoneNumber,
        body: smsText,
        messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
      });

      // Use Messaging Service SID (recommended by Twilio) instead of From number
      const result = await twilioClient.messages.create({
        body: smsText,
        messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID!,
        to: recipient.phoneNumber,
      });

      console.log("✅ SMS Sent Successfully:", {
        messageSid: result.sid,
        status: result.status,
        to: result.to,
      });
    } catch (error) {
      console.error("❌ SMS Send Error:", {
        error: error instanceof Error ? error.message : String(error),
        fullError: error,
      });
      throw error;
    }
  }

  /**
   * Save in-app notification to database
   */
  private static async saveInAppNotification(
    payload: NotificationPayload
  ): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          recipientId: payload.recipientId,
          type: payload.type,
          title: payload.title,
          message: payload.message,
          data: payload.data,
          sentVia: ["IN_APP"],
        },
      });
    } catch (error) {
      console.error("❌ In-App Notification Save Error:", error);
      throw error;
    }
  }

  /**
   * Alert notifications - send to patient and assigned doctor
   */
  static async notifyAlert(alertId: string): Promise<void> {
    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
      include: { patient: true },
    });

    if (!alert) return;

    const patient = alert.patient;

    // Determine severity and channels
    const channels: NotificationChannel[] = ["IN_APP"];
    if (alert.severity === "HIGH" || alert.severity === "CRITICAL") {
      channels.push("EMAIL");
      if (patient.user.phoneNumber) channels.push("SMS");
    }

    // Send to patient
    await this.send({
      recipientId: patient.userId,
      title: `Alerte Santé - ${alert.severity}`,
      message: alert.message,
      type: "ALERT",
      channels,
      data: { alertId, severity: alert.severity },
      urgentEmail: alert.severity === "CRITICAL",
      smsMessage:
        alert.severity === "CRITICAL"
          ? `URGENT: ${alert.message}. Contactez votre docteur immédiatement.`
          : undefined,
    });

    // TODO: Notify assigned doctor
  }

  /**
   * Vital review notifications - notify doctor to review vitals
   */
  static async notifyVitalReview(
    patientId: string,
    vitalRecordId: string
  ): Promise<void> {
    const vitalRecord = await prisma.vitalRecord.findUnique({
      where: { id: vitalRecordId },
      include: { patient: true },
    });

    if (!vitalRecord) return;

    // TODO: Find assigned doctor(s) for patient
    // For now, send to all doctors (admin feature)
    const doctors = await prisma.user.findMany({
      where: { role: "DOCTOR" },
    });

    for (const doctor of doctors) {
      await this.send({
        recipientId: doctor.id,
        title: "Révision Vitals Requise",
        message: `Le patient ${vitalRecord.patient.user.firstName} ${vitalRecord.patient.user.lastName} a fourni de nouvelles mesures vitales. Révision requise.`,
        type: "VITAL_REVIEW",
        channels: ["IN_APP", "EMAIL"],
        data: { patientId, vitalRecordId },
      });
    }
  }

  /**
   * Appointment reminder - notify patient before appointment
   */
  static async notifyAppointmentReminder(appointmentId: string): Promise<void> {
    // TODO: Implement if using built-in appointment system
    // For now, handled by external schedule
  }

  /**
   * Helper: Get email subject based on notification type
   */
  private static getEmailSubject(type: string): string {
    const subjects: Record<string, string> = {
      ALERT: "Alerte Santé Importante",
      REMINDER: "Rappel",
      VITAL_REVIEW: "Mesures Vitales En Attente de Révision",
      APPOINTMENT: "Confirmation Rendez-vous",
      SYSTEM: "Notification Système",
      MESSAGE: "Nouveau Message",
    };
    return subjects[type] || "Notification";
  }

  /**
   * Helper: Get email HTML template
   */
  private static getEmailTemplate(payload: NotificationPayload): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f4f4f4; padding: 20px; border-radius: 5px; }
            .content { padding: 20px 0; }
            .footer { text-align: center; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${payload.title}</h2>
            </div>
            <div class="content">
              <p>${payload.message}</p>
              ${
                payload.data
                  ? `<p><small>${JSON.stringify(payload.data)}</small></p>`
                  : ""
              }
            </div>
            <div class="footer">
              <p>© 2026 MediFollow - Plateforme de Suivi Santé</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Helper: Truncate message to SMS limit (160 chars)
   */
  private static getTruncatedMessage(message: string, limit: number): string {
    if (message.length <= limit) return message;
    return message.substring(0, limit - 3) + "...";
  }
}

export default NotificationService;
