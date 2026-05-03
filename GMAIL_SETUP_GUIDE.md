# Gmail SMTP Configuration Guide for MediFollow

This guide explains how to configure Gmail SMTP for sending credentials emails to users (doctors, nurses, coordinators).

## 🔐 Step 1: Create a Gmail Account (or use existing)

If you don't have a Gmail account, create one at [https://accounts.google.com/signup](https://accounts.google.com/signup)

For this guide, we'll use: `your-email@gmail.com`

## 🔒 Step 2: Enable 2-Step Verification

Gmail requires 2-Step Verification to create app passwords:

1. Go to [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. In the left navigation menu, click **Security**
3. Scroll down to 2-Step Verification and click **Get Started**
4. Follow the prompts to enable 2-Step Verification (you'll verify with your phone)

## 🔑 Step 3: Generate Gmail App Password

After enabling 2-Step Verification:

1. Go back to [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Scroll down to find **App passwords** (only visible after 2FA is enabled)
3. Select:
   - App: **Mail**
   - Device: **Windows Computer** (or your device type)
4. Click **Generate**
5. Google will show you a 16-character password. **Copy this password** (don't share it!)

Example app password: `abcd efgh ijkl mnop`

## 📝 Step 4: Configure `.env` File

Add these environment variables to your `.env` file in the root directory:

```bash
# Gmail SMTP Configuration
GMAIL_EMAIL=your-email@gmail.com
GMAIL_PASSWORD=abcdefulghijklmnop
```

**Important Notes:**

- Use your **Gmail app password** (from Step 3), NOT your regular Gmail password
- The app password has spaces - you can include them as-is or remove them
- Keep these credentials secure and never commit them to version control

## 🧪 Step 5: Test Gmail Configuration

Run the test script to verify Gmail SMTP is working:

```bash
node test-gmail-smtp.js
```

Expected output:

```
🧪 Testing Gmail SMTP Configuration...

✅ Configuration found:
  Email: your-email@gmail.com
  Password: **************** (hidden)

🔧 Creating Gmail SMTP transporter...
✅ Transporter created

📤 Sending test email to walaeddine1207@gmail.com...
✅ Test email sent successfully!
```

## 📧 Step 6: Create a User with Gmail Enabled

Now when you create a new user from the admin panel:

1. Go to **Admin Dashboard** → **Users**
2. Click **Add User**
3. Fill in the form and click **Create User**
4. The system will:
   - ✅ Create the user in database
   - ✅ Send credentials email via Gmail SMTP to the user's email address

Check your Gmail sent folder to verify emails are working.

## 🔄 Fallback Email Methods

The system uses this priority order for sending emails:

1. **Gmail SMTP** (primary) - Uses `GMAIL_EMAIL` and `GMAIL_PASSWORD`
2. **Generic SMTP** - Uses `SMTP_USER`, `SMTP_PASS`, `SMTP_HOST`, `SMTP_PORT`
3. **Resend API** (cloud email service) - Uses `RESEND_API_KEY`

If Gmail is configured, it will be used automatically. Otherwise, it falls back to the others.

## ⚠️ Troubleshooting

### Issue: "User credentials email failed"

**Check 1: Gmail Password is Correct**

- Verify you're using the 16-character **app password**, not your regular Gmail password
- Check for typos in `.env` file
- Spaces in the app password are handled automatically

**Check 2: 2-Step Verification Enabled**

- Go to [https://myaccount.google.com/security](https://myaccount.google.com/security)
- Verify 2-Step Verification shows as "On"

**Check 3: App Password Created**

- Go to [https://myaccount.google.com/security](https://myaccount.google.com/security)
- Verify "App passwords" is available in the menu
- If not visible, 2-Step Verification is not enabled

**Check 4: Less Secure Apps (if on older Gmail)**

- If using an older Gmail account, you might need to allow "Less secure apps":
  - Go to [https://myaccount.google.com/security](https://myaccount.google.com/security)
  - Look for "Less secure app access" and toggle it **On**

### Issue: "Connection timeout" or "550 5.7.1 Invalid credentials"

- Test the configuration: `node test-gmail-smtp.js`
- Check that GMAIL_EMAIL and GMAIL_PASSWORD are exactly correct
- If using copy-paste, ensure no extra spaces

### Issue: Email not arriving

- Check the recipient's email spam folder
- Verify the recipient email address is correct
- Check server logs: `console.log` shows which method was used (Gmail, Resend, etc.)
- Ensure recipient email is not being filtered by their email provider

## 🚀 Advanced: Using a Business Gmail / Google Workspace

If using Google Workspace (business email):

1. Enable 2-Step Verification on your Google Workspace account
2. Generate an app password (same process as personal Gmail)
3. Use the same configuration in `.env`:

```bash
GMAIL_EMAIL=your-email@yourcompany.com
GMAIL_PASSWORD=your-app-password
```

## 📚 Resources

- [Google Account Security](https://myaccount.google.com/security)
- [App passwords for Gmail](https://support.google.com/accounts/answer/185833)
- [Nodemailer Gmail Documentation](https://nodemailer.com/smtp/gmail/)
- [Enable 2-Step Verification](https://support.google.com/accounts/answer/185839)

## ✅ Configuration Checklist

- [ ] Gmail account created and accessible
- [ ] 2-Step Verification enabled on Gmail account
- [ ] App password generated (16 characters)
- [ ] `.env` file updated with `GMAIL_EMAIL` and `GMAIL_PASSWORD`
- [ ] Test script passes: `node test-gmail-smtp.js`
- [ ] Test user created and credentials email received
- [ ] Email appears in Gmail sent folder
