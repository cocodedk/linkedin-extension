# Future Enhancements (Post-MVP)

## 1. Smart Pre-filtering
- Auto-detect Danish companies by location
- Prompt to enrich only Danish subset
- Saves time on mixed lead lists

## 2. Match Disambiguation UI
- Show modal when multiple matches
- Display top 3 matches with key details
- Let user pick correct company

## 3. CVR Lookup Cache
- Store CVR → company data mapping
- Avoid duplicate searches
- Add cache expiry (e.g., 30 days)

## 4. P-enhed Support
- Optionally enrich production units
- Show parent company relationship
- Display subsidiary information

## 5. Batch Optimization
- Parallel enrichment (respect rate limits)
- Progress bar with cancel option
- Configurable batch size

## 6. Confidence Scoring
- Score match quality (0-100)
- Show confidence in UI
- Allow manual override

## 7. History Tracking
- Track company data changes
- Show enrichment history
- Re-enrichment suggestions

## Migration Path

**For Existing Users:**
- No breaking changes
- Existing leads display correctly
- New button appears after update
- Export format extends (additive)

**For Developers:**
- Modular structure under `scripts/virk/`
- Follows existing handler pattern
- Storage schema backward compatible
- No core logic changes
