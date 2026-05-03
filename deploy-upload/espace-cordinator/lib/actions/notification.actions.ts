"use server";

import { Resend } from "resend";
import nodemailer from "nodemailer";
import { NotificationChannel, Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

// ============================================
// EMAIL TRANSPORT (Resend)
// ============================================

function getResend() {
  const key = process.env.RESEND_API_KEY || "";
  return new Resend(key);
}

const EMAIL_FROM = process.env.RESEND_FROM_EMAIL || "MediFollow <onboarding@resend.dev>";

// ============================================
// INFOBIP SMS
// ============================================

function getInfobipConfig() {
  return {
    apiKey: process.env.INFOBIP_API_KEY || "433c3b0dcfe954ceece1f315f39423b4-ea583b0b-644a-48ab-af7e-aee9e02e3860",
    baseUrl: process.env.INFOBIP_BASE_URL || "https://x111p4.api.infobip.com",
    // Only set a custom sender when explicitly configured.
    // Leaving it undefined lets Infobip use its registered numeric sender,
    // which is required for delivery in many MENA countries (incl. Tunisia).
    from: process.env.INFOBIP_SMS_FROM || undefined,
  };
}

export async function getAlertSmsPhone() {
  return process.env.ALERT_SMS_PHONE || process.env.ADMIN_PHONE || "29444051";
}

// ============================================
// SEND EMAIL
// ============================================

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const apiKey = process.env.RESEND_API_KEY;

    if (apiKey) {
      const resend = getResend();
      const { error } = await resend.emails.send({
        from: EMAIL_FROM,
        to,
        subject,
        html,
      });

      if (error) {
        console.error("❌ Resend error:", error);
        return { success: false, error };
      }

      console.log(`✅ Email envoyé à ${to} (via Resend)`);
      return { success: true };
    }

    // Fallback to Nodemailer if SMTP is configured
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: { rejectUnauthorized: false },
      });

      const result = await transporter.sendMail({
        from: `"MediFollow" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });

      console.log(`✅ Email envoyé à ${to} (via Nodemailer)`);
      return { success: true, messageId: result.messageId };
    }

    console.warn("[Notification] No Email provider configured (missing RESEND_API_KEY and SMTP_USER), skipping email to", to);
    return { success: false, reason: "No email provider configured" };
  } catch (error) {
    console.error("❌ Erreur envoi email:", error);
    return { success: false, error };
  }
}

// ============================================
// SEND SMS via Infobip
// ============================================

export async function sendSMS(to: string, text: string) {
  const { apiKey, baseUrl, from } = getInfobipConfig();
  try {
    if (!apiKey) {
      console.warn("[Notification] Infobip API key not configured, skipping SMS to", to);
      return { success: false, reason: "Infobip not configured" };
    }

    console.log(`[SMS] Sending to ${to} from ${from}, API key present: ${!!apiKey && apiKey.length > 10}`);

    const response = await fetch(`${baseUrl}/sms/2/text/advanced`, {
      method: "POST",
      headers: {
        Authorization: `App ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            destinations: [{ to }],
            ...(from ? { from } : {}),
            text,
          },
        ],
      }),
    });

    const result = await response.json().catch(() => null);
    const providerMessage = result?.messages?.[0];
    const providerStatus = providerMessage?.status;
    const providerDetail = {
      from,
      to,
      messageId: providerMessage?.messageId,
      statusGroup: providerStatus?.groupName,
      statusName: providerStatus?.name,
      statusDescription: providerStatus?.description,
      raw: result,
    };

    if (response.ok) {
      console.log("✅ SMS accepted by Infobip:", providerDetail);
      return {
        success: true,
        accepted: true,
        delivered: providerStatus?.groupName === "DELIVERED",
        detail: providerDetail,
      };
    }

    console.error("❌ Infobip error:", providerDetail);
    return { success: false, error: providerDetail };
  } catch (error) {
    console.error("❌ Erreur envoi SMS:", error);
    return { success: false, error };
  }
}

export async function sendAdminAlertSMS(text: string) {
  const phone = await getAlertSmsPhone();

  if (!phone) {
    console.warn("[Notification] No admin alert phone configured, skipping alert SMS");
    return { success: false, reason: "Admin alert phone not configured" };
  }

  return sendSMS(phone, text);
}

// ============================================
// NOTIFY USER (Email + SMS + DB record)
// ============================================

interface NotifyOptions {
  recipientId: string;
  type: "ALERT" | "REMINDER" | "SYSTEM" | "MESSAGE";
  title: string;
  message: string;
  data?: Record<string, unknown>;
  channels?: ("IN_APP" | "EMAIL" | "SMS")[];
}

/**
 * Send a notification via the requested channels and persist it in the DB.
 */
export async function notifyUser(opts: NotifyOptions) {
  const channels = opts.channels || ["IN_APP", "EMAIL", "SMS"];
  const sentVia: NotificationChannel[] = [];

  // Fetch recipient info
  const user = await prisma.user.findUnique({
    where: { id: opts.recipientId },
    select: { email: true, phoneNumber: true, firstName: true, lastName: true },
  });

  if (!user) {
    console.error("[Notification] User not found:", opts.recipientId);
    return { success: false, error: "User not found" };
  }

  // --- EMAIL ---
  if (channels.includes("EMAIL") && user.email) {
    const html = buildEmailHtml(opts.title, opts.message, user.firstName);
    const result = await sendEmail(user.email, `[MediFollow] ${opts.title}`, html);
    if (result.success) sentVia.push("EMAIL");
  }

  // --- SMS ---
  if (channels.includes("SMS") && user.phoneNumber) {
    const text = `[MediFollow] ${opts.title}\n${opts.message}`;
    const result = await sendSMS(user.phoneNumber, text);
    if (result.success) sentVia.push("SMS");
  }

  // --- IN_APP (persist to DB) ---
  if (channels.includes("IN_APP")) {
    sentVia.push("IN_APP");
  }

  // Persist notification record
  try {
    await prisma.notification.create({
      data: {
        recipientId: opts.recipientId,
        type: opts.type,
        title: opts.title,
        message: opts.message,
        data: opts.data
          ? (JSON.parse(JSON.stringify(opts.data)) as Prisma.InputJsonValue)
          : undefined,
        sentVia,
      },
    });
  } catch (err) {
    console.error("[Notification] DB save error:", err);
  }

  return { success: true, sentVia };
}

// ============================================
// NOTIFY ALERT — convenience for critical alerts
// ============================================

/**
 * Sends an alert notification to all relevant users:
 * - The patient's assigned doctors
 * - Admin users
 * Channels: Email + SMS + In-App
 */
export async function notifyAlert(
  patientId: string,
  title: string,
  message: string,
  data?: Record<string, unknown>
) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      user: { select: { id: true, email: true, phoneNumber: true, firstName: true } },
      careTeam: {
        include: {
          user: { select: { id: true, email: true, phoneNumber: true, firstName: true } },
        },
      },
    },
  });

  if (!patient) return;

  const careTeamMembers: Array<{ user: { id: string } }> = Array.isArray((patient as any).careTeam)
    ? (patient as any).careTeam
    : [];

  const recipientIds = new Set<string>();

  // Notify the patient
  recipientIds.add(patient.user.id);

  // Notify doctors in care team
  for (const member of careTeamMembers) {
    recipientIds.add(member.user.id);
  }

  // Notify admins
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", isActive: true },
    select: { id: true },
  });
  for (const admin of admins) {
    recipientIds.add(admin.id);
  }

  // Send to all recipients in parallel
  const results = await Promise.allSettled(
    Array.from(recipientIds).map((recipientId) =>
      notifyUser({
        recipientId,
        type: "ALERT",
        title,
        message,
        data,
        channels: ["IN_APP", "EMAIL", "SMS"],
      })
    )
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  console.log(`[Notification] Alert sent to ${sent}/${recipientIds.size} recipients`);
}

// ============================================
// GET USER NOTIFICATIONS
// ============================================

export async function getUserNotifications(userId: string, unreadOnly = false) {
  const where: Record<string, unknown> = { recipientId: userId };
  if (unreadOnly) where.isRead = false;

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return { success: true, notifications };
}

export async function markNotificationRead(notificationId: string) {
  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true, readAt: new Date() },
  });
  return { success: true };
}

export async function markAllNotificationsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { recipientId: userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
  return { success: true };
}

// ============================================
// EMAIL TEMPLATE
// ============================================

function buildEmailHtml(title: string, message: string, firstName?: string | null) {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px;">
      <div style="background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 28px; font-weight: 800; color: #2563eb;">MediFollow</span>
        </div>
        <h2 style="color: #1e293b; font-size: 20px; margin-bottom: 8px;">
          ${escapeHtml(title)}
        </h2>
        ${firstName ? `<p style="color: #64748b; font-size: 14px;">Bonjour ${escapeHtml(firstName)},</p>` : ""}
        <div style="background: #f1f5f9; border-left: 4px solid #2563eb; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="color: #334155; font-size: 15px; margin: 0; line-height: 1.6;">
            ${escapeHtml(message)}
          </p>
        </div>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; text-align: center;">
          Ceci est un message automatique de la plateforme MediFollow.
        </p>
      </div>
    </div>
  `;
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ============================================
// WELCOME EMAIL (on signup)
// ============================================

export async function sendWelcomeEmail(email: string, firstName: string) {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px;">
      <div style="background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px; font-weight: 800; color: #2563eb;">❤️ MediFollow</span>
        </div>
        <h2 style="color: #1e293b; font-size: 22px; text-align: center; margin-bottom: 16px;">
          Bienvenue sur MediFollow !
        </h2>
        <p style="color: #64748b; font-size: 15px; line-height: 1.6;">
          Bonjour <strong>${escapeHtml(firstName)}</strong>,
        </p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
          Votre compte a été créé avec succès. Vous pouvez maintenant accéder à votre espace patient pour :
        </p>
        <ul style="color: #334155; font-size: 14px; line-height: 2;">
          <li>📊 Suivre vos signes vitaux</li>
          <li>📅 Gérer vos rendez-vous</li>
          <li>💬 Communiquer avec votre équipe médicale</li>
          <li>🔔 Recevoir des alertes personnalisées</li>
        </ul>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login"
             style="display: inline-block; background: #2563eb; color: #ffffff; font-weight: 700; font-size: 15px; padding: 12px 32px; border-radius: 8px; text-decoration: none;">
            Se connecter
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          Ceci est un message automatique de la plateforme MediFollow.<br/>
          Si vous n'avez pas créé ce compte, veuillez ignorer cet email.
        </p>
      </div>
    </div>
  `;

  return sendEmail(email, "Bienvenue sur MediFollow !", html);
}

// ============================================
// ADMIN SIGNUP NOTIFICATION
// ============================================

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "ojaouadi02@gmail.com";

export async function sendNewSignupNotification(firstName: string, lastName: string, email: string) {
  const now = new Date().toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
  const approvalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/admin/pending-patients`;
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px;">
      <div style="background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px; font-weight: 800; color: #2563eb;">MediFollow</span>
        </div>
        <h2 style="color: #1e293b; font-size: 20px; text-align: center; margin-bottom: 16px;">
          🆕 Nouvelle Inscription — Approbation requise
        </h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
          Un nouveau patient vient de créer un compte et attend votre approbation :
        </p>
        <div style="background: #f1f5f9; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 4px 0; color: #334155;"><strong>Nom :</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)}</p>
          <p style="margin: 4px 0; color: #334155;"><strong>Email :</strong> ${escapeHtml(email)}</p>
          <p style="margin: 4px 0; color: #334155;"><strong>Date :</strong> ${now}</p>
          <p style="margin: 4px 0; color: #f59e0b; font-weight: 600;">⏳ Statut : En attente d'approbation</p>
        </div>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${approvalUrl}"
             style="display: inline-block; background: #16a34a; color: #ffffff; font-weight: 700; font-size: 15px; padding: 12px 32px; border-radius: 8px; text-decoration: none;">
            Approuver / Refuser le patient
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          Notification automatique — MediFollow Admin
        </p>
      </div>
    </div>
  `;

  return sendEmail(ADMIN_EMAIL, `Nouvelle inscription : ${firstName} ${lastName}`, html);
}

// ============================================
// STAFF CREDENTIALS EMAIL (Doctor, Nurse, Coordinator)
// ============================================

const ROLE_LABELS: Record<string, string> = {
  DOCTOR: "Médecin",
  NURSE: "Infirmier(e)",
  COORDINATOR: "Coordinateur",
};

const ROLE_TITLES: Record<string, string> = {
  DOCTOR: "Dr.",
  NURSE: "",
  COORDINATOR: "",
};

export async function sendStaffCredentialsEmail(
  email: string,
  firstName: string,
  password: string,
  role: string
) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // For development/Windows SSL issues
      },
    });

    const roleLabel = ROLE_LABELS[role] || role;
    const titlePrefix = ROLE_TITLES[role] ? `${ROLE_TITLES[role]} ` : "";
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`;
    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px;">
        <div style="background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: 800; color: #2563eb;">❤️ MediFollow</span>
          </div>
          <h2 style="color: #1e293b; font-size: 22px; text-align: center; margin-bottom: 16px;">
            Bienvenue sur MediFollow, ${titlePrefix}${escapeHtml(firstName)} !
          </h2>
          <p style="color: #64748b; font-size: 15px; line-height: 1.6;">
            Bonjour <strong>${escapeHtml(firstName)}</strong>,
          </p>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            Un compte <strong>${escapeHtml(roleLabel)}</strong> a été créé pour vous sur la plateforme MediFollow. Voici vos identifiants de connexion :
          </p>
          <div style="background: #f1f5f9; border-left: 4px solid #2563eb; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 4px 0; color: #334155;"><strong>Email :</strong> ${escapeHtml(email)}</p>
            <p style="margin: 4px 0; color: #334155;"><strong>Mot de passe :</strong> ${escapeHtml(password)}</p>
          </div>
          <p style="color: #ef4444; font-size: 14px; line-height: 1.6; font-weight: 600;">
            ⚠️ Pour votre sécurité, veuillez changer votre mot de passe dès votre première connexion.
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${loginUrl}"
               style="display: inline-block; background: #2563eb; color: #ffffff; font-weight: 700; font-size: 15px; padding: 12px 32px; border-radius: 8px; text-decoration: none;">
              Se connecter
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            Ceci est un message automatique de la plateforme MediFollow.<br/>
            Si vous n'avez pas demandé ce compte, veuillez contacter l'administrateur.
          </p>
        </div>
      </div>
    `;

    const result = await transporter.sendMail({
      from: `"MediFollow" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Vos identifiants MediFollow",
      html,
    });

    console.log(`✅ Email identifiants envoyé à ${email}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Erreur envoi email identifiants:", error);
    return { success: false, error };
  }
}

// Backward compatibility alias
export const sendDoctorCredentialsEmail = (
  email: string,
  firstName: string,
  password: string
) => sendStaffCredentialsEmail(email, firstName, password, "DOCTOR");

// ============================================
// PATIENT APPROVAL EMAIL
// ============================================

export async function sendPatientApprovalEmail(email: string, firstName: string) {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`;
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px;">
      <div style="background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px; font-weight: 800; color: #2563eb;">❤️ MediFollow</span>
        </div>
        <h2 style="color: #16a34a; font-size: 22px; text-align: center; margin-bottom: 16px;">
          ✅ Compte Approuvé !
        </h2>
        <p style="color: #64748b; font-size: 15px; line-height: 1.6;">
          Bonjour <strong>${escapeHtml(firstName)}</strong>,
        </p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
          Bonne nouvelle ! Votre compte a été approuvé par un administrateur. Vous pouvez maintenant vous connecter et accéder à votre espace patient.
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${loginUrl}"
             style="display: inline-block; background: #16a34a; color: #ffffff; font-weight: 700; font-size: 15px; padding: 12px 32px; border-radius: 8px; text-decoration: none;">
            Se connecter
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          Ceci est un message automatique de la plateforme MediFollow.
        </p>
      </div>
    </div>
  `;

  return sendEmail(email, "Votre compte MediFollow a été approuvé !", html);
}

// ============================================
// PATIENT BANNED EMAIL
// ============================================

export async function sendPatientBannedEmail(email: string, firstName: string) {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px;">
      <div style="background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px; font-weight: 800; color: #2563eb;">❤️ MediFollow</span>
        </div>
        <h2 style="color: #ef4444; font-size: 22px; text-align: center; margin-bottom: 16px;">
          ❌ Compte Refusé
        </h2>
        <p style="color: #64748b; font-size: 15px; line-height: 1.6;">
          Bonjour <strong>${escapeHtml(firstName)}</strong>,
        </p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
          Nous sommes désolés, votre demande de compte sur MediFollow a été refusée par un administrateur. Si vous pensez qu'il s'agit d'une erreur, veuillez contacter l'administration de l'hôpital.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          Ceci est un message automatique de la plateforme MediFollow.
        </p>
      </div>
    </div>
  `;

  return sendEmail(email, "Votre demande de compte MediFollow a été refusée", html);
}
