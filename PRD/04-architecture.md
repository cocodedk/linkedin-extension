## 4. Architecture

**MV3 Components**

* **Manifest.json**: permissions → `storage`, `scripting`, `downloads`, `activeTab`, `tabs` + LinkedIn host permissions.
* **Content Script**: runs `scrapeLinkedInResults()` only on-demand (injected at runtime via `scripting.executeScript`).
* **Popup UI**:

  * Buttons: *Scan*, *View Leads*, *Evaluate Leads*, *Export CSV*, *Export JSON*, *Clear*.
  * Inline status banner and leads table with AI columns.
* **Storage Service**: wrapper for browser `storage.local` with API key helpers.
* **Evaluation Service**: wrapper for OpenAI calls with progress callbacks and error handling.
* **Export Service**: CSV/JSON helpers + `downloads` trigger.

**Browser Targets**

* Chrome MV3 build (uses `chrome.*`).
* Firefox MV3 build (wraps `browser`/`chrome` interop; Gecko-specific manifest ID).

**Flow Diagram (MVP):**

```
User → Popup [Scan]
     → Content Script [scrapeLinkedInResults()]
     → Popup → Storage [saveLeads()]
     → Popup [View] → Render table
     → Popup [Export] → CSV/JSON file via downloads API
     → (Optional) Eval Service → OpenAI API → Storage → Table
     → Popup [Clear] → Storage.reset()
```
