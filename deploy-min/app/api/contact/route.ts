import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/azure-email";

/**
 * POST /api/contact
 * Handles contact form submissions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        {
          success: false,
          error: "Tous les champs obligatoires doivent être remplis",
        },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Adresse email invalide" },
        { status: 400 }
      );
    }

    // Prepare email content for admin
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f7f9fc;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
              color: #ffffff;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: bold;
            }
            .content {
              padding: 30px;
            }
            .info-block {
              background-color: #f8fafc;
              border-left: 4px solid #2563eb;
              padding: 15px;
              margin: 15px 0;
              border-radius: 6px;
            }
            .info-label {
              font-weight: bold;
              color: #1e40af;
              margin-bottom: 5px;
            }
            .info-value {
              color: #334155;
              font-size: 15px;
            }
            .message-box {
              background-color: #f1f5f9;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              border: 1px solid #e2e8f0;
            }
            .footer {
              background-color: #f8fafc;
              color: #64748b;
              text-align: center;
              padding: 20px;
              font-size: 14px;
              border-top: 1px solid #e2e8f0;
            }
            .badge {
              display: inline-block;
              background-color: #dcfce7;
              color: #166534;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📩 Nouveau message de contact - MediFollow</h1>
              <div class="badge">Nouveau message reçu</div>
            </div>
            
            <div class="content">
              <p style="font-size: 16px; color: #475569; margin-bottom: 20px;">
                Vous avez reçu un nouveau message depuis le formulaire de contact du site MediFollow.
              </p>

              <div class="info-block">
                <div class="info-label">👤 Nom complet</div>
                <div class="info-value">${name}</div>
              </div>

              <div class="info-block">
                <div class="info-label">📧 Adresse email</div>
                <div class="info-value"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></div>
              </div>

              ${
                phone
                  ? `
              <div class="info-block">
                <div class="info-label">📱 Téléphone</div>
                <div class="info-value"><a href="tel:${phone}" style="color: #2563eb; text-decoration: none;">${phone}</a></div>
              </div>
              `
                  : ""
              }

              <div class="info-block">
                <div class="info-label">📋 Sujet</div>
                <div class="info-value">${subject}</div>
              </div>

              <div class="message-box">
                <div class="info-label" style="margin-bottom: 10px;">💬 Message</div>
                <div class="info-value" style="white-space: pre-wrap;">${message}</div>
              </div>

              <p style="font-size: 14px; color: #64748b; margin-top: 20px;">
                ⏰ Reçu le ${new Date().toLocaleDateString("fr-FR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">
                <strong>MediFollow</strong> - Plateforme de suivi médical post-hospitalisation<br>
                68 Avenue de la Technologie, Aryanah, Ariana 2088, Tunisie
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Prepare confirmation email for user
    const userConfirmationHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f7f9fc;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
              color: #ffffff;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: bold;
            }
            .content {
              padding: 30px;
            }
            .success-icon {
              text-align: center;
              font-size: 60px;
              margin: 20px 0;
            }
            .highlight-box {
              background-color: #f0fdf4;
              border-left: 4px solid #22c55e;
              padding: 15px;
              margin: 20px 0;
              border-radius: 6px;
            }
            .footer {
              background-color: #f8fafc;
              color: #64748b;
              text-align: center;
              padding: 20px;
              font-size: 14px;
              border-top: 1px solid #e2e8f0;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
              color: #ffffff;
              text-decoration: none;
              padding: 12px 30px;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Message bien reçu !</h1>
            </div>
            
            <div class="content">
              <div class="success-icon">✉️</div>
              
              <p style="font-size: 18px; color: #1e293b; font-weight: 600; text-align: center;">
                Bonjour ${name},
              </p>

              <p style="font-size: 16px; color: #475569;">
                Nous avons bien reçu votre message concernant : <strong>${subject}</strong>
              </p>

              <div class="highlight-box">
                <p style="margin: 0; color: #15803d;">
                  ✓ Notre équipe a été notifiée et vous répondra dans les plus brefs délais.<br>
                  ✓ Vous recevrez une réponse à l'adresse : <strong>${email}</strong><br>
                  ✓ Délai de réponse habituel : 24-48 heures
                </p>
              </div>

              <p style="font-size: 15px; color: #64748b;">
                En attendant notre réponse, n'hésitez pas à consulter notre plateforme :
              </p>

              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}" class="button">
                  Visiter MediFollow
                </a>
              </div>

              <p style="font-size: 14px; color: #94a3b8; font-style: italic;">
                Si vous n'avez pas envoyé ce message, veuillez ignorer cet email.
              </p>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">
                <strong>MediFollow</strong><br>
                📧 contact@medifollow.com | 📞 +33 1 23 45 67 89<br>
                68 Avenue de la Technologie, Aryanah, Ariana 2088, Tunisie
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email to admin (walaeddine1207@gmail.com)
    const adminEmailResult = await sendEmail({
      to: "walaeddine1207@gmail.com",
      subject: `[MediFollow Contact] ${subject} - De ${name}`,
      html: adminEmailHtml,
      text: `
Nouveau message de contact MediFollow

Nom: ${name}
Email: ${email}
${phone ? `Téléphone: ${phone}` : ""}
Sujet: ${subject}

Message:
${message}

Reçu le ${new Date().toLocaleString("fr-FR")}
      `.trim(),
    });

    if (!adminEmailResult.success) {
      console.error("❌ Erreur envoi email admin:", adminEmailResult.error);
      return NextResponse.json(
        {
          success: false,
          error: "Erreur lors de l'envoi du message. Veuillez réessayer.",
        },
        { status: 500 }
      );
    }

    // Send confirmation email to user
    try {
      await sendEmail({
        to: email,
        subject: "✅ Message bien reçu - MediFollow",
        html: userConfirmationHtml,
        text: `
Bonjour ${name},

Nous avons bien reçu votre message concernant : ${subject}

Notre équipe a été notifiée et vous répondra dans les plus brefs délais (24-48 heures).

Cordialement,
L'équipe MediFollow

---
MediFollow
contact@medifollow.com
68 Avenue de la Technologie, Aryanah, Ariana 2088, Tunisie
        `.trim(),
      });
    } catch (confirmError) {
      // Log error but don't fail the request
      console.warn("⚠️ Confirmation email failed:", confirmError);
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Votre message a été envoyé avec succès. Nous vous répondrons rapidement !",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Erreur API contact:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Une erreur est survenue. Veuillez réessayer plus tard.",
      },
      { status: 500 }
    );
  }
}
