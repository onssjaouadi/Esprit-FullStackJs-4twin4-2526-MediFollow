const nodemailer = require("nodemailer");
require("dotenv").config();

async function testEmailConfig() {
  console.log("🧪 Testing Email Configuration...\n");

  const config = {
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
  };

  console.log("📧 Configuration:");
  console.log(`  Host: ${config.host}`);
  console.log(`  Port: ${config.port}`);
  console.log(`  Secure: ${config.secure}`);
  console.log(`  User: ${config.auth.user}`);
  console.log(`  Pass: ${config.auth.pass ? "✓ Configured" : "✗ Missing"}`);

  if (!config.auth.user || !config.auth.pass) {
    console.log("\n❌ ERROR: SMTP_USER or SMTP_PASS is missing in .env file!");
    process.exit(1);
  }

  const transporter = nodemailer.createTransport(config);

  try {
    console.log("\n⏳ Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP connection successful!");

    console.log("\n⏳ Sending test email...");
    const result = await transporter.sendMail({
      from: `"MediFollow Test" <${config.auth.user}>`,
      to: config.auth.user,
      subject: "MediFollow Email Test",
      html: `
        <h2>✅ Email Configuration Test</h2>
        <p>If you received this email, SMTP is working correctly!</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      `,
    });

    console.log("✅ Test email sent successfully!");
    console.log(`   Message ID: ${result.messageId}`);
  } catch (error) {
    console.log("\n❌ ERROR:");
    console.log(error.message);
    if (error.code === "ECONNREFUSED") {
      console.log("\n💡 Hint: Connection refused. Check your internet or firewall.");
    }
    if (error.code === "EDNS") {
      console.log("\n💡 Hint: DNS error. Check SMTP_HOST value.");
    }
    if (error.response && error.response.includes("Invalid")) {
      console.log("\n💡 Hint: Invalid credentials. Check SMTP_USER and SMTP_PASS.");
    }
    process.exit(1);
  }
}

testEmailConfig();
