# **PRD – LinkedIn Lead Exporter & Evaluator (MVP)**

## 1. Vision

Enable B2B users (e.g. sales, compliance tool marketers) to extract useful lead information from LinkedIn search results with **one click**, store it locally, optionally evaluate leads via OpenAI, and export them for further use (e.g. CRM import).

**MVP promise:**

* Scrape current page’s visible LinkedIn search results.
* Save leads in browser storage.
* (Optional) Enrich/evaluate leads via OpenAI API.
* Export as CSV/JSON.

No unnecessary bells & whistles (YAGNI).

---

## 2. Users & Use Cases

* **Sales/Marketing rep**: wants to quickly gather leads from LinkedIn searches.
* **Startup founder**: tests audience fit by collecting and scoring potential customers.
* **GRC automation vendor**: collects personas (CISO, Risk Manager, Compliance Lead) and runs quick fit scoring with AI.

**User Journey:**

1. User navigates to LinkedIn → performs a search.
2. Opens Chrome extension popup → clicks *“Scan Results”*.
3. Leads are extracted and stored in extension memory.
4. User can:

   * View leads in popup table (basic).
   * Evaluate them with OpenAI API (optional toggle).
   * Export as CSV/JSON.

---

## 3. Functional Requirements

### 3.1 Core Features

1. **Scrape LinkedIn Search Results (MVP)**

   * Extract visible results: name, headline, company, location, profile URL.
   * Pseudo-code:

     ```js
     function scrapeLinkedInResults() {
       const cards = document.querySelectorAll('.search-result__wrapper, .reusable-search__result-container');
       return Array.from(cards).map(c => ({
         name: c.querySelector('span[dir="ltr"]')?.innerText ?? '',
         headline: c.querySelector('.entity-result__primary-subtitle')?.innerText ?? '',
         location: c.querySelector('.entity-result__secondary-subtitle')?.innerText ?? '',
         profileUrl: c.querySelector('a[href*="/in/"]')?.href ?? ''
       }));
     }
     ```

2. **Local Storage of Leads**

   * Deduplicate by `profileUrl`.
   * Use `chrome.storage.local` for simplicity.
   * Pseudo-code:

     ```js
     async function saveLeads(newLeads) {
       const { leads = [] } = await chrome.storage.local.get('leads');
       const map = new Map(leads.map(l => [l.profileUrl, l]));
       newLeads.forEach(l => map.set(l.profileUrl, {...map.get(l.profileUrl), ...l}));
       await chrome.storage.local.set({ leads: [...map.values()] });
     }
     ```

3. **Export Functionality**

   * Export stored leads to CSV or JSON.
   * Pseudo-code:

     ```js
     function exportCsv(leads) {
       const headers = ['name','headline','company','location','profileUrl','aiScore'];
       const rows = leads.map(l => headers.map(h => `"${(l[h]??'').replace(/"/g,'""')}"`).join(','));
       return [headers.join(','), ...rows].join('\n');
     }
     ```

4. **Optional OpenAI Evaluation**

   * Allow user to enter OpenAI API key in settings.
   * Evaluate lead fit → add `aiScore` and `aiReasons`.
   * Pseudo-code:

     ```js
     async function evaluateLead(lead, apiKey) {
       const resp = await fetch("https://api.openai.com/v1/chat/completions", {
         method: "POST",
         headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
         body: JSON.stringify({
           model: "gpt-4o-mini",
           messages: [{ role: "user", content: `Score this lead:\n${JSON.stringify(lead)}` }]
         })
       });
       const text = (await resp.json()).choices[0].message.content;
       try { return {...lead, ...JSON.parse(text)}; } catch { return {...lead, aiScore:0}; }
     }
     ```

---

### 3.2 Non-Functional Requirements

* **SOLID**:

  * Scraping logic isolated from storage & UI (Single Responsibility).
  * Interface segregation: popup UI only talks to service layer, not DOM directly.
* **DRY**: Reuse CSV/JSON conversion utils, avoid duplicate selectors.
* **YAGNI**: No background scraping, no auto-connect, no advanced scheduling.
* **Performance**: Handle 50–100 results/page without freezing popup.
* **Security**: Never hardcode API keys. Store user-supplied keys only.

---

## 4. Architecture

**MV3 Components**

* **Manifest.json**: permissions → `storage`, `scripting`, `downloads`, `activeTab`.
* **Content Script**: runs `scrapeLinkedInResults()` only on-demand.
* **Popup UI**:

  * Buttons: *Scan*, *View Leads*, *Export CSV*, *Settings*.
  * Shows minimal lead table.
* **Storage Service**: wrapper for `chrome.storage.local`.
* **Evaluation Service**: wrapper for OpenAI calls.

**Flow Diagram (MVP):**

```
User → Popup [Scan]
     → Content Script [scrapeLinkedInResults()]
     → Popup → Storage [saveLeads()]
     → Popup [Export] → CSV/JSON file
     → (Optional) Eval Service → OpenAI API → Storage
```

---

## 5. MVP Scope vs Future Scope

**Included (MVP):**

* Manual scan of *current page* results.
* Save & dedupe in local storage.
* Export CSV/JSON.
* OpenAI eval with manual API key entry.

**Excluded (future YAGNI):**

* Auto-pagination or scrolling.
* Auto-message or connection invites.
* Multi-user sync.
* Cloud backend.

---

## 6. UI Sketch

Popup (minimal):

```
+--------------------------------+
| LinkedIn Exporter              |
+--------------------------------+
| [Scan Results]  [View Leads]   |
| [Export CSV]    [Export JSON]  |
|------------------------------- |
| Settings: [ OpenAI Key ____ ]  |
+--------------------------------+
```

---

## 7. Risks & Mitigations

* **LinkedIn ToS**: keep actions user-initiated, low volume.
* **Fragile DOM selectors**: abstract selectors into constants for easy patching.
* **OpenAI key leaks**: store only in `chrome.storage.local`; advise backend proxy for production.

---

## 8. Success Criteria

* A user can:

  * Run a LinkedIn search → click *Scan Results* → see leads appear.
  * Export them to a CSV.
  * Optionally evaluate with OpenAI and see scores in CSV.
* All within <5 clicks, <5 minutes.

Do you want me to also draft the **folder/file structure + stub code layout** (so a dev could bootstrap the extension in one sitting), or keep it PRD-level only?
