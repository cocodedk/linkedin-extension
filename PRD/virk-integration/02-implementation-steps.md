# Implementation Steps

## Phase 1: Core Scraping

### 1. virk-selectors.js (~40 lines)
Define DOM selectors:
- Search form: input, button
- Results: filter, count, links
- Detail page: CVR, address, status, etc.

### 2. virk-scraper.js (~70 lines)
Functions:
- `extractCompanyData()` - Parse detail page
- `getCompanyCount()` - Read result count
- `getFirstCompanyLink()` - Get detail URL

### 3. virk-search.js (~60 lines)
Functions:
- `searchCompany(name)` - Submit search
- `filterToCompanies()` - Click filter
- `navigateToDetail(url)` - Navigate to page

## Phase 2: Orchestration

### 4. virk-enrichment.js (~90 lines)
Functions:
- `enrichLeadWithVirk(lead, tabId)` - Single lead
- `enrichAllLeads(leads, callback)` - Batch processing

### 5. virk-handler.js (~50 lines)
Workflow:
- Get leads → Create tab → Enrich → Save → Close tab → Update UI

## Phase 3: Integration

### 6. Extend storage.js (~20 lines)
- Accept Virk fields
- Preserve on merge

### 7. Extend exporters.js (~10 lines)
- Add CSV columns
- Add JSON fields

### 8. Update UI (~30 lines)
- Add button to HTML
- Wire handler
- Update card display

### 9. Update manifest.json (2 lines)
- Add `https://datacvr.virk.dk/*` to permissions

## Phase 4: Testing

### 10. Manual Testing
- Danish company → Enrich
- US company → Skip
- Multiple matches → Skip
- Export → Verify columns

### 11. Edge Cases
- Empty company name
- Network timeout
- DOM changes
- Privacy-protected companies
