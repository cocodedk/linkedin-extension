# Testing Checklist

## Functional Tests

- [ ] Search Danish company on virk.dk
- [ ] Filter to "virksomheder" correctly
- [ ] Extract all 7 company fields
- [ ] Handle no results gracefully
- [ ] Handle multiple matches gracefully
- [ ] Update lead cards with Virk data
- [ ] Export CSV includes Virk columns
- [ ] Export JSON includes Virk fields
- [ ] Status messages show progress
- [ ] Works in both Chrome and Firefox
- [ ] Doesn't break non-Danish leads
- [ ] Re-scanning preserves Virk data

## Edge Cases

**Empty Company Name**
- Expected: Skip immediately, no search

**Network Timeout**
- Expected: Retry once, then skip with error message

**DOM Selector Changes**
- Expected: Log error, skip lead, continue with next

**Privacy-Protected Companies**
- Expected: Extract available data, note protection status

**Multiple Leads, Same Company**
- Expected: Search each time (no caching in MVP)

**Re-scan After Enrichment**
- Expected: Preserve Virk data, only update LinkedIn fields

## Success Metrics

- **Enrichment rate**: >80% for Danish companies
- **Accuracy**: Manual verification of 10 random leads
- **Performance**: <5 seconds per lead
- **Error rate**: <10% failures

## Non-Goals (YAGNI)

- ❌ Automatic enrichment
- ❌ P-enheder enrichment
- ❌ Multiple match UI
- ❌ Historical data
- ❌ CVR lookup cache
- ❌ Other country registries
