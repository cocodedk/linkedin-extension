# Chrome Extension Architecture

## Overview
The extension isolates every browser API behind lightweight re-export modules. Business logic imports from these modules instead of calling `chrome.*` directly, which keeps the codebase modular and easy to maintain.

## Structure

```
linkedin-extension/
└── chrome/
    ├── api/                    # Thin wrappers around chrome.* namespaces
    │   ├── tabs.js
    │   ├── storage.js
    │   ├── runtime.js
    │   ├── notifications.js
    │   ├── scripting.js
    │   └── action.js
    ├── background/             # Background service worker code
    ├── popup/                  # Popup UI and handlers
    ├── scripts/                # Content scripts injected into LinkedIn
    ├── styles/                 # Shared styling
    └── manifest.json           # Chrome manifest (MV3)
```

## API Re-Exports

All feature code uses import paths scoped to the `api/` directory:

```javascript
import { tabs } from '../../api/tabs.js';
import { runtime } from '../../api/runtime.js';
```

The wrapper files expose the underlying Chrome namespace:

```javascript
// chrome/api/tabs.js
export const tabs = chrome.tabs;
```

Using these wrappers centralises every browser-specific touchpoint and keeps non-API code platform agnostic.

## Benefits

1. ✅ Centralised surface area for browser APIs
2. ✅ Business logic remains testable and portable
3. ✅ Quick to add new API coverage without touching existing features

## Workflow

1. Edit files under `chrome/` (excluding `api/` unless you need new wrappers).
2. Reload the unpacked extension in Chrome to pick up changes.

## Adding New API Modules

1. Create a wrapper, e.g.:
   ```javascript
   // chrome/api/downloads.js
   export const downloads = chrome.downloads;
   ```
2. Import it where needed:
   ```javascript
   import { downloads } from '../../api/downloads.js';
   await downloads.download({ url, filename });
   ```

## Maintenance Commands

```bash
# Check for large JS files
find chrome -name "*.js" -exec wc -l {} \; | awk '$1 > 100'
```
