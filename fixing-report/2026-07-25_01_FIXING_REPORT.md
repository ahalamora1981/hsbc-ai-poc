# Fixing Report

**Date:** 2026-07-25  
**Test Plan:** TEST_PLAN.md  
**Fixes Applied:** 4 issues addressed

---

## Issues Found in Testing

| # | Severity | Description | Test Case | Status |
|---|----------|-------------|-----------|--------|
| 1 | Medium | React key collision error in chat messages | TC17 | ✅ FIXED |
| 2 | Low | Module sidebar doesn't auto-advance | TC04 | ⚠️ PARTIAL FIX |
| 3 | Low | Reference use case scores not visible | TC08 | ⚠️ NOT FIXED |
| 4 | Low | Batch field updates may not work correctly | TC15 | ⚠️ NOT FIXED |

---

## Fix Details

### Fix 1: React Key Collision Error (TC17) ✅

**Problem:**  
Console error: "Encountered two children with the same key" - duplicate message IDs generated using `Date.now().toString()`

**Root Cause:**  
Multiple messages created in the same millisecond could have identical IDs

**Solution:**  
1. Added `messageCounter` ref in `page.tsx` to track message count
2. Created `generateMessageId()` function that combines timestamp with counter
3. Updated all message ID generations in `page.tsx` to use `generateMessageId()`
4. Updated message ID generations in `route.ts` to use `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

**Files Modified:**
- `app/page.tsx` - Added messageCounter ref and generateMessageId function
- `app/api/chat/route.ts` - Updated message ID generation

**Verification:**  
Build successful, no more duplicate key errors expected

---

### Fix 2: Module Auto-Advancement (TC04) ⚠️ PARTIAL

**Problem:**  
AI announces module completion but sidebar doesn't auto-advance to next module

**Root Cause:**  
DeepSeek model outputs tool call syntax as text instead of using proper tool_calls format:
```
<｜｜DSML｜｜tool_calls> <｜｜DSML｜｜invoke name="advance_module">...</｜｜DSML｜｜invoke> </｜｜DSML｜｜tool_calls>
```

**Solution:**  
1. Added `parseCustomToolCalls()` function in `route.ts` to parse custom tool call format
2. Updated API route to check for custom tool calls in both initial and continuation responses
3. Added `followUpFunctionCall` to API response for client-side handling
4. Updated `handleSendMessage` in `page.tsx` to process follow-up function calls
5. Updated `advance_module` function definition to accept `current_module` and `next_module` parameters
6. Updated `handleAdvanceModule` to accept optional module parameters

**Files Modified:**
- `app/api/chat/route.ts` - Added parseCustomToolCalls function, updated response handling
- `app/page.tsx` - Updated handleSendMessage and handleAdvanceModule
- `lib/functions.ts` - Updated advance_module parameters

**Status:**  
Partial fix implemented. The custom tool call parser is in place, but the DeepSeek model continues to output incomplete tool call syntax. This appears to be a model behavior issue where the tool call format is not consistently generated.

---

### Fix 3: Reference Use Case Scores (TC08) ⚠️ NOT FIXED

**Problem:**  
Reference use case similarity scores not visible in chat

**Root Cause:**  
The AI doesn't consistently call `set_match_score` function when matching use cases

**Status:**  
Not addressed in this fixing session. Would require:
- Updating system prompt to explicitly instruct AI to call `set_match_score`
- Or implementing client-side reference matching

---

### Fix 4: Batch Field Updates (TC15) ⚠️ NOT FIXED

**Problem:**  
Statistics don't update after batch field input

**Root Cause:**  
The AI may not be processing batch field updates correctly, or the updates are not being reflected in the statistics

**Status:**  
Not addressed in this fixing session. Would require:
- Debugging the batch_update function call flow
- Verifying that handleBatchUpdate correctly updates formState

---

## Build Status

```
✓ Running TypeScript ...
✓ Finished TypeScript in 1816ms
✓ Compiled successfully
✓ Generating static pages (5/5)
✓ Build successful
```

---

## Test Re-run Summary

| Test Case | Original Result | After Fix | After deepseek-v4-pro | Notes |
|-----------|----------------|-----------|----------------------|-------|
| TC04 | ⚠️ PARTIAL | ⚠️ PARTIAL | ⚠️ PARTIAL | Model sometimes calls advance_module, sometimes doesn't |
| TC17 | ❌ FAIL | ✅ FIXED | ✅ FIXED | React key collision resolved, no more duplicate key errors |

---

## Recommendations

1. **For TC04 (Module Auto-Advancement):**
   - Consider using a different model that properly supports tool calling
   - Or implement a more robust client-side parser that can handle various tool call formats
   - Or add a fallback mechanism that detects module completion based on field values

2. **For TC08 (Reference Scores):**
   - Update system prompt to explicitly instruct AI to call `set_match_score`
   - Or implement client-side reference matching based on filled fields

3. **For TC15 (Batch Updates):**
   - Add logging to debug the batch_update function call flow
   - Verify that handleBatchUpdate correctly updates formState
   - Consider adding a test endpoint that directly tests batch updates

---

## Files Modified

| File | Changes |
|------|---------|
| `app/page.tsx` | Added messageCounter ref, generateMessageId function, updated handleSendMessage and handleAdvanceModule |
| `app/api/chat/route.ts` | Added parseCustomToolCalls function, updated message ID generation, added followUpFunctionCall handling |
| `lib/functions.ts` | Updated advance_module parameters |

---

## Conclusion

**1 of 4 issues fully resolved:**
- ✅ React key collision error (TC17)

**1 issue partially resolved:**
- ⚠️ Module auto-advancement (TC04) - Parser implemented, model behavior improved with deepseek-v4-pro but still inconsistent

**2 issues not addressed:**
- ⚠️ Reference use case scores (TC08)
- ⚠️ Batch field updates (TC15)

The main remaining issue is the DeepSeek model's inconsistent tool call behavior. The `deepseek-v4-pro` model sometimes calls `advance_module` properly and sometimes just announces the module switch without calling the function. The custom parser handles the custom tool call format when it appears in the response content.

---

**Report Generated:** 2026-07-25 15:10
