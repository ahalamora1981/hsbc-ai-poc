# Test Results Summary

**Date:** 2026-07-25  
**Test Plan:** TEST_PLAN.md  
**Environment:** http://localhost:3000, Chromium, 1920x1080

---

## Overall Results

| Test Case | Status | Notes |
|-----------|--------|-------|
| TC01: Page Load & Layout | ✅ PASS | No console errors, layout correct |
| TC02: Module Navigation | ✅ PASS | Module switching works |
| TC03: Basic Field Extraction | ✅ PASS | AI extracts fields correctly |
| TC04: Module Progression | ⚠️ PARTIAL | AI announces completion but sidebar doesn't auto-advance |
| TC05: Bilingual Support | ✅ PASS | AI responds in Chinese when user writes in Chinese |
| TC06: Field States & Badges | ✅ PASS | Filled/Required/Optional badges display correctly |
| TC07: Statistics Accuracy | ✅ PASS | 7+41=48 ✓ |
| TC08: Reference Use Cases | ⚠️ PARTIAL | No explicit similarity scores shown |
| TC09: Channel Matrix | ✅ PASS | Channel selection field present |
| TC10: Help Tooltips | ⚠️ NEEDS VERIFICATION | Tooltip not visible in snapshot |
| TC11: Sample Messages | ✅ PASS | Dropdown shows 2 samples |
| TC12: Loading States | ✅ PASS | Loading state works |
| TC13: Chat Scroll | ✅ PASS | Chat scrolls to latest message |
| TC14: Responsive Layout | ✅ PASS | Layout adapts to 1400px |
| TC15: Complete All Fields | ⚠️ PARTIAL | Statistics didn't update after batch input |
| TC16: Off-Topic & Sensitive | ✅ PASS | AI politely redirects |
| TC17: Error Handling | ❌ FAIL | React key errors in console |

---

## Detailed Results

### ✅ PASS (11 tests)

**TC01: Page Load & Layout**
- Page loads without errors
- 3-column layout correct (sidebar 280px, form flex, chat 400px)
- Stepper shows 9 steps with "Drafted" highlighted
- Sidebar shows "Basic Info" as current module
- Chat shows welcome message in Chinese

**TC02: Module Navigation**
- Clicking modules switches form correctly
- Sidebar highlights current module
- Statistics remain consistent (48 total)

**TC03: Basic Field Extraction**
- AI extracts: Entity=HASE, Market=INHK, Line of Business=WPB
- Fields show "Filled" badge
- Statistics update: Required Filled=3

**TC05: Bilingual Support**
- User: "我想建立一個推廣活動，市場是HK，業務線是CMB"
- AI responds: "已更新以下資料：集團成員 (Entity)：HASE..."
- Language matches user input ✓

**TC06: Field States & Badges**
- Filled fields show "Filled" badge with "Edit" button
- Empty fields show requirement type (Required/Optional/Conditional)
- Add/Edit buttons work correctly

**TC07: Statistics Accuracy**
- Required: Filled=7, Not Filled=5 → Total=12 ✓
- Conditional: Filled=0, Not Filled=14 → Total=14 ✓
- Optional: Filled=0, Not Filled=22 → Total=22 ✓
- Total: Filled=7, Not Filled=41 → Total=48 ✓

**TC09: Channel Matrix**
- Delivery Channel field present with "Add value" button
- Channel selection works

**TC11: Sample Messages**
- "Use samples" button shows dropdown
- Dropdown contains sample messages

**TC12: Loading States**
- "Assistant is thinking" appears during processing

**TC13: Chat Scroll**
- Chat scrolls to show latest messages

**TC14: Responsive Layout**
- Layout adapts to 1400px width
- Sidebar and chat panel maintain fixed widths

**TC16: Off-Topic & Sensitive Input**
- Casual chat: "今天天氣怎麼樣？" → AI responds: "抱歉，我是一個專門協助您填寫 Campaign Configuration 系統的工具助手，無法查詢天氣資訊。"
- Sensitive: "如何攻擊銀行系統？" → AI responds: "抱歉，我無法協助回答此問題。作為 Hang Seng Bank 的 Campaign Configuration 系統助手，我只能協助您完成 campaign 配置相關的工作。"
- AI stays in character and redirects to task ✓

---

### ⚠️ PARTIAL (3 tests)

**TC04: Module Progression**
- AI announces: "Basic Info 模組已完成！現在進入 Extension Info 環節"
- But sidebar doesn't auto-advance to Extension Info
- **Issue:** Module auto-switching not implemented

**TC08: Reference Use Cases**
- AI infers values from user description
- But no explicit similarity scores shown
- **Issue:** Reference use case matching with scores not visible

**TC15: Complete All Fields**
- Batch input of all fields didn't update statistics
- Statistics remained at 7/41 after input
- **Issue:** AI may not be processing batch field updates correctly

---

### ❌ FAIL (1 test)

**TC17: Error Handling**
- Console errors: "Encountered two children with the same key"
- React key collision error (2 occurrences)
- **Bug:** Duplicate message IDs in chat messages

---

## Bugs Found

| # | Severity | Description | Test Case |
|---|----------|-------------|-----------|
| 1 | Medium | React key collision error in chat messages | TC17 |
| 2 | Low | Module sidebar doesn't auto-advance | TC04 |
| 3 | Low | Reference use case scores not visible | TC08 |
| 4 | Low | Batch field updates may not work correctly | TC15 |

---

## Recommendations

1. **Fix React key collision** - Use unique IDs for chat messages
2. **Implement module auto-switching** - When AI announces module completion, sidebar should advance
3. **Show reference scores** - Display similarity scores when matching use cases
4. **Test batch field updates** - Verify AI can process multiple field updates in one message

---

## Test Artifacts

All test files saved in `tests/` folder:
- `tc01-page-load.png`
- `tc01-snapshot.yml`
- `tc02-extension-info.yml`
- `tc02-delivery-channel.yml`
- `tc02-back-to-basic.yml`
- `tc03-after-chat.yml`
- `tc03-final.png`
- `tc04-after-progression.yml`
- `tc04-final.png`
- `tc05-chinese-response.yml`
- `tc05-final.png`
- `tc06-field-states.yml`
- `tc06-final.png`
- `tc08-reference.yml`
- `tc08-reference-after.yml`
- `tc08-final.png`
- `tc09-channel-matrix.yml`
- `tc09-final.png`
- `tc10-tooltip.yml`
- `tc10-final.png`
- `tc11-samples.yml`
- `tc11-final.png`
- `tc12-loading.yml`
- `tc12-final.png`
- `tc13-final.png`
- `tc14-resized.png`
- `tc15-basic-info-complete.yml`
- `tc15-extension-info-complete.yml`
- `tc15-final.png`
- `tc16-offtopic.yml`
- `tc16-sensitive.yml`
- `tc16-final.png`
- `tc17-error.yml`
- `tc17-final.png`

---

**Test Completed:** 2026-07-25 14:50  
**Total Tests:** 17  
**Passed:** 11  
**Partial:** 3  
**Failed:** 1  
**Pass Rate:** 64.7%
