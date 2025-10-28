# Deep Scan ALL - Testing Guide

## Overview
The Deep Scan ALL feature automatically scans up to 100 LinkedIn search result pages, extracting profile data from each page.

## Features Implemented
- ✅ Confirmation dialog before starting
- ✅ Automatic page navigation
- ✅ Progress badge showing current page number
- ✅ Stop button (visible during scan)
- ✅ Incremental saving (no data loss if stopped)
- ✅ 2.5 second delay between pages (rate limit protection)
- ✅ Error handling with 3-strike rule
- ✅ Chrome notifications for start/complete/stop/error

## Testing Workflow

### 1. Reload Extension
1. Go to `chrome://extensions/`
2. Find "LinkedIn Extension"
3. Click reload icon

### 2. Test Deep Scan ALL Button Visibility
1. Open LinkedIn search results page
2. Open extension popup
3. Verify "🔄 Deep Scan ALL" button is visible
4. Navigate away from LinkedIn
5. Verify button disappears

### 3. Test Confirmation Dialog
1. On LinkedIn search results, click "Deep Scan ALL"
2. Verify confirmation dialog appears:
   - Message: "Deep Scan ALL will automatically scan up to 100 pages..."
   - Two buttons: OK and Cancel
3. Click Cancel - verify nothing happens
4. Click "Deep Scan ALL" again
5. Click OK - verify scan starts

### 4. Test Progress Badge
1. Start Deep Scan ALL
2. Look at extension icon in toolbar
3. Verify badge shows page number (1, 2, 3, etc.)
4. Verify badge background color is LinkedIn blue (#0073b1)

### 5. Test Stop Button
1. Start Deep Scan ALL
2. Wait for 2-3 pages to complete
3. Open extension popup
4. Verify "⏹️ Stop Deep Scan" button is visible
5. Verify "🔄 Deep Scan ALL" button is hidden
6. Click "Stop Deep Scan"
7. Verify notification: "Deep Scan ALL stopped at page X. Saved Y leads."
8. Verify badge disappears

### 6. Test Automatic Page Navigation
1. Start Deep Scan ALL on page 1
2. Watch the LinkedIn page automatically navigate to next page after each scan
3. Verify 2-3 second delay between pages

### 7. Test Lead Storage
1. Start Deep Scan ALL
2. Let it complete 3-5 pages
3. Stop the scan
4. Click "View Leads" in popup
5. Verify all leads from scanned pages are present

### 8. Test Completion
1. Start on a search with only 2-3 pages
2. Let scan complete naturally
3. Verify notification: "Deep Scan ALL complete! Scanned X pages. Extracted Y leads."
4. Verify badge disappears
5. Verify "Deep Scan ALL" button reappears

### 9. Test Error Handling
1. Start Deep Scan ALL
2. Manually close the LinkedIn tab during scan
3. Verify appropriate error notification appears
4. Verify badge disappears

### 10. Test 100-Page Limit
1. Start on a search with 100+ pages
2. Let scan run to completion (may take 5-10 minutes)
3. Verify it stops at page 100
4. Verify notification mentions 100 pages

## Expected Notifications

**Start:**
- Title: "Deep Scan ALL Started"
- Message: "Starting scan (Page 1/100)"

**Complete:**
- Title: "Deep Scan ALL Complete"
- Message: "Scanned X pages. Extracted Y leads."

**Stopped:**
- Title: "Deep Scan ALL Stopped"
- Message: "Stopped at page X. Saved Y leads."

**Error:**
- Title: "Deep Scan ALL Failed"
- Message: "Failed at page X: [error message]"

## Known Behaviors

- Popup closes 2 seconds after starting scan (expected)
- Badge persists even if extension popup is closed (expected)
- Scan continues in background even if all browser windows are closed (expected)
- Leads are saved incrementally, so stopping mid-scan preserves all collected data
- If 3 consecutive pages fail, scan stops automatically with error notification

## File Locations

### New Files Created
- `chrome/popup/handlers/scan-deep-all-handler.js` (78 lines)
- `chrome/popup/utils/pagination.js` - added `checkLinkedInNextExists()` (80 lines)
- `chrome/background/deep-scan-all-worker.js` (84 lines)
- `chrome/background/deep-scan-all-state.js` (57 lines)
- `chrome/background/deep-scan-all-helpers.js` (97 lines)
- `chrome/background/message-handlers.js` (84 lines)

### Modified Files
- `chrome/popup/ui/button-configs.js` - added button configs
- `chrome/popup/handlers.js` - exported new handlers
- `chrome/popup/ui/button-visibility.js` - added visibility logic (92 lines)
- `chrome/background.js` - refactored to use message handlers (50 lines)

All files comply with 100-line limit ✅
