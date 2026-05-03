# Questionnaire Submission & Response Viewing - Testing Guide

## Overview

This guide walks you through testing the complete questionnaire workflow: assignment → submission → response viewing.

## Test Accounts

- **Patient Account**: arij.mhjb1@gmail.com / Test1234\*
- **Doctor Account**: arij@medifollow.health / Test1234\*

## Full End-to-End Test Flow

### Phase 1: Doctor Creates & Assigns Questionnaire ✅

1. **Log in as Doctor** (arij@medifollow.health)
   - Navigate to Dashboard
   - Click "Questionnaires" in sidebar

2. **Create a Test Questionnaire**
   - Click "Create New Questionnaire" button
   - Fill in details:
     - **Title**: "Patient Health Assessment"
     - **Description**: "Quick health check-up"
     - **Specialty**: "General Practice"
   - **Add Questions** (at least 3):
     - Q1: "How are you feeling today?" (Type: TEXT) - Required
     - Q2: "Rate your pain level" (Type: NUMBER, Min: 0, Max: 10) - Required
     - Q3: "Any additional comments?" (Type: TEXTAREA)
   - Click **Submit**
   - Verify: Success message + questionnaire appears in grid

3. **Assign to Patient**
   - In the questionnaire card, click **"Assign"** button
   - Search for patient: type "arij"
   - Select checkbox for patient (arij.mhjb1@gmail.com)
   - Set **Due Date**: 7 days from today
   - Click **"Assign Questionnaire"**
   - **Verify**: Success message + shows count assigned

4. **View in Assignments Table**
   - Click **"Assignments"** tab (should show count > 0)
   - Verify table shows:
     - Patient name: "Arij [Patient Last Name]"
     - Questionnaire: "Patient Health Assessment"
     - Assigned Date: Today's date
     - Due Date: Date set in step 3
     - Status: "PENDING"
     - Progress: "Pending"
     - Actions: "-" (disabled because not completed yet)

### Phase 2: Patient Completes & Submits Questionnaire ✅

1. **Log in as Patient** (arij.mhjb1@gmail.com)
   - Navigate to Dashboard
   - Click **"Questionnaires"** in sidebar
   - Should see assigned questionnaire listed with status "PENDING"

2. **Open Questionnaire**
   - Click on the questionnaire
   - Should display:
     - Title: "Patient Health Assessment"
     - Progress bar showing required questions
     - All 3 questions with input fields
     - "Save Draft" and "Submit Questionnaire" buttons

3. **Fill Out Responses**
   - Q1 (TEXT): Enter "I'm feeling good, just a bit tired"
   - Q2 (NUMBER): Enter "3"
   - Q3 (TEXTAREA): Enter "Everything seems normal"

4. **Submit Questionnaire**
   - Click **"Submit Questionnaire"** button
   - **CRITICAL TEST**: Should see green success card displaying:
     - ✅ Checkmark icon
     - "Questionnaire Submitted Successfully!"
     - "Your responses have been recorded and sent to your healthcare provider"
     - Shows "Total Questions: 3"
     - **NOT**: Just an alert box - should be a card with rich feedback

5. **Verify Status Changed**
   - Navigate back to Questionnaires page
   - Previous questionnaire should now show status: **COMPLETED** (green badge)
   - Progress: **100%**

### Phase 3: Doctor Views Patient Responses ✅ (NEW)

1. **Log in as Doctor** (arij@medifollow.health)
   - Navigate to Dashboard
   - Click **"Questionnaires"** in sidebar

2. **Switch to Assignments Tab**
   - Click **"Assignments"** tab
   - Should now show:
     - Status: **"COMPLETED"** (green badge)
     - Progress: **100%**
     - Actions: **"View"** button (enabled because status is COMPLETED)

3. **View Responses**
   - Click **"View"** button in Actions column
   - Modal should open showing:
     - **Header Section**:
       - Questionnaire Title: "Patient Health Assessment"
       - Patient Name: "Arij [Last Name]"
       - Status: "COMPLETED" (green badge)
       - Assigned Date: [Date shown]
       - Due Date: [Date shown]
       - Completed Date: [Today's date shown]
       - Total Questions: 3

     - **Question & Response Pairs**:
       - Q1: "How are you feeling today?"
         - Response: "I'm feeling good, just a bit tired"
       - Q2: "Rate your pain level"
         - Response: 3 (with visual styling)
       - Q3: "Any additional comments?"
         - Response: "Everything seems normal"

4. **Verify Response Display**
   - Responses should be displayed in readable format
   - Different response types should have appropriate styling:
     - TEXT/TEXTAREA: Plain text
     - NUMBER: Styled number display
     - RATING: Shows X / 5
     - YESNO: Badge with Yes/No
     - DATE: Formatted date
     - MULTIPLE_CHOICE/CHECKBOX: Array of badges

### Phase 4: Error Handling & Edge Cases

#### Test 4.1: Incomplete Submission

1. Patient starts filling questionnaire but leaves required fields empty
2. Click "Submit Questionnaire"
3. **Verify**: Alert shows "Please answer all required questions (X remaining)"
4. **Verify**: Form not submitted, user can continue filling

#### Test 4.2: Network Error Simulation

1. **(Optional)** Open browser DevTools (F12)
2. Set network condition to "Offline"
3. Patient tries to submit
4. **Verify**: Error message displays: "Failed to submit responses" or network error
5. Restore online connection
6. **Verify**: Patient can retry submission

#### Test 4.3: Multiple Questionnaires

1. Doctor creates a 2nd questionnaire
2. Assigns both questionnaires to same patient
3. Patient completes both
4. Doctor can see responses for both
5. **Verify**: All assignments tracked separately
