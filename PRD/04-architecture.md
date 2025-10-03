## 4. Architecture

**MV3 Components**

* **Manifest.json**: permissions → `storage`, `scripting`, `downloads`, `activeTab`, `tabs` + LinkedIn host permissions.
* **Content Script**: runs `scrapeLinkedInResults()` only on-demand (injected at runtime via `scripting.executeScript`).
* **Popup UI**:

  * Buttons: *Scan*, *View Leads*, *Evaluate Leads*, *Generate AI Query*, *Open in Tab*, *Export CSV*, *Export JSON*, *Clear*.
  * Inline status banner and leads displayed in responsive card layout.
  * Compact popup view with "Open in Tab" option for expanded workspace.
* **Full-Page View** (`leads.html`):

  * Standalone tab view accessible via "Open in Tab" button.
  * Larger viewport with same functionality as popup.
  * Responsive card grid layout optimized for desktop viewing.
  * Persistent view (doesn't close when clicking outside).
  * Displays lead count in header.
* **Modular Architecture**:

  * `popup/ui.js`: UI rendering and DOM manipulation (card-based lead display).
  * `popup/handlers.js`: Event handler business logic for all user actions.
  * `popup/chrome-utils.js` (Chrome) / `popup/browser-utils.js` (Firefox): Browser extension API interactions.
  * `popup/browser-api.js` (Firefox): Cross-browser compatibility layer.
* **Storage Service**: wrapper for browser `storage.local` with API key helpers.
* **Evaluation Service**: wrapper for OpenAI calls with progress callbacks and error handling.
* **Export Service**: CSV/JSON helpers + `downloads` trigger.
* **AI Query Service**: wrapper for OpenAI calls to generate LinkedIn search queries from ICP descriptions.

**Browser Targets**

* Chrome MV3 build (uses `chrome.*`).
* Firefox MV3 build (wraps `browser`/`chrome` interop; Gecko-specific manifest ID).

**Flow Diagram (MVP):**

```
User → Popup [Scan]
     → Content Script [scrapeLinkedInResults()]
     → Popup → Storage [saveLeads()]
     → Popup [View] → Render cards
     → Popup [Open in Tab] → Full-page view in new tab
     → Popup [Generate AI Query] → OpenAI API → Inject into LinkedIn search box
     → Popup [Export] → CSV/JSON file via downloads API
     → (Optional) Eval Service → OpenAI API → Storage → Update cards
     → Popup [Clear] → Storage.reset()
```
