# Cross-Browser Architecture

## Overview
This extension uses a granular API re-export pattern to maintain a single codebase that works across Chrome and Firefox.

## Structure

```
linkedin-extension/
├── chrome/
│   ├── api/                    # Chrome-specific API wrappers
│   │   ├── tabs.js            → export const tabs = chrome.tabs
│   │   ├── storage.js         → export const storage = chrome.storage
│   │   ├── runtime.js         → export const runtime = chrome.runtime
│   │   ├── notifications.js   → export const notifications = chrome.notifications
│   │   ├── scripting.js       → export const scripting = chrome.scripting
│   │   └── action.js          → export const action = chrome.action
│   ├── popup/
│   ├── background/
│   ├── scripts/
│   └── manifest.json          # Chrome-specific manifest
│
└── firefox/
    ├── api/                    # Firefox-specific API wrappers
    │   ├── tabs.js            → export const tabs = browser.tabs
    │   ├── storage.js         → export const storage = browser.storage
    │   ├── runtime.js         → export const runtime = browser.runtime
    │   ├── notifications.js   → export const notifications = browser.notifications
    │   ├── scripting.js       → export const scripting = browser.scripting
    │   └── action.js          → export const action = browser.action
    ├── popup/                  # IDENTICAL to chrome/popup/
    ├── background/             # IDENTICAL to chrome/background/
    ├── scripts/                # IDENTICAL to chrome/scripts/
    └── manifest.json           # Firefox-specific manifest
```

## Key Principle

### Same Import Paths, Different Implementations

**All business logic** imports from `../api/` or `../../api/`:

```javascript
// chrome/popup/handlers.js (and firefox/popup/handlers.js - IDENTICAL!)
import { tabs } from '../../api/tabs.js';
import { runtime } from '../../api/runtime.js';

await tabs.query({ active: true });
await runtime.sendMessage({ type: 'SCAN' });
```

**Only the `api/` folder differs:**

```javascript
// chrome/api/tabs.js
export const tabs = chrome.tabs;

// firefox/api/tabs.js
const browserApi = globalThis.browser ?? globalThis.chrome;
export const tabs = browserApi.tabs;
```

## Benefits

1. ✅ **Single Source of Truth**: Business logic exists only once
2. ✅ **Trivial Sync**: Copy files directly - no string replacements
3. ✅ **Clean Code**: No `if (isChrome)` checks scattered everywhere
4. ✅ **Type Safety**: Import paths are consistent
5. ✅ **Easy Updates**: Edit in Chrome, copy to Firefox

## Workflow

### When Updating Code:

1. Edit files in `chrome/` (except `api/` and `manifest.json`)
2. Run `./sync-to-firefox.sh` to copy to Firefox
3. Done! ✅

### When Adding New API:

1. Create new module in `chrome/api/` (e.g., `downloads.js`)
2. Create matching module in `firefox/api/`
3. Import and use in business logic

## API Modules

### Current Modules:
- **tabs.js** - Tab management (query, create, update, reload)
- **storage.js** - Local/sync storage
- **runtime.js** - Messaging, URLs (sendMessage, getURL, onMessage)
- **notifications.js** - System notifications
- **scripting.js** - Content script injection (executeScript)
- **action.js** - Badge management (setBadgeText, setBadgeBackgroundColor)

### Adding New Modules:

```javascript
// chrome/api/downloads.js
export const downloads = chrome.downloads;

// firefox/api/downloads.js
const browserApi = globalThis.browser ?? globalThis.chrome;
export const downloads = browserApi.downloads;

// Usage in any file (chrome OR firefox):
import { downloads } from '../../api/downloads.js';
await downloads.download({ url, filename });
```

## Important: Manifest Differences

### Background Scripts

**Chrome (MV3):**
```json
"background": {
  "service_worker": "background.js",
  "type": "module"
}
```

**Firefox (MV3):**
```json
"background": {
  "scripts": ["background.js"],
  "type": "module"
}
```

Firefox MV3 still uses the `scripts` array format (not `service_worker`). This is the main manifest difference between browsers.

## Files That Are Browser-Specific

### Never Copy These:
- `chrome/api/*` → Chrome-specific
- `firefox/api/*` → Firefox-specific
- `chrome/manifest.json` → Chrome manifest v3
- `firefox/manifest.json` → Firefox manifest v2/v3

### Always Safe to Copy:
- Everything in `popup/` (except `api/`)
- Everything in `background/` (except `api/`)
- Everything in `scripts/`
- Everything in `styles/`
- `popup.html`, `popup.css`, `popup.js`
- `leads.html`, `leads.css`, `leads.js`

## Maintenance Commands

```bash
# Sync all changes from Chrome to Firefox
./sync-to-firefox.sh

# Check for files over 100 lines
find chrome -name "*.js" -exec wc -l {} \; | awk '$1 > 100'
find firefox -name "*.js" -exec wc -l {} \; | awk '$1 > 100'
```

## Future Enhancements

### If We Need More Granularity:

Instead of:
```javascript
import { tabs } from '../../api/tabs.js';
```

We could do:
```javascript
import { query } from '../../api/tabs/query.js';
import { create } from '../../api/tabs/create.js';
```

But current granularity (one file per API namespace) is sufficient.
