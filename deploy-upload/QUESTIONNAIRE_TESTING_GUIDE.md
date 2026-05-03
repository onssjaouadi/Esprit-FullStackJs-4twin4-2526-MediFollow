# Questionnaire System - Complete Testing Guide

## 📋 Introduction

This comprehensive guide covers all aspects of testing the questionnaire system, including:

- Creating questionnaires (manual & AI-generated)
- Assigning to patients
- Patient submission workflow
- Doctor response viewing
- Error handling & edge cases
- Database validation

## 🎯 Test Objectives

| Objective            | Coverage                           |
| -------------------- | ---------------------------------- |
| **Build & Deploy**   | Schema, migrations, dependencies   |
| **Doctor Features**  | Create, assign, view responses     |
| **Patient Features** | View pending, fill out, submit     |
| **Data Integrity**   | Status tracking, cascading deletes |
| **Security**         | Role-based access, data isolation  |
| **Error Handling**   | Validation, network errors         |
| **Dark Mode**        | UI elements display correctly      |

## 🗄️ Database Validation

### Step 1: Verify Prisma Schema

```bash
npx prisma validate
```

**Expected**: No errors in schema.prisma

### Step 2: Generate Prisma Client

```bash
npx prisma generate
```

**Expected**: No TypeScript errors in generated types

### Step 3: Run Migrations

```bash
npx prisma migrate dev --name initial_questionnaire_migration
```

**Expected**: New migration created, all collections created in MongoDB

### Step 4: Seed Test Data (Optional)

```bash
npx prisma db seed
```

**Expected**: Test doctor, patient, and questionnaires created

## 👨‍⚕️ Doctor Features Testing

### Feature 1: Create Questionnaire (Manual)

**Test Case**: Doctor manually creates questionnaire

| Step | Action                                              | Expected Result                                    |
| ---- | --------------------------------------------------- | -------------------------------------------------- |
| 1    | Navigate to `/dashboard/questionnaires`             | Page loads, sees "Create New Questionnaire" button |
| 2    | Click "Create New Questionnaire"                    | Modal opens with form                              |
| 3    | Fill title: "Pre-Visit Assessment"                  | Input accepts text                                 |
| 4    | Fill description: "Please answer before your visit" | Text saved                                         |
| 5    | Click "Add Question"                                | New question row added                             |
| 6    | Add Q1: "Name" (TEXT, Required)                     | Question added with type                           |
| 7    | Add Q2: "Pain Level" (RATING, Required)             | Question added                                     |
| 8    | Add Q3: "Additional Notes" (TEXTAREA, Optional)     | Question added                                     |
| 9    | Click "Save Questionnaire"                          | Success message, ID generated                      |
| 10   | Verify in list                                      | New questionnaire appears in grid                  |

### Feature 2: Create Questionnaire (AI Generated)

**Test Case**: Doctor uses AI to generate questions

| Step | Action                                  | Expected Result                             |
| ---- | --------------------------------------- | ------------------------------------------- |
| 1    | Navigate to `/dashboard/questionnaires` | Page loads                                  |
| 2    | Click "Create New Questionnaire"        | Modal opens                                 |
| 3    | Fill title: "Cardiology Screening"      | Input accepts text                          |
| 4    | Switch to "AI Generate" tab             | Tab shows specialty selector                |
| 5    | Select specialty: "Cardiology"          | Selected                                    |
| 6    | Click "Generate Questions"              | 5-10 questions auto-populate                |
| 7    | Review generated questions              | Cardiology-specific (chest pain, SOB, etc.) |
| 8    | Click "Save Questionnaire"              | Success message                             |
| 9    | Verify in list                          | AI-generated questionnaire appears          |

### Feature 3: Assign Questionnaire

**Test Case**: Doctor assigns to patient with due date

| Step | Action                                  | Expected Result                        |
| ---- | --------------------------------------- | -------------------------------------- |
| 1    | Navigate to questionnaire card          | Card displays with "Assign" button     |
| 2    | Click "Assign" button                   | Assignment modal opens                 |
| 3    | Search for patient: "arij"              | Search results show patients matching  |
| 4    | Select checkbox: "arij.mhjb1@gmail.com" | Patient selected (checkbox marked)     |
| 5    | Set due date: 7 days from today         | Calendar picker works, date selected   |
| 6    | Click "Assign Questionnaire"            | Success message                        |
| 7    | Click "Assignments" tab                 | Shows new assignment (Status: PENDING) |

### Feature 4: View Patient Responses

**Test Case**: Doctor views completed patient responses

| Step | Action                        | Expected Result                          |
| ---- | ----------------------------- | ---------------------------------------- |
| 1    | Navigate to "Assignments" tab | All assignments listed                   |
| 2    | Find completed assignment     | Status shows "COMPLETED", "View" enabled |
| 3    | Click "View" button           | Modal opens showing user's responses     |
| 4    | Verify response display       | All Q&A pairs shown correctly            |
| 5    | Close modal                   | Modal closes, back to assignments        |

### Feature 5: Duplicate Questionnaire

**Test Case**: Doctor duplicates an existing questionnaire

| Step | Action                         | Expected Result                                 |
| ---- | ------------------------------ | ----------------------------------------------- |
| 1    | Navigate to questionnaire card | Card shows "Duplicate" option (in menu)         |
| 2    | Click "Duplicate"              | New questionnaire created as copy               |
| 3    | Edit title                     | Can modify before saving                        |
| 4    | Save                           | New questionnaire with all questions duplicated |

## 👤 Patient Features Testing

### Feature 1: View Pending Questionnaires

**Test Case**: Patient sees assigned questionnaires

| Step | Action                                  | Expected Result                    |
| ---- | --------------------------------------- | ---------------------------------- |
| 1    | Log in as patient                       | Dashboard loads                    |
| 2    | Navigate to `/dashboard/questionnaires` | All assigned questionnaires listed |
| 3    | Verify status                           | All show "PENDING" badge           |
| 4    | Verify due date                         | Due date displayed for each        |

### Feature 2: Submit Questionnaire

**Test Case**: Patient completes and submits

| Step | Action                           | Expected Result                             |
| ---- | -------------------------------- | ------------------------------------------- |
| 1    | Click on pending questionnaire   | Response page loads                         |
| 2    | View progress bar                | Shows "0/3 questions answered" (or similar) |
| 3    | Answer Q1 (TEXT): "Checking in"  | Input accepted                              |
| 4    | Answer Q2 (RATING): "5"          | Rating saved                                |
| 5    | Answer Q3 (TEXTAREA): "All good" | Textarea accepted                           |
| 6    | Progress bar updates             | Shows "3/3 questions answered"              |
| 7    | Click "Submit Questionnaire"     | Success card appears                        |
| 8    | Verify success card shows        | "Questionnaire Submitted Successfully!"     |
| 9    | Auto-redirects                   | Back to questionnaires list                 |
| 10   | Status changed                   | Now shows "COMPLETED" (green badge)         |

### Feature 3: Save Draft

**Test Case**: Patient saves draft without submitting

| Step | Action                       | Expected Result              |
| ---- | ---------------------------- | ---------------------------- |
| 1    | Open questionnaire           | Response form loads          |
| 2    | Fill Q1 & Q2                 | Answers visible              |
| 3    | Click "Save Draft"           | Without submitting           |
| 4    | Navigate away                | Answers are saved            |
| 5    | Return to same questionnaire | Previous answers still there |
| 6    | Finish Q3                    | Can complete                 |
| 7    | Submit                       | Successfully submits         |

## 🔴 Error Handling & Edge Cases

### Error 1: Empty Required Fields

**Test Case**: Patient submits with missing required answers

| Expected Outcome                                      |
| ----------------------------------------------------- |
| Cannot submit with empty required fields              |
| Error message: "Please answer all required questions" |
| Highlights empty required fields                      |
| Form stays open for correction                        |

### Error 2: Invalid Data Types

**Test Case**: Patient enters wrong type (e.g., text in NUMBER field)

| Expected Outcome                 |
| -------------------------------- |
| Number field rejects non-numeric |
| Shows validation error           |
| User can correct and resubmit    |

### Error 3: Network Failure

**Test Case**: Network drops during submission

| Expected Outcome                |
| ------------------------------- |
| Error message appears           |
| Form data preserved (can retry) |
| Retry button available          |
| Can submit after reconnect      |

### Error 4: Unauthorized Access

**Test Case**: User tries to access another patient's questionnaire

| Expected Outcome                          |
| ----------------------------------------- |
| 403 Forbidden or redirect to /login       |
| Access denied message                     |
| Cannot view/modify others' questionnaires |

### Error 5: Expired Questionnaire

**Test Case**: Patient tries to submit after due date

| Expected Outcome                              |
| --------------------------------------------- |
| Allow submission but flag as late             |
| Show warning: "This questionnaire is overdue" |
| Still accept and record response              |

## 🔍 Data Integrity Tests

### Test 1: Cascading Deletes

**Test Case**: Deleting questionnaire removes all associated data

| Step                | Verify                                    |
| ------------------- | ----------------------------------------- |
| 1. Delete template  | Assignments marked as orphaned or deleted |
| 2. Verify responses | Responses preserved for audit             |
| 3. Check DB         | No orphaned assignments                   |

### Test 2: Status Transitions

**Test Case**: Verify proper status flow

```
PENDING → IN_PROGRESS → COMPLETED ✅
PENDING → EXPIRED ✅
COMPLETED cannot revert to PENDING ✅
```

### Test 3: Audit Trail

**Test Case**: Data modifications are tracked

| Created/Modified         | Tracked |
| ------------------------ | ------- |
| Template created date    | ✅      |
| Assignment assigned date | ✅      |
| Response submitted date  | ✅      |
| Last updated timestamp   | ✅      |

## 🔐 Security Tests

### Test 1: Role-Based Access

| Role    | Can Create | Can Assign | Can View Responses |
| ------- | ---------- | ---------- | ------------------ |
| DOCTOR  | ✅         | ✅         | ✅ Own only        |
| PATIENT | ❌         | ❌         | ❌                 |
| ADMIN   | ✅         | ✅         | ✅ All             |

### Test 2: Data Isolation

**Test Case**: Patient A cannot see Patient B's questionnaires

| Step                                  | Expected                  |
| ------------------------------------- | ------------------------- |
| 1. Patient A logs in                  | Only sees own assignments |
| 2. Direct URL to Patient B's response | 403 Forbidden             |
| 3. API call for other patient's data  | 401/403 Returned          |

## 🌙 Dark Mode Testing

### Test 1: Visual Elements

| Component | Dark Mode             | Light Mode            |
| --------- | --------------------- | --------------------- |
| Cards     | Dark background       | Light background      |
| Inputs    | Dark inputs           | Light inputs          |
| Buttons   | Contrasting colors    | Contrasting colors    |
| Text      | White/light text      | Dark text             |
| Badges    | Colored appropriately | Colored appropriately |

## 📊 Performance Testing (Optional)

### Load Test 1: Many Questions

**Test**: 50 question questionnaire

| Metric           | Expected |
| ---------------- | -------- |
| Page load        | < 2s     |
| Form submission  | < 1s     |
| Response viewing | < 1s     |

### Load Test 2: Many Assignments

**Test**: Doctor with 100 assignments

| Metric        | Expected        |
| ------------- | --------------- |
| List load     | < 2s            |
| Filter/search | < 500ms         |
| Pagination    | Works correctly |

## ✅ Final Validation Checklist

Before considering the questionnaire system complete:

- [ ] Schema validates with no warnings
- [ ] Migrations run successfully
- [ ] All doctor features work
- [ ] All patient features work
- [ ] All error cases handled
- [ ] Data integrity verified
- [ ] Security tests pass
- [ ] Dark mode displays correctly
- [ ] No TypeScript errors
- [ ] API responses correct
- [ ] Database consistency checked
- [ ] Performance acceptable
- [ ] Documentation complete
- [ ] Ready for production

## 🚀 Production Checklist

Before deploying to production:

- [ ] All tests pass
- [ ] Database backed up
- [ ] Monitoring configured
- [ ] Error logging enabled
- [ ] Performance metrics captured
- [ ] User documentation provided
- [ ] Support team trained
- [ ] Rollback plan documented
