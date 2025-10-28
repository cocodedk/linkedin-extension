<!-- 842aab25-3783-47c1-80f1-e6f1eb936154 f684ff2a-4dbd-45aa-a8bb-c88aaabad200 -->
# Deep Scan ALL Pages Implementation

## Overview

Add a new workflow that runs deep scan on current page, clicks Next, and repeats until no more pages or 100-page limit reached. Users can stop mid-scan without losing results.

## Implementation Steps

### 1. Add "Deep Scan ALL" Button to UI

**File:** `chrome/popup/ui/button-configs.js`

- Add new button config: `deepScanAll` with icon '🔄', label 'Deep Scan ALL'

**File:** `chrome/popup/handlers.js`

- Import and wire up `handleDeepScanAll` handler

### 2. Create Deep Scan All Handler

**File:** `chrome/popup/handlers/scan-deep-all-handler.js` (NEW)

- Show confirmation dialog: "This will scan up to 100 pages. Continue?"
- Validate user is on LinkedIn search results
- Send `START_DEEP_SCAN_ALL` message to background worker
- Display status message and close popup after 2 seconds

### 3. Background Worker - Multi-Page Loop

**File:** `chrome/background/deep-scan-all-worker.js` (NEW)

- Store state: `isRunning`, `currentPage`, `totalLeads`, `searchTabId`
- Loop logic:

1. Run `runDeepScanInBackground(searchTabId)` for current page
2. Append leads to accumulated results and save incrementally
3. Update badge with current page number
4. Check if page < 100 and Next button exists
5. If yes: Click Next, wait 2-3 seconds for load, repeat
6. If no: Stop and send completion notification

- Export `stopDeepScanAll()` function to cancel scan
- Clear state and badge on completion or stop

### 4. Add Stop Deep Scan Handler

**File:** `chrome/popup/handlers/scan-deep-all-handler.js`

- Export `handleStopDeepScanAll()` function
- Send `STOP_DEEP_SCAN_ALL` message to background
- Show "Scan stopped" message

**File:** `chrome/popup/ui/button-visibility.js`

- Add logic to show/hide "Stop Deep Scan" button based on scan state
- Check `chrome.storage.local.get('isDeepScanAllRunning')`

### 5. Background Message Handling

**File:** `chrome/background.js`

- Add listener for `START_DEEP_SCAN_ALL` message
- Call `runDeepScanAllInBackground(searchTabId)`
- Return async response
- Add listener for `STOP_DEEP_SCAN_ALL` message
- Call `stopDeepScanAll()`
- Return current leads count
- Add listener for `GET_DEEP_SCAN_ALL_STATUS` message (for button visibility)

### 6. Badge Progress Display

**File:** `chrome/background/deep-scan-all-worker.js`

- Use `chrome.action.setBadgeText()` to show page number
- Use `chrome.action.setBadgeBackgroundColor()` to set color (e.g., '#0073b1' LinkedIn blue)
- Clear badge on completion: `chrome.action.setBadgeText({ text: '' })`

### 7. Next Button Checking Logic

**File:** `chrome/popup/utils/pagination.js`

- Add `checkLinkedInNextExists()` function
- Return true if Next button exists and is not disabled
- Use same selector as `clickLinkedInNext()`

### 8. Error Handling

- If page fails to load: Log error, continue to next page
- If 3 consecutive pages fail: Stop scan and notify user
- Save leads incrementally so nothing is lost on error

### 9. Notifications

- Start: "Deep Scan ALL started (Page 1/100)"
- Complete: "Deep Scan ALL complete! Scanned X pages, extracted Y leads"
- Stopped: "Deep Scan ALL stopped at page X. Saved Y leads"
- Error: "Deep Scan ALL failed at page X: [error message]"

## Files to Create

- `chrome/popup/handlers/scan-deep-all-handler.js` (~60 lines)
- `chrome/background/deep-scan-all-worker.js` (~95 lines)

## Files to Modify

- `chrome/popup/ui/button-configs.js` (add button config)
- `chrome/popup/handlers.js` (wire up handler)
- `chrome/popup/ui/button-visibility.js` (show/hide stop button)
- `chrome/background.js` (add message listeners)
- `chrome/popup/utils/pagination.js` (add check function)

## State Management

Use `chrome.storage.local`:

- `isDeepScanAllRunning`: boolean
- `deepScanAllProgress`: { page, totalLeads, searchTabId }

## Safety Features

- 100-page hard limit
- 2-3 second delay between pages (prevent rate limiting)
- Incremental saving (no data loss)
- Stop button (graceful cancellation)
- Consecutive error tracking (auto-stop on repeated failures)

### To-dos

- [ ] Add 'Deep Scan ALL' button configuration to button-configs.js
- [ ] Create scan-deep-all-handler.js with confirmation dialog and stop function
- [ ] Create deep-scan-all-worker.js with multi-page loop logic and state management
- [ ] Add checkLinkedInNextExists() function to pagination.js
- [ ] Add START_DEEP_SCAN_ALL and STOP_DEEP_SCAN_ALL message listeners to background.js
- [ ] Wire up handleDeepScanAll and handleStopDeepScanAll in handlers.js
- [ ] Add logic to show/hide Stop Deep Scan button in button-visibility.js
- [ ] Test complete workflow: confirmation, multi-page scan, badge updates, stop button, notifications