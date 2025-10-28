just answer the question and make no changes to the code. make the answer short and to the point.

## Fix Applied

Updated Chrome extension selectors to work with LinkedIn's new HTML structure:

### Changes Made:

1. **CARD_SELECTOR**: Added `a[href*="/in/"][data-view-name]` to match the new card structure
2. **NAME_SELECTOR**: Added `a[data-view-name="search-result-lockup-title"]` and improved `img[alt]` handling
3. **PROFILE_LINK_SELECTOR**: Added `a[data-view-name="search-result-lockup-title"][href*="/in/"]`
4. **HEADLINE_SELECTOR**: Added `p:has(a[data-view-name="search-result-lockup-title"]) + p` for structural selection
5. **LOCATION_SELECTOR**: Added `p:has(a[data-view-name="search-result-lockup-title"]) + p + p` for structural selection
6. **card-scraper.js**: Enhanced to properly handle IMG elements when extracting names

### Files Modified:
- `/chrome/scripts/scraper/selectors.js`
- `/chrome/scripts/scraper/card-scraper.js`

The "Scan Results" feature should now correctly pick up profiles from the new LinkedIn search results page.
