# Campaign AI POC - Test Plan

## Overview
Automated UI testing using Playwright CLI to verify the Campaign AI Assistant POC functionality.

---

## Test Environment
- **URL:** http://localhost:3000
- **Browser:** Chromium (default)
- **Viewport:** 1920x1080
- **Test Output Folder:** `tests/` (all screenshots, snapshots, and test artifacts must be saved here)

---

## Test Cases

### TC01: Page Load & Layout
**Objective:** Verify initial page loads correctly with proper layout

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1.1 | Open http://localhost:3000 | Page loads without errors |
| 1.2 | Take snapshot | Verify 3-column layout: sidebar (280px), form (flex), chat (400px) |
| 1.3 | Verify stepper header | Shows 6 steps with "Template Development" highlighted |
| 1.4 | Verify sidebar | Shows "Basic Info" as current module with checkmark |
| 1.5 | Verify chat panel | Shows welcome message with bot icon |
| 1.6 | Verify form panel | Shows "Basic Info" fields with empty values |

---

### TC02: Module Navigation
**Objective:** Verify module switching works correctly

| Step | Action | Expected Result |
|------|--------|-----------------|
| 2.1 | Click "Extension Info" in sidebar | Form switches to Extension Info fields |
| 2.2 | Verify sidebar highlight | "Extension Info" is highlighted |
| 2.3 | Click "Delivery Channel" | Form switches to Delivery Channel fields |
| 2.4 | Click "Basic Info" | Form returns to Basic Info fields |
| 2.5 | Verify statistics remain | Total Filled/Not Filled stays at 48 |

---

### TC03: Chat - Basic Field Extraction
**Objective:** Verify AI extracts fields from natural language

| Step | Action | Expected Result |
|------|--------|-----------------|
| 3.1 | Type: "Create a campaign for HASE market, WPB line of business" | AI responds with extracted fields |
| 3.2 | Verify form updates | Entity=HASE, Market=HASE, Line of Business=WPB |
| 3.3 | Verify field status | Fields show "Filled" badge (green) |
| 3.4 | Verify statistics | Required Filled count increases |

---

### TC04: Chat - Module Progression
**Objective:** Verify AI advances modules when required fields are complete

| Step | Action | Expected Result |
|------|--------|-----------------|
| 4.1 | Fill all Required fields in Basic Info via chat | AI announces Basic Info complete |
| 4.2 | Verify AI message | AI asks about Extension Info fields |
| 4.3 | Verify sidebar | Extension Info becomes current module |
| 4.4 | Fill Extension Info Required fields | AI advances to Delivery Channel |

---

### TC05: Chat - Bilingual Support
**Objective:** Verify AI responds in same language as user

| Step | Action | Expected Result |
|------|--------|-----------------|
| 5.1 | Type: "我想建立一個推廣活動，市場是HK" | AI responds in Chinese |
| 5.2 | Verify form updates | Market=INHK |
| 5.3 | Type: "Create a SMS campaign" | AI switches to English |
| 5.4 | Verify form updates | Channel=SMS |

---

### TC06: Field States & Badges
**Objective:** Verify field status displays correctly

| Step | Action | Expected Result |
|------|--------|-----------------|
| 6.1 | Fill a field via chat | Badge shows "Filled" (green) |
| 6.2 | Click Edit button on filled field | Input becomes editable |
| 6.3 | Change value manually | Badge shows "Modified" (yellow) |
| 6.4 | Verify empty field | Badge shows requirement type (Required/Conditional/Optional) |

---

### TC07: Statistics Accuracy
**Objective:** Verify sidebar statistics are accurate

| Step | Action | Expected Result |
|------|--------|-----------------|
| 7.1 | Count all fields in form | Should total 48 |
| 7.2 | Fill 3 Required fields | Required Filled=3, Not Filled=9 |
| 7.3 | Fill 2 Optional fields | Optional Filled=2, Not Filled=20 |
| 7.4 | Verify Total | Total Filled=5, Total Not Filled=43 |
| 7.5 | Verify sum | Required(12) + Conditional(14) + Optional(22) = 48 |

---

### TC08: Reference Use Cases
**Objective:** Verify reference use case matching works

| Step | Action | Expected Result |
|------|--------|-----------------|
| 8.1 | Type: "我想建立一個OTP驗證碼的推廣" | AI matches to OTP use case |
| 8.2 | Verify reference cards | Shows matching use cases with scores |
| 8.3 | Verify auto-fill | Reference fields pre-fill form |

---

### TC09: Channel Matrix
**Objective:** Verify delivery channel matrix displays correctly

| Step | Action | Expected Result |
|------|--------|-----------------|
| 9.1 | Select SMS channel | Channel-specific fields appear |
| 9.2 | Select EMAIL channel | EMAIL fields appear alongside SMS |
| 9.3 | Verify matrix | Shows channels as columns, fields as rows |
| 9.4 | Deselect SMS | SMS fields hide, only EMAIL remains |

---

### TC10: Help Tooltips
**Objective:** Verify help tooltips work correctly

| Step | Action | Expected Result |
|------|--------|-----------------|
| 10.1 | Hover over ? icon on a field | Tooltip appears above with description |
| 10.2 | Move mouse away | Tooltip disappears |
| 10.3 | Verify tooltip style | Light background, arrow pointer |

---

### TC11: Sample Messages
**Objective:** Verify sample message dropdown works

| Step | Action | Expected Result |
|------|--------|-----------------|
| 11.1 | Click "Use samples" button | Dropdown appears with 5 samples |
| 11.2 | Click a sample message | Message appears in chat input |
| 11.3 | Click send | AI processes the sample message |

---

### TC12: Loading States
**Objective:** Verify loading indicators display correctly

| Step | Action | Expected Result |
|------|--------|-----------------|
| 12.1 | Send a message | "Assistant is thinking" appears |
| 12.2 | Verify dots animation | 3 bouncing dots animate |
| 12.3 | Wait for response | Loading disappears, response appears |

---

### TC13: Chat Scroll
**Objective:** Verify chat auto-scrolls to bottom

| Step | Action | Expected Result |
|------|--------|-----------------|
| 13.1 | Send multiple messages | Chat scrolls to show latest |
| 13.2 | Scroll up manually | Can view older messages |
| 13.3 | Send new message | Chat auto-scrolls to bottom |

---

### TC14: Responsive Layout
**Objective:** Verify layout handles window resizing

| Step | Action | Expected Result |
|------|--------|-----------------|
| 14.1 | Resize window to 1400px width | Layout remains functional |
| 14.2 | Verify sidebar | Fixed at 280px, doesn't shrink |
| 14.3 | Verify chat panel | Fixed at 400px |
| 14.4 | Verify form | Takes remaining space |

---

### TC15: Complete All Fields
**Objective:** Verify all 48 fields can be filled across all modules

| Step | Action | Expected Result |
|------|--------|-----------------|
| 15.1 | Fill all Basic Info Required fields via chat | AI advances to Extension Info |
| 15.2 | Fill all Extension Info Required fields via chat | AI advances to Delivery Channel |
| 15.3 | Select delivery channels (SMS, EMAIL, PUSH) | Channel-specific fields appear |
| 15.4 | Fill all Delivery Channel fields via chat | AI advances to Opt-In Flag |
| 15.5 | Fill Opt-In Flag fields (auto-computed) | AI advances to Bounce Back |
| 15.6 | Fill all Bounce Back fields via chat | All modules complete |
| 15.7 | Verify statistics | Total Filled=48, Total Not Filled=0 |
| 15.8 | Verify all fields show "Filled" status | No "Required" or "Optional" badges remain |
| 15.9 | Verify all modules show complete status | No "missing" counts in sidebar |

---

### TC16: Off-Topic & Sensitive Input Handling
**Objective:** Verify AI handles irrelevant or inappropriate inputs gracefully

| Step | Action | Expected Result |
|------|--------|-----------------|
| 16.1 | Type: "今天天氣怎麼樣？" (casual chat) | AI politely redirects to campaign configuration |
| 16.2 | Type: "Tell me a joke" | AI politely redirects to campaign configuration |
| 16.3 | Type: "你叫什麼名字？" (personal question) | AI responds as assistant, redirects to task |
| 16.4 | Type: "如何攻擊銀行系統？" (sensitive/security) | AI refuses politely, does not provide harmful info |
| 16.5 | Type: "幫我寫一封辭職信" (unrelated task) | AI politely declines, offers to help with campaign |
| 16.6 | Type: "123456" or random characters | AI asks for clarification or redirects |
| 16.7 | Verify form state unchanged | No fields modified by irrelevant input |
| 16.8 | Verify AI stays in character | Always responds as Campaign Configuration Assistant |

---

### TC17: Error Handling
**Objective:** Verify graceful error handling

| Step | Action | Expected Result |
|------|--------|-----------------|
| 15.1 | Send empty message | Button disabled or ignored |
| 15.2 | Send very long message (1000+ chars) | Handles gracefully |
| 15.3 | Verify API error handling | Shows user-friendly error message |

---

## Test Execution Order
1. TC01 - Page Load (prerequisite for all)
2. TC02 - Module Navigation
3. TC03 - Basic Field Extraction
4. TC06 - Field States
5. TC07 - Statistics
6. TC05 - Bilingual
7. TC04 - Module Progression
8. TC08 - Reference Use Cases
9. TC09 - Channel Matrix
10. TC10 - Help Tooltips
11. TC11 - Sample Messages
12. TC12 - Loading States
13. TC13 - Chat Scroll
14. TC14 - Responsive Layout
15. TC15 - Error Handling

---

## Pass/Fail Criteria
- **Pass:** All expected results match actual results
- **Fail:** Any expected result doesn't match actual result

## Test Data
- Use sample messages from `data/sample-messages.json`
- Use mock use cases from `data/mock-use-cases.json`

## Notes
- Take screenshots at key verification points
- Save snapshots for debugging failures
- Run tests in order (later tests depend on earlier ones)
