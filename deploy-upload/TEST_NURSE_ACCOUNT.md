# 🏥 Test Nurse Account - Quick Reference

## ✅ Account Successfully Created!

### 🔐 Login Credentials

```
Email:    nurse@test.com
Password: TestNurse@2024
Role:     NURSE
```

### 🔗 Access Links

| Resource      | URL                                             |
| ------------- | ----------------------------------------------- |
| **Login**     | http://localhost:3000/login                     |
| **Dashboard** | http://localhost:3000/dashboard/nurse           |
| **Patients**  | http://localhost:3000/dashboard/nurse/patients  |
| **Alerts**    | http://localhost:3000/dashboard/nurse/alerts    |
| **Reminders** | http://localhost:3000/dashboard/nurse/reminders |

---

## 👥 Assigned Patients

The test nurse has 5 assigned patients:

1. **Jean Martin** - Patient ID: 69d5e5c5f3dd49a82bfccc5d
2. **Sophie Bernard** - Patient ID: 69d5e5c5f3dd49a82bfccc5e
3. **Pierre Dubois** - Patient ID: 69d5e5c5f3dd49a82bfccc5f
4. **Jean Dupont** - Patient ID: 69d5e5c5f3dd49a82bfccc60
5. **Marie Martin** - Patient ID: 69d5e5c5f3dd49a82bfccc61

---

## 🏥 Nurse Profile Information

```
Name:           Infirmière Test
License:        INF2024001
Specialization: Soins généraux (General Care)
Phone:          +33612345678
Location:       Paris, France
Account ID:     69d6f979f166f41e3e3bc5ab
Created:        09/04/2026 2:57:29
Status:         Active ✓
```

---

## 📊 Test Data Available

### Alerts

- ✅ **X alerts** created for assigned patients
- 🔴 Different severity levels (MEDIUM, HIGH, CRITICAL)
- 📈 Multiple alert statuses (OPEN, ACKNOWLEDGED, RESOLVED)

### Reminders

- ✅ **5 patient assignments** via reminders
- 📅 Scheduled for immediate follow-up
- ✉️ Ready to be sent to patients

### Patient Data

- ✅ Vitals can be entered
- ✅ Alerts can be viewed/managed
- ✅ Reminders can be created
- ✅ Doctor assignments possible

---

## 🧪 Testing Scenarios

### Test 1: Login

1. Go to http://localhost:3000/login
2. Enter email: `nurse@test.com`
3. Enter password: `TestNurse@2024`
4. Expected: Redirected to `/dashboard/nurse`

### Test 2: View Patients

1. Navigate to `/dashboard/nurse/patients`
2. Expected: See list of 5 assigned patients
3. Try: Search by patient name or medical record

### Test 3: Manage Alerts

1. Navigate to `/dashboard/nurse/alerts`
2. Expected: See active alerts
3. Try: Acknowledge and resolve alerts
4. Try: Filter by severity and status

### Test 4: Create Reminders

1. Navigate to `/dashboard/nurse/reminders`
2. Click "Nouveau rappel" (New Reminder)
3. Select a patient, enter details, set reminder time
4. Try: Send the reminder

### Test 5: Assign Patient to Doctor

1. Navigate to `/dashboard/nurse/patients`
2. Click the "Affecter" (Assign) button on a patient
3. Select a doctor from dropdown
4. Click "Affecter" to complete assignment

---

## 🔄 Script Commands

### Create New Account

```bash
node scripts/create-test-nurse.js
```

### Verify Existing Account

```bash
node scripts/verify-test-nurse.js
```

### Reset/Recreate Account

```bash
node scripts/reset-test-nurse.js
```

---

## 🛠️ Troubleshooting

### Issue: Can't login

- **Solution**: Verify credentials are exactly as shown above
- **Check**: Ensure user is Active in database

### Issue: No patients assigned

- **Solution**: Run `node scripts/reset-test-nurse.js` to recreate
- **Check**: Verify patients exist in database first

### Issue: Alerts not showing

- **Solution**: Reload page or clear browser cache
- **Check**: View browser console for errors

### Issue: Can't send reminders

- **Solution**: Ensure patients are properly assigned
- **Check**: Verify notification system is configured

---

## 📚 Related Documentation

- [Nurse Space Documentation](../app/dashboard/nurse/)
- [API Routes](../app/api/)
- [Database Schema](../prisma/schema.prisma)
- [Authentication Flow](../lib/actions/auth.actions.ts)

---

## 📞 Support

For issues or questions:

1. Check terminal output for errors
2. Review database connection
3. Verify Prisma client is up-to-date
4. Check `.env` file configuration

**Created**: 09/04/2026  
**Status**: ✅ Active and Ready for Testing  
**Duration**: Test account available indefinitely
