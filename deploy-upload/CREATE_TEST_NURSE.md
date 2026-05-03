# 🏥 Test Nurse Account Setup Guide

This guide explains how to create a test nurse account for development and testing.

## 📋 What Gets Created

Running the test nurse creation script will:

✅ Create a **NURSE user account** with role `NURSE`  
✅ Create a **NurseProfile** with test data  
✅ Assign **5 random patients** to the nurse  
✅ Create **3 test alerts** with different statuses  
✅ Create **patient reminders** for each assigned patient

## 🚀 Quick Start

### Option 1: Using Node.js (Recommended)

```bash
# Navigate to project root
cd c:\Users\Raouf\Downloads\healthcare-main

# Run the test nurse creation script
node scripts/create-test-nurse.js
```

### Option 2: Using TypeScript

```bash
# If ts-node is available
npx ts-node scripts/create-test-nurse.ts
```

## 📝 Test Credentials

After running the script, use these credentials to login:

```
Email:    nurse@test.com
Password: TestNurse@2024
Role:     NURSE
```

## 🔐 Login Steps

1. Navigate to: `http://localhost:3000/login`
2. Enter email: `nurse@test.com`
3. Enter password: `TestNurse@2024`
4. Click "Connexion"
5. You'll be redirected to the Nurse Dashboard: `/dashboard/nurse`

## 📊 Dashboard Features to Test

Once logged in as the test nurse, you can:

### 👥 Patients

- **View assigned patients** - See list of 5 test patients
- **Patient vitals** - Check vital records
- **Assign to doctor** - Test patient assignment workflow
- **Alerts** - View patient alerts

### 🔔 Alerts Management

- **View open alerts** - See alerts with OPEN status
- **Acknowledge alerts** - Mark alerts as ACKNOWLEDGED
- **Resolve alerts** - Mark alerts as RESOLVED
- **Filter alerts** - By severity (CRITICAL, HIGH, MEDIUM, LOW)

### 📞 Reminders

- **View reminders** - See created patient reminders
- **Create reminders** - Send new reminders to patients
- **Send reminders** - Test reminder sending
- **Schedule reminders** - Set future reminder dates

## 🔄 Reset Test Data

To clean up and create a fresh test account:

```bash
# Delete current test account (if exists)
# Update the nursе email in the script

# Or manually delete via database:
# DELETE FROM user WHERE email = 'nurse@test.com';

# Then run the script again
node scripts/create-test-nurse.js
```

## 📊 Test Data Details

### Nurse Account

- **License Number**: INF2024001
- **Specialization**: Soins généraux (General Care)
- **Location**: Paris, France
- **Phone**: +33612345678

### Assigned Patients

- Automatically fetches 5 existing patients from database
- Creates reminders for each patient
- Establishes nurse-patient relationship

### Test Alerts

| Alert   | Severity | Status                              |
| ------- | -------- | ----------------------------------- |
| Alert 1 | MEDIUM   | OPEN (can be acknowledged/resolved) |
| Alert 2 | HIGH     | ACKNOWLEDGED (can be resolved)      |
| Alert 3 | CRITICAL | RESOLVED (read-only)                |

## ✅ Verification Checklist

After creating the test account:

- [ ] Account created successfully (check terminal output)
- [ ] Can login with credentials
- [ ] Redirected to `/dashboard/nurse`
- [ ] Can see patient list
- [ ] Can see alerts (at least 3)
- [ ] Can see reminders
- [ ] Can acknowledge alerts
- [ ] Can resolve alerts
- [ ] Can create new reminders
- [ ] Can assign patients to doctors

## 🐛 Troubleshooting

### Script fails with "Prisma client not found"

```bash
# Make sure prisma is installed
npm install @prisma/client
npm install bcryptjs
```

### Email already exists error

The test account already exists. Either:

1. Use a different email (edit the script)
2. Delete the existing account from database
3. Try logging in with existing credentials

### No patients found

- Make sure you have created at least 5 patients in the database first
- Run user seeding scripts before running test nurse script

## 📞 Support

For issues or questions:

1. Check terminal output for error messages
2. Verify database connection
3. Ensure `.env` file is properly configured
4. Check Prisma schema matches database

---

**Note**: This test account is for development only. In production, use proper user management and authentication flows.
