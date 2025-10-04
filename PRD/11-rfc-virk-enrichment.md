# RFC: Virk.dk Company Data Enrichment

## Context

LinkedIn profiles provide valuable lead information (name, headline, location), but company data is limited and often incomplete. For Danish companies, the Central Business Register (CVR) at `datacvr.virk.dk` offers official, structured company information including CVR numbers, addresses, company form, and status. Enriching LinkedIn leads with verified CVR data improves lead quality and provides sales teams with authoritative company information.

## Problem Statement

* Company names extracted from LinkedIn may be informal, abbreviated, or inconsistent
* LinkedIn doesn't provide CVR numbers, official addresses, or company registration details
* Sales teams need verified company information for Danish prospects
* Manual lookup on virk.dk for each lead is time-consuming and error-prone

## Goals

* Automatically search virk.dk using company names extracted from LinkedIn
* Navigate to the first matching company result (prioritize "virksomheder" entity type)
* Extract official company data: CVR number, full address, postal code/city, start date, company form, status
* Augment LinkedIn lead records with virk.dk data
* Handle cases where no match or multiple matches are found

## Non-Goals

* Searching for non-Danish companies (virk.dk only covers Denmark)
* Automatic enrichment without user action (keep manual trigger for MVP)
* Deep scraping of subsidiary or P-enhed data
* Historical company data or change tracking

## User Flow

1. User scrapes LinkedIn leads normally (existing flow)
2. User clicks new `Enrich with Virk` button in popup
3. Extension iterates through leads with company names:
   - Opens virk.dk search in background tab
   - Fills search input with company name
   - Submits search
   - Filters results to "virksomheder" only
   - If exactly 1 result found, navigates to company detail page
   - Extracts: CVR, address, postal code/city, start date, company form, status
   - Augments lead record with virk data
4. Status updates show progress: "Enriching 5/15 leads..."
5. Leads display updated with virk.dk data fields
6. Export includes new virk.dk columns

## Data Schema Extension

Extend lead object with optional virk fields:

```js
{
  // Existing LinkedIn fields
  name: "John Doe",
  headline: "CEO at Level7",
  company: "Level7",
  location: "Copenhagen",
  profileUrl: "https://linkedin.com/in/...",

  // New virk.dk fields
  virkCvrNumber: "39516446",
  virkAddress: "Københavnsvej 19B",
  virkPostalCode: "4000",
  virkCity: "Roskilde",
  virkStartDate: "17.04.2018",
  virkCompanyForm: "Anpartsselskab",
  virkStatus: "Normal",
  virkEnriched: true,           // Flag indicating virk lookup succeeded
  virkEnrichmentDate: "2025-10-04T12:34:56Z"
}
```

## Technical Approach

### 1. Search Execution on virk.dk

```js
async function searchVirkCompany(companyName) {
  const input = document.querySelector('input#forside-soegefelt-id');
  const searchBtn = document.querySelector('button[data-cy="forside-soegefelt-btn"]');

  if (!input || !searchBtn) {
    return { success: false, error: 'Search elements not found' };
  }

  input.value = companyName;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  searchBtn.click();

  return { success: true };
}
```

### 2. Filter to "Virksomheder" Results

```js
async function filterToCompanies() {
  // Wait for results to load
  await new Promise(resolve => setTimeout(resolve, 2000));

  const virksomhedFilter = document.querySelector(
    'label[data-cy="soegeresultater-enhedstype-filter-virksomhed"]'
  );

  if (!virksomhedFilter) {
    return { success: false, error: 'No virksomheder filter found' };
  }

  const countMatch = virksomhedFilter.textContent.match(/\((\d+)\)/);
  const count = countMatch ? parseInt(countMatch[1], 10) : 0;

  if (count === 0) {
    return { success: false, error: 'No companies found' };
  }

  if (count > 1) {
    return { success: false, error: 'Multiple companies found', count };
  }

  // Click filter to show only companies
  virksomhedFilter.click();

  return { success: true, count: 1 };
}
```

### 3. Navigate to Company Detail

```js
async function navigateToCompanyDetail() {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const detailLink = document.querySelector(
    'a.button.button-unstyled[aria-label*="Vis mere"]'
  );

  if (!detailLink) {
    return { success: false, error: 'Detail link not found' };
  }

  const href = detailLink.getAttribute('href');
  if (!href || !href.includes('/enhed/virksomhed/')) {
    return { success: false, error: 'Invalid company detail link' };
  }

  window.location.href = href;
  return { success: true };
}
```

### 4. Extract Company Data

```js
function extractVirkCompanyData() {
  const getData = (className) => {
    const el = document.querySelector(`.${className}`);
    return el?.textContent?.trim() ?? null;
  };

  return {
    cvrNumber: getData('cvrnummer'),
    address: getData('stamdata-bygningsnummer')?.replace(/\s+/g, ' '),
    postalCodeCity: getData('postnummerOgBy'),
    startDate: getData('start-dato'),
    companyForm: document.querySelector('.col-6.col-lg-9.break-word')?.textContent?.trim(),
    status: getData('virksomhed-status-label'),
    reklamebeskyttelse: getData('ja-label0')?.includes('Ja')
  };
}
```

## File Structure

Add new virk-specific modules:

```
scripts/
  virk/
    virk-scraper.js       # Extract company data from virk.dk pages
    virk-search.js        # Search and navigation logic
    virk-selectors.js     # DOM selectors for virk.dk
    virk-enrichment.js    # Orchestration: search → navigate → extract
```

Update existing files:

```
popup/handlers/
  virk-handler.js         # Handle "Enrich with Virk" button click
scripts/
  storage.js              # Extend schema to support virk fields
scripts/
  exporters.js            # Include virk columns in CSV/JSON export
```

## UI Changes

### Popup Button

Add new button after "Evaluate Leads":

```html
<button id="enrich-virk-btn" class="action-button">
  🇩🇰 Enrich with Virk
</button>
```

### Lead Card Display

Show virk data in cards when available:

```
┌─────────────────────────────────┐
│ John Doe                        │
│ CEO @ Level7 • Copenhagen       │
│ AI Score: 85                    │
│                                 │
│ 🏢 CVR: 39516446               │
│ 📍 Københavnsvej 19B, 4000     │
│ 📅 Started: 17.04.2018         │
│ 📋 Anpartsselskab (Normal)     │
└─────────────────────────────────┘
```

### Status Messages

```
"Enriching with Virk.dk data... (3/15)"
"✅ Enriched 12 leads, 3 not found"
"⚠️ Multiple matches for 2 companies"
```

## Permissions Required

Update `manifest.json`:

```json
{
  "permissions": ["storage", "scripting", "downloads", "activeTab", "tabs"],
  "host_permissions": [
    "https://*.linkedin.com/*",
    "https://datacvr.virk.dk/*"
  ]
}
```

## Error Handling

| Scenario | Behavior |
|----------|----------|
| No company name in lead | Skip, show warning in status |
| No search results | Mark lead with `virkEnriched: false` |
| Multiple companies found | Log count, skip enrichment, notify user |
| Search timeout | Retry once, then skip with error |
| DOM selectors changed | Graceful failure with error message |

## Risks & Mitigations

* **virk.dk DOM changes**: Abstract selectors into constants file for easy updates
* **Rate limiting**: Add 2-second delay between searches; consider user warning for large batches
* **Non-Danish companies**: Skip enrichment if location doesn't contain Denmark/DK indicators
* **Multiple matches**: Require exact match or skip (avoid wrong company data)
* **Privacy/ToS**: Keep user-initiated, respect reklamebeskyttelse flag

## Metrics

* Enrichment success rate (% of leads successfully enriched)
* Average time per lead enrichment
* Error breakdown (no results, multiple matches, timeouts)
* User adoption (% of sessions using virk enrichment)

## Open Questions

1. Should we auto-detect Danish companies by location and prompt enrichment?
2. Handle P-enheder (production units) or only parent companies?
3. Support manual company selection when multiple matches found?
4. Cache CVR lookups to avoid duplicate searches?
