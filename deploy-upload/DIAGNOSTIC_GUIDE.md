# 🔍 Patient Assignment & Visibility Diagnostic Guide

## Quick Start

### 1. **Run the Diagnostic Page**

Navigate to: **http://localhost:3000/dashboard/doctor/diagnostic**

- Click **"Run Diagnostic"** button
- Wait for results to load
- Check all indicators (should show ✅)

---

## Step-by-Step Workflow Testing

### Phase 1: Setup Test Data

**Test Accounts:**

- **Nurse**: `nurse@test.com` / `TestNurse@2024`
- **Doctor**: `walaeddine1207@gmail.com` / (check password or reset)
- **Patient**: Create one or use existing

**Steps:**

1. Login as **Nurse**
2. Navigate to **Dashboard → Patients**
3. Select a patient and click **"Affecter au médecin"**
4. Choose a doctor from dropdown
5. Click **"Confirmer l'affectation"**

**Expected Output:**

- Green success message: "Patient affecté au médecin avec succès"
- Patient should disappear from list or mark as assigned

---

### Phase 2: Check Console Logs

**Open Browser DevTools** (F12) → Go to **Console** tab

Look for logs starting with:

- 📋 `[ASSIGN] Starting assignment:`
- ✅ `[ASSIGN] AccessGrant created/updated:`

If assignment worked, you'll see:

```
📋 [ASSIGN] Starting assignment: {patientId: "...", doctorId: "...", nurseId: "..."}
👥 [ASSIGN] Patient found: id email@example.com
👨‍⚕️ [ASSIGN] Doctor found: id doctor@example.com role: DOCTOR
🔗 [ASSIGN] Creating AccessGrant for: {patientUserId: "...", doctorId: "..."}
✅ [ASSIGN] AccessGrant created/updated: {id, patientId, doctorId, isActive, expiresAt}
```

---

### Phase 3: Run Diagnostic as Doctor

1. **Logout** from nurse account
2. **Login** as doctor (`walaeddine1207@gmail.com`)
3. Navigate to **Diagnostic Page**: http://localhost:3000/dashboard/doctor/diagnostic
4. Click **"Run Diagnostic"**

**Expected Results:**

```
DEBUG INFORMATION
🔧 Raw JSON with session and database user info

SESSION USER ✅
ID: (doctor's user ID)
Email: walaeddine1207@gmail.com
Role: DOCTOR
Name: Doctor Name

DATABASE USER ✅
ID: (matches session user ID)
Email: walaeddine1207@gmail.com
Role: DOCTOR
Name: Doctor Name

DOCTOR INFORMATION ✅
Name: Doctor Name
Email: walaeddine1207@gmail.com
ID: (doctor ID)
Role: DOCTOR

SPECIALTY 🏥
(Should show specialty or empty)

ACCESS GRANTS 🔗
Should show at least 1 if patient was assigned
- Patient User ID: (patient's user ID)
- Active: ✅ Yes
- Granted At: (timestamp)
- Expires At: (future date)

PATIENTS FOUND 👥
Should show at least 1 patient
- Name: Patient Name
- Email: patient@example.com
- Patient ID: (ID)
- User ID: (must match AccessGrant patientId)

SUMMARY 📋
✅ AccessGrants count: 1+
✅ Patients found: 1+
✅ Status: OK - Patients should be visible
```

---

## Troubleshooting Guide

### ❌ Session User is NULL

**Error Message:** "Not authenticated"

**Causes:**

- Not logged in
- Session expired
- Cookie not being sent

**Fix:**

1. Clear browser cookies (DevTools → Application → Cookies → Delete all)
2. Login again
3. Try diagnostic again

---

### ❌ Doctor Not Found

**Error Message:** "Doctor not found" in Doctor Info section

**Possible Causes:**

- User ID in session doesn't exist in database
- User was deleted from database
- Role mismatch

**Debug Steps:**

1. Check browser DevTools → Application → Cookies
2. Find `accessToken` cookie value
3. Decode it (use jwt.io if needed)
4. Verify `userId` matches session info
5. Check if user exists in database

**Database Check:**

```javascript
// Run in MongoDB Compass or your DB tool
db.users.findOne({ email: "walaeddine1207@gmail.com" });
```

Should return doctor record with `role: "DOCTOR"`

---

### ❌ No AccessGrants Found

**Error Message:** "No AccessGrants found for this doctor"

**Possible Causes:**

1. Patient assignment failed silently
2. AccessGrant wasn't created in database
3. Doctor ID in AccessGrant doesn't match current doctor

**Debug Steps:**

**A. Verify Assignment Succeeded:**

1. Check browser console during assignment (F12 → Console)
2. Look for ✅ `[ASSIGN] AccessGrant created/updated`
3. If not there, assignment failed

**B. Check Database Directly:**

```javascript
// Check if AccessGrants exist for this doctor
db.accessgrants.find({ doctorId: "doctor-user-id" })

// Should return array with entries like:
[{
  _id: ObjectId(...),
  patientId: "patient-user-id",
  doctorId: "doctor-user-id",
  isActive: true,
  expiresAt: Date(...),
  grantedAt: Date(...)
}]
```

**C. If AccessGrants Table is Empty:**

1. Go back to nurse dashboard
2. Assign a patient again
3. Watch console for logs
4. If error occurs, check error message
5. Run diagnostic again

---

### ❌ AccessGrants Exist But No Patients Found

**Error Message:** "UserID mismatch" or "0 patients found"

**Root Cause:** Database query is searching wrong field

**Check These Fields Match:**

1. `AccessGrant.patientId` (should be User.id)
2. `Patient.userId` (should be User.id)

**Debug Query:**

```javascript
// In MongoDB:

// Step 1: Get AccessGrants
db.accessgrants.findOne({
  doctorId: "doctor-id",
});
// Note the patientId value (should be a User.id)

// Step 2: Verify that User exists
db.users.findOne({
  _id: ObjectId("patientId-from-above"),
});
// Should return user record

// Step 3: Check Patient has correct userId
db.patients.findOne({
  userId: "patientId-from-above",
});
// Should return patient record
```

---

### ⚠️ Patients Still Not Showing in Doctor Dashboard

Even if diagnostic shows patients, they might not appear in main dashboard.

**File to Check:** `app/dashboard/doctor/page.tsx`

**Functions to Verify:**

1. `getPatientsByDoctorSpecialty()` - Added logging ✅
2. `getPatientsByDoctorSpecialtyWithAllVitals()` - Added logging ✅
3. `getDashboardStatsByDoctorSpecialty()` - Added logging ✅

**Check Server Logs:**

1. Look at your Next.js console output
2. Search for logs starting with:
   - 🔍 `Getting patients for doctor:`
   - ✅ `Found AccessGrants:`
   - ✅ `Found ... patients for doctor:`

If you see these logs, data is being fetched. Check page rendering.

---

## Console Log Markers

### Assignment Flow (Nurse Side)

```
📋 [ASSIGN] Starting assignment:
👥 [ASSIGN] Patient found:
👨‍⚕️ [ASSIGN] Doctor found:
🔗 [ASSIGN] Creating AccessGrant for:
✅ [ASSIGN] AccessGrant created/updated:
```

### Patient Query Flow (Doctor Side)

```
🔍 Getting patients for doctor:
✅ Found AccessGrants:
✅ Found ... patients for doctor:
```

### Diagnostic Flow

```
🔍 Diagnostic endpoint called
📍 Available cookies:
👤 Current user:
✅ User authenticated:
🔍 Running diagnostic for doctor:
✅ Diagnostic complete
```

---

## Quick Test Checklist

- [ ] Logged in as nurse
- [ ] Can see patients list
- [ ] Can select patient and assign to doctor
- [ ] See success message
- [ ] Check console for ✅ assignment logs
- [ ] Logout and login as doctor
- [ ] Navigate to diagnostic page
- [ ] See non-null session user
- [ ] See non-null database user
- [ ] See doctor info populated
- [ ] See AccessGrants count > 0
- [ ] See patients found > 0
- [ ] Navigate to doctor dashboard
- [ ] See assigned patient in list
- [ ] Can click on patient for details

---

## Database Query Commands

### MongoDB Compass / Shell

```typescript
// Count all AccessGrants
db.accessgrants.countDocuments();

// Find all for a specific doctor
db.accessgrants.find({ doctorId: "doctor-id" });

// Find all active AccessGrants
db.accessgrants.find({ isActive: true });

// Verify Patient-User relationship
db.patients.findOne({ userId: "user-id" });

// Check if User exists
db.users.findOne({ _id: ObjectId("user-id") });

// Find all DOCTOR role users
db.users.find({ role: "DOCTOR" });
```

---

## Performance Considerations

### What Should Be Fast

- Diagnostic page load: < 1 second
- Patient assignment: < 500ms
- Patient list query: < 1 second

### What Might Be Slow

- First time doctor views dashboard: ~2 seconds (if many patients)
- Count in large patient database: ~1-2 seconds

---

## Getting Help

When reporting issues, collect:

1. **Browser Console Output** (F12 → Console tab)
   - Copy all logs with markers like 📋, ✅, ❌
2. **Diagnostic Page Results**
   - Screenshot or copy the full results
3. **Database State**
   - Count of AccessGrants for your doctor
   - Count of Patients
   - Sample AccessGrant and Patient record

4. **Steps to Reproduce**
   - Exact sequence of actions taken
   - What you expected vs. what happened

---

## Success Scenario

✅ **Everything Working Correctly:**

```
Nurse Dashboard
  → Selects patient "John Doe"
  → Clicks "Affecter au médecin"
  → Selects doctor "Dr. Smith"
  → Clicks confirm
  → Success: "Patient assigned successfully"

Doctor Dashboard
  → Logs in
  → Views diagnostic: 1 AccessGrant, 1 Patient ✅
  → Patient list shows "John Doe" ✅
  → Can click for details ✅
```

---

**Last Updated:** 2024
**Status:** Ready for Testing
