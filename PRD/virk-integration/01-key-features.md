# Key Features

## User-Facing

### "Enrich with Virk" Button
- Manual trigger (YAGNI principle)
- Progress updates: "Enriching 5/15 leads..."
- Completion summary: "✅ Enriched 12 leads, 3 not found"

### Enhanced Lead Cards
- 🏢 CVR number
- 📍 Official address (street, postal, city)
- 📋 Company form (Anpartsselskab, etc.)
- ✅ Company status (Normal, etc.)
- Clean fallback for non-Danish companies

### Extended Export
- 9 new CSV columns
- JSON includes Virk fields
- Backward compatible

## Technical

### Modular Architecture
```
scripts/virk/
  ├── virk-selectors.js    (~40 lines)
  ├── virk-scraper.js      (~70 lines)
  ├── virk-search.js       (~60 lines)
  └── virk-enrichment.js   (~90 lines)
popup/handlers/
  └── virk-handler.js      (~50 lines)
```

### Smart Matching
- 0 results → Skip
- 1 result → Enrich
- 2+ results → Skip (avoid false positives)

### Data Schema (9 Fields)
- `virkCvrNumber`, `virkAddress`, `virkPostalCode`, `virkCity`
- `virkStartDate`, `virkCompanyForm`, `virkStatus`
- `virkEnriched` (boolean), `virkEnrichmentDate` (ISO 8601)

### Performance
- Sequential processing (2-second delays)
- Single background tab
- Real-time progress updates
