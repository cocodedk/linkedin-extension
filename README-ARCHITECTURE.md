# Architecture Snapshot

## Core Idea
- Business logic never calls `chrome.*` directly.
- Thin modules in `chrome/api/` re-export the pieces of the Chrome namespace that features rely on.
- Feature files import from `../api/` so browser integration lives in one place.

```javascript
// chrome/api/runtime.js
export const runtime = chrome.runtime;

// usage
import { runtime } from '../../api/runtime.js';
await runtime.sendMessage({ type: 'SCAN' });
```

## Daily Workflow
1. Edit code under `chrome/` (UI, background scripts, utilities).
2. Reload the unpacked extension via `chrome://extensions/`.

## Extending API Coverage
1. Add a wrapper, e.g. `chrome/api/downloads.js`.
2. Re-export the namespace (`export const downloads = chrome.downloads;`).
3. Import the module where needed.

## Maintenance Reminders
- Keep manifest changes confined to `chrome/manifest.json`.
- Use `find chrome -name "*.js" -exec wc -l {} \; | awk '$1 > 100'` to spot large files worth refactoring.
