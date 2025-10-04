## 5. MVP Scope vs Future Scope

**Included (MVP):**

* Manual scan of *current page* results (Chrome + Firefox).
* Save & dedupe in local storage with company field support.
* Export CSV/JSON with AI insights and virk.dk company data.
* OpenAI eval with manual API key entry, per-lead status feedback.
* Card-based lead viewer in popup and full-page tab view.
* "Open in Tab" feature for expanded workspace viewing.
* AI-assisted search query generation from ICP descriptions.
* Virk.dk company enrichment for Danish companies (CVR, address, company form, status).
* Sequential enrichment with progress updates and error handling.
* Modular codebase with separated concerns (UI, handlers, browser utils).
* Clear/reset functionality with confirmation dialog.

**Excluded (future YAGNI):**

* Auto-pagination or scrolling.
* Auto-message or connection invites.
* Multi-user sync.
* Cloud backend.
* Offline/queued evaluations.
* Automatic virk.dk enrichment (requires manual trigger).
* Support for non-Danish company registries.
* Manual company selection when multiple virk.dk matches found.
* P-enheder (production unit) enrichment.
* Historical company data or change tracking.
