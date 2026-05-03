/**
 * Test Gmail SMTP email configuration
 * Run with: node test-gmail-smtp.js
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

async function testGmailEmail() {
  console.log('🧪 Testing Gmail SMTP Configuration...\n');

  const gmailEmail = process.env.GMAIL_EMAIL;
  const gmailPassword = process.env.GMAIL_PASSWORD;

  if (!gmailEmail || !gmailPassword) {
    console.error('❌ Missing Gmail configuration in .env');
    console.log('Required:');
    console.log('  - GMAIL_EMAIL');
    console.log('  - GMAIL_PASSWORD (app password, not regular password)');
    console.log('\n💡 To generate Gmail app password:');
    console.log('  1. Go to https://myaccount.google.com/security');
    console.log('  2. Enable 2-Step Verification');
    console.log('  3. Go to App Passwords and create one for "Mail"');
    return;
  }

  console.log('✅ Configuration found:');
  console.log(`  Email: ${gmailEmail}`);
  console.log(`  Password: ${'*'.repeat(gmailPassword.length)} (hidden)\n`);

  const testEmail = 'walaeddine1207@gmail.com'; // Change to your test email

  try {
    console.log('🔧 Creating Gmail SMTP transporter...');
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: gmailEmail,
        pass: gmailPassword,
      },
    });

    console.log('✅ Transporter created\n');

    console.log(`📤 Sending test email to ${testEmail}...`);
    const startTime = Date.now();

    const info = await transporter.sendMail({
      from: `"MediFollow Test" <${gmailEmail}>`,
      to: testEmail,
      subject: 'Test MediFollow - Gmail SMTP',
      text: 'This is a test email from MediFollow to verify Gmail SMTP is working correctly.',
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>🧪 Test Email - MediFollow</h2>
            <p>This is a test email to verify <strong>Gmail SMTP</strong> is working correctly.</p>
            <p>If you receive this, the email service is operational! ✅</p>
            <hr>
            <p style="color: #666; font-size: 12px;">Sent at: ${new Date().toLocaleString()}</p>
            <p style="color: #666; font-size: 12px;">From: ${gmailEmail}</p>
          </body>
        </html>
      `,
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n✅ Email sent successfully!`);
    console.log(`  Message ID: ${info.messageId}`);
    console.log(`  Response: ${info.response}`);
    console.log(`  Duration: ${duration}s\n`);

    console.log('📝 Next steps:');
    console.log('  1. Check your inbox (and spam folder) at', testEmail);
    console.log('  2. If received, Gmail SMTP is working perfectly!');
    console.log('  3. Email should arrive in seconds (not minutes)\n');

  } catch (error) {
    const duration = Date.now() - (Date.now() - 0);
    
    console.error(`\n❌ Email send failed`);
    console.error(`Error: ${error.message}`);
    
    if (error.code === 'EAUTH') {
      console.log('\n⚠️  Authentication error!');
      console.log('Possible causes:');
      console.log('  1. Wrong email or password');
      console.log('  2. Not using an App Password (required if 2FA enabled)');
      console.log('  3. "Less secure app access" disabled (not recommended)');
      console.log('\n💡 Solution: Generate an App Password:');
      console.log('  1. Go to https://myaccount.google.com/apppasswords');
      console.log('  2. Select "Mail" and your device');
      console.log('  3. Copy the 16-character password');
      console.log('  4. Use it in GMAIL_PASSWORD (with spaces: "xxxx xxxx xxxx xxxx")\n');
    } else if (error.code === 'ESOCKET' || error.code === 'ETIMEDOUT') {
      console.log('\n⚠️  Network/Connection error!');
      console.log('Possible causes:');
      console.log('  1. Firewall blocking port 587');
      console.log('  2. Internet connection issues');
      console.log('  3. Gmail SMTP temporarily unavailable\n');
    } else {
      console.log('\nError details:', {
        code: error.code,
        command: error.command,
        message: error.message
      });
    }
  }
}

testGmailEmail().catch(console.error);
