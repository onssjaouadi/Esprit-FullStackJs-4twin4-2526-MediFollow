/**
 * Test Azure Communication Services email
 * Run with: node test-azure-email.js
 */

require("dotenv").config();
const { EmailClient } = require("@azure/communication-email");

async function testAzureEmail() {
  console.log("🧪 Testing Azure Communication Services...\n");

  const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING;
  const senderAddress = process.env.AZURE_COMMUNICATION_EMAIL_FROM;

  if (!connectionString || !senderAddress) {
    console.error("❌ Missing Azure configuration in .env");
    console.log("Required:");
    console.log("  - AZURE_COMMUNICATION_CONNECTION_STRING");
    console.log("  - AZURE_COMMUNICATION_EMAIL_FROM");
    return;
  }

  console.log("✅ Configuration found:");
  console.log(`  Sender: ${senderAddress}`);
  console.log(`  Endpoint: ${connectionString.split(";")[0]}\n`);

  const testEmail = "walaeddine1207@gmail.com"; // Change to your test email

  try {
    console.log(`📤 Sending test email to ${testEmail}...`);
    const startTime = Date.now();

    const emailClient = new EmailClient(connectionString);

    const emailMessage = {
      senderAddress,
      content: {
        subject: "Test MediFollow - Azure Email",
        plainText:
          "This is a test email from MediFollow to verify Azure Communication Services.",
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>🧪 Test Email - MediFollow</h2>
              <p>This is a test email to verify Azure Communication Services is working correctly.</p>
              <p>If you receive this, the email service is operational!</p>
              <hr>
              <p style="color: #666; font-size: 12px;">Sent at: ${new Date().toLocaleString()}</p>
            </body>
          </html>
        `,
      },
      recipients: {
        to: [{ address: testEmail }],
      },
    };

    console.log("⏳ Initiating send...");
    const poller = await emailClient.beginSend(emailMessage);

    console.log("⏳ Polling for completion (max 30s)...");

    // Add timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout after 30 seconds")), 30000)
    );

    const result = await Promise.race([poller.pollUntilDone(), timeoutPromise]);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n✅ Email sent successfully!`);
    console.log(`  Message ID: ${result.id}`);
    console.log(`  Status: ${result.status}`);
    console.log(`  Duration: ${duration}s\n`);

    console.log("📝 Next steps:");
    console.log("  1. Check your inbox (and spam folder)");
    console.log("  2. If email takes >30s, Azure may be slow or misconfigured");
    console.log(
      "  3. Verify sender domain is properly set up in Azure portal\n"
    );
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.error(`\n❌ Email send failed after ${duration}s`);
    console.error(`Error: ${error.message}`);

    if (
      error.message.includes("timeout") ||
      error.message.includes("Timeout")
    ) {
      console.log("\n⚠️  Timeout detected!");
      console.log("Possible causes:");
      console.log("  1. Azure Communication Services is slow or having issues");
      console.log("  2. Network connectivity problems");
      console.log("  3. Sender domain not verified in Azure portal");
      console.log("  4. Region/endpoint mismatch\n");
      console.log(
        "💡 Recommendation: Check Azure portal or use alternative email service (e.g., SendGrid, Resend)"
      );
    } else {
      console.log("\nError details:", {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
      });
    }
  }
}

testAzureEmail().catch(console.error);
