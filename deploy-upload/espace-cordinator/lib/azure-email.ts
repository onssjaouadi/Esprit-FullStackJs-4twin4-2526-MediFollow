/**
 * MediFollow - Email Utility
 * Handles email sending via Gmail SMTP (nodemailer)
 */

import nodemailer from "nodemailer";

// Gmail SMTP configuration
const gmailEmail = process.env.GMAIL_EMAIL!;
const gmailPassword = process.env.GMAIL_PASSWORD!;

/**
 * Create nodemailer transporter for Gmail
 */
const createTransporter = () => {
  if (!gmailEmail || !gmailPassword) {
    throw new Error(
      "Gmail configuration is missing in .env (GMAIL_EMAIL, GMAIL_PASSWORD)"
    );
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: gmailEmail,
      pass: gmailPassword,
    },
  });
};

/**
 * Send email using Gmail SMTP
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = createTransporter();

    console.log(`📤 Envoi d'email via Gmail SMTP à ${to}...`);

    const info = await transporter.sendMail({
      from: `"MediFollow" <${gmailEmail}>`,
      to,
      subject,
      text: text || subject,
      html,
    });

    console.log(`✅ Email envoyé! Message ID: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error("❌ Gmail SMTP error:", {
      message: error.message,
      code: error.code,
      command: error.command,
    });
    return {
      success: false,
      error: error.message || "Failed to send email",
    };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail({
  email,
  firstName,
  resetToken,
}: {
  email: string;
  firstName: string;
  resetToken: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${resetToken}`;

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation du mot de passe - MediFollow</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px; text-align: center;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                🏥 MediFollow
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                Plateforme de suivi post-hospitalisation
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: 600;">
                Réinitialisation de votre mot de passe
              </h2>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>${firstName}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte MediFollow. 
                Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
              </p>

              <!-- Reset Button -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${resetUrl}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                      Réinitialiser mon mot de passe
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Security Info -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 6px; margin: 30px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                  <strong>⚠️ Important :</strong> Ce lien expire dans 1 heure pour des raisons de sécurité.
                </p>
              </div>

              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
              </p>
              
              <p style="margin: 0 0 20px; padding: 12px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; color: #3b82f6; font-size: 13px; word-break: break-all;">
                ${resetUrl}
              </p>

              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
                <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                  <strong>Vous n'avez pas demandé cette réinitialisation ?</strong><br>
                  Ignorez simplement cet email. Votre mot de passe restera inchangé et votre compte est sécurisé.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 13px;">
                © 2026 MediFollow. Tous droits réservés.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Plateforme de surveillance post-hospitalisation à distance
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Bonjour ${firstName},

Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte MediFollow.

Pour réinitialiser votre mot de passe, cliquez sur le lien ci-dessous :
${resetUrl}

Ce lien expire dans 1 heure pour des raisons de sécurité.

Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email. Votre mot de passe restera inchangé.

Cordialement,
L'équipe MediFollow
  `;

  return sendEmail({
    to: email,
    subject: "Réinitialisation de votre mot de passe - MediFollow",
    html,
    text,
  });
}
