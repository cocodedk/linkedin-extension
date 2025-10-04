## 3. Functional Requirements

### 3.1 Core Features

1. **Scrape LinkedIn Search Results (MVP)**

   * Extract visible results: name, headline, derived employer, location, profile URL.
   * Fallback selectors cover both the legacy and the new reusable search layouts and prioritize LinkedIn People cards.
   * Pseudo-code:

     ```js
     function scrapeLinkedInResults() {
       const PROFILE_PATTERNS = [/\/in\//i, /\/profile\/view/i, /\/sales\//i];
       const CARD_SELECTOR = '[data-view-name="search-entity-result-universal-template"], [data-chameleon-result-urn], .reusable-search__result-container, .search-result__wrapper';
       const cards = document.querySelectorAll(CARD_SELECTOR);
       const normalise = (node) => node?.textContent?.replace(/\s+/g, ' ').trim() ?? '';

       const deriveCompany = ({ summaryText, headlineText }) => {
         const sources = [summaryText, headlineText].filter(Boolean);
         for (const text of sources) {
           const atMatch = text.match(/\bat\s+([^•|,;:]+)/i);
           if (atMatch?.[1]) return atMatch[1].trim();
           const atSymbol = text.match(/@\s*([^•|,;:]+)/);
           if (atSymbol?.[1]) return atSymbol[1].trim();
         }
         return sources[0] ?? '';
       };

       const rawLeads = Array.from(cards).map((card) => {
         const profileLink = Array.from(card.querySelectorAll('a[href*="linkedin.com/"]'))
           .find((anchor) => PROFILE_PATTERNS.some((pattern) => pattern.test(anchor.href))) ?? {};
         return {
           name: normalise(profileLink) || normalise(card.querySelector('.entity-result__title-text span, span[dir="ltr"]')),
           headline: normalise(card.querySelector('.entity-result__primary-subtitle, .linked-area .t-14.t-normal')),
           company: deriveCompany({
             summaryText: normalise(card.querySelector('.entity-result__summary--2-lines, .entity-result__summary-list li, .entity-result__primary-subtitle')),
             headlineText: normalise(card.querySelector('.entity-result__primary-subtitle, .linked-area .t-14.t-normal'))
           }),
           location: normalise(card.querySelector('.entity-result__secondary-subtitle, .linked-area .t-12.t-normal')),
           profileUrl: profileLink.href ?? ''
         };
       });

       const leads = rawLeads.filter((lead) => PROFILE_PATTERNS.some((pattern) => pattern.test(lead.profileUrl)));
       return {
         leads,
         debugInfo: {
           cardCount: cards.length,
           leadsBeforeFilter: rawLeads.length,
           leadsAfterFilter: leads.length,
           missingProfileUrl: rawLeads.length - leads.length
         }
       };
     }
     ```

2. **Local Storage of Leads**

   * Deduplicate/merge by `profileUrl`, retaining existing metadata and AI annotations.
   * Use browser `storage.local` for simplicity (Chrome build uses `chrome`, Firefox build resolves `browser || chrome`).
   * Pseudo-code:

     ```js
     async function saveLeads(newLeads) {
       const { leads = [] } = await browser.storage.local.get('leads');
       const map = new Map(leads.map((lead) => [lead.profileUrl, lead]));
       newLeads.forEach((lead) => {
         if (!lead.profileUrl) return;
         map.set(lead.profileUrl, { ...map.get(lead.profileUrl), ...lead });
       });
       const deduped = Array.from(map.values());
       await browser.storage.local.set({ leads: deduped });
       return deduped;
     }
     ```

3. **Export Functionality**

   * Export stored leads to CSV or JSON with `aiScore`, `aiReasons`, and `aiFitSummary` fields.
   * Trigger a `downloads.download` action with `saveAs: true` so the user confirms the filename.
   * Pseudo-code:

     ```js
     function exportCsv(leads) {
       const headers = ['name','headline','company','location','profileUrl','aiScore','aiReasons','aiFitSummary'];
       const rows = leads.map((lead) => headers.map((h) => `"${String(lead?.[h] ?? '').replace(/"/g,'""')}"`).join(','));
       return [headers.join(',')].concat(rows).join('\n');
     }

     async function triggerDownload({ filename, mimeType, content }) {
       const blob = new Blob([content], { type: mimeType });
       const url = URL.createObjectURL(blob);
       await browser.downloads.download({ url, filename, saveAs: true });
       setTimeout(() => URL.revokeObjectURL(url), 1000);
     }
     ```

4. **Optional OpenAI Evaluation**

   * Allow user to enter OpenAI API key in settings (persisted, editable, optional).
   * Evaluate lead fit → add `aiScore`, `aiReasons`, and `aiFitSummary` per lead.
   * Stream status updates in the popup during sequential evaluation.
   * Pseudo-code:

     ```js
     async function evaluateLead(lead, apiKey) {
       const response = await fetch('https://api.openai.com/v1/chat/completions', {
         method: 'POST',
         headers: {
           Authorization: `Bearer ${apiKey}`,
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           model: 'gpt-4o-mini',
           messages: [
             { role: 'system', content: 'You are an assistant evaluating prospects for FITS, a GRC automation tool. Respond with JSON containing aiScore (0-100), aiReasons, aiFitSummary.' },
             { role: 'user', content: `Evaluate how well FITS fits this lead. Respond ONLY in JSON.\nLead: ${JSON.stringify(lead)}` }
           ]
         })
       });
       const text = (await response.json())?.choices?.[0]?.message?.content ?? '';
       try {
         const parsed = JSON.parse(text);
         return {
           ...lead,
           aiScore: parsed.aiScore ?? parsed.score ?? null,
           aiReasons: parsed.aiReasons ?? parsed.reasons ?? text,
           aiFitSummary: parsed.aiFitSummary ?? parsed.fitSummary ?? ''
         };
       } catch (error) {
         return {
           ...lead,
           aiScore: null,
           aiReasons: text || error.message,
           aiFitSummary: 'No FITS summary available.'
         };
       }
     }
     ```

5. **Lead Management UI**

   * Popup table shows stored leads instantly when opened or refreshed.
   * `View Leads` reloads storage without rescanning.
   * `Clear` (trash icon) wipes stored leads for a clean slate.
   * Status bar communicates scan, export, and evaluation state with success/warning/error styling.

6. **Virk.dk Company Enrichment (Danish Companies)**

   * Allow user to enrich leads with official Danish company data from datacvr.virk.dk.
   * For each lead with a company name, search virk.dk and extract CVR data.
   * Filter results to "virksomheder" (companies), skip if 0 or multiple matches.
   * Navigate to first matching company detail page and extract:
     - CVR number
     - Official address (street, building)
     - Postal code and city
     - Company start date
     - Company form (e.g., Anpartsselskab, Aktieselskab)
     - Company status (e.g., Normal, Under konkurs)
   * Augment lead records with virk fields: `virkCvrNumber`, `virkAddress`, `virkPostalCode`, `virkCity`, `virkStartDate`, `virkCompanyForm`, `virkStatus`, `virkEnriched`, `virkEnrichmentDate`.
   * Stream status updates during enrichment: "Enriching 5/15 leads...".
   * Handle errors gracefully: no results, multiple matches, timeouts.
   * Pseudo-code:

     ```js
     async function enrichLeadWithVirk(lead) {
       if (!lead.company) {
         return { ...lead, virkEnriched: false };
       }

       // Search virk.dk
       await executeScriptOnTab(virkTab, `
         const input = document.querySelector('input#forside-soegefelt-id');
         const btn = document.querySelector('button[data-cy="forside-soegefelt-btn"]');
         input.value = '${lead.company}';
         input.dispatchEvent(new Event('input', { bubbles: true }));
         btn.click();
       `);

       await sleep(2000); // Wait for results

       // Check company count
       const filterResult = await executeScriptOnTab(virkTab, `
         const label = document.querySelector('label[data-cy="soegeresultater-enhedstype-filter-virksomhed"]');
         const match = label?.textContent?.match(/\\((\\d+)\\)/);
         return match ? parseInt(match[1]) : 0;
       `);

       if (filterResult !== 1) {
         return { ...lead, virkEnriched: false };
       }

       // Navigate to detail page
       await executeScriptOnTab(virkTab, `
         const link = document.querySelector('a[href*="/enhed/virksomhed/"]');
         if (link) window.location.href = link.href;
       `);

       await sleep(2000);

       // Extract company data
       const virkData = await executeScriptOnTab(virkTab, `
         const get = (cls) => document.querySelector('.' + cls)?.textContent?.trim() ?? null;
         return {
           cvrNumber: get('cvrnummer'),
           address: get('stamdata-bygningsnummer'),
           postalCodeCity: get('postnummerOgBy'),
           startDate: get('start-dato'),
           companyForm: document.querySelector('.col-6.col-lg-9.break-word')?.textContent?.trim(),
           status: get('virksomhed-status-label')
         };
       `);

       return {
         ...lead,
         virkCvrNumber: virkData.cvrNumber,
         virkAddress: virkData.address,
         virkPostalCode: virkData.postalCodeCity?.split(' ')[0],
         virkCity: virkData.postalCodeCity?.split(' ').slice(1).join(' '),
         virkStartDate: virkData.startDate,
         virkCompanyForm: virkData.companyForm,
         virkStatus: virkData.status,
         virkEnriched: true,
         virkEnrichmentDate: new Date().toISOString()
       };
     }
     ```

### 3.2 Non-Functional Requirements

* **SOLID**:

  * Scraping logic isolated from storage, evaluation, exports, and UI (Single Responsibility).
  * Interface segregation: popup UI only talks to service layer, not DOM selectors.
* **DRY**: Shared `scripts/` modules power both browser builds; selectors/constants live in one place.
* **YAGNI**: No background scraping, no auto-connect, no advanced scheduling.
* **Performance**: Handle 50–100 results/page without freezing popup; sequential AI calls can be cancelled if needed.
* **Security**: Never hardcode API keys. Store user-supplied keys only.
* **Cross-browser parity**: Keep Chrome/Firefox feature sets aligned by reusing modules and abstracting the browser API.
