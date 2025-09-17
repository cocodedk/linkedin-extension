export function scrapeLinkedInResults() {
  const COMPANY_SELECTOR = '.entity-result__summary-list li, .entity-result__primary-subtitle span';
  const CARD_SELECTOR = [
    '[data-view-name="search-entity-result-universal-template"]',
    '[data-chameleon-result-urn]',
    '.reusable-search__result-container',
    '.search-result__wrapper'
  ].join(', ');
  const NAME_SELECTOR = [
    '.linked-area a[data-test-app-aware-link]:not([aria-hidden="true"]) span',
    '.linked-area a[data-test-app-aware-link]:not([aria-hidden="true"])',
    'span[dir="ltr"]',
    '.entity-result__title-text a span',
    '.entity-result__title-text span',
    '.linked-area a[href*="/in/"] span',
    '.linked-area a[href*="/in/"]'
  ].join(', ');
  const HEADLINE_SELECTOR = [
    '.entity-result__primary-subtitle',
    '.search-result__result-text',
    '.linked-area .t-14.t-black.t-normal',
    '.linked-area [class*="entity-result__primary-subtitle"]'
  ].join(', ');
  const LOCATION_SELECTOR = [
    '.entity-result__secondary-subtitle',
    '.search-result__result-meta',
    '.linked-area .t-12.t-normal',
    '.linked-area .t-12.t-black--light',
    '.linked-area .t-14.t-normal'
  ].join(', ');
  const PROFILE_LINK_SELECTOR = [
    '.linked-area a[data-test-app-aware-link]:not([aria-hidden="true"])',
    'a.app-aware-link[href*="/in/"]',
    'a[href*="/in/"][data-test-app-aware-link]',
    '.linked-area a[href*="/in/"]'
  ].join(', ');
  const PROFILE_URL_PATTERNS = [/\/in\//i, /\/company\//i, /\/school\//i];

  const debugInfo = {
    cardCount: 0,
    leadsBeforeFilter: 0,
    leadsAfterFilter: 0,
    missingProfileUrl: 0
  };

  function normaliseText(node) {
    return node?.textContent?.replace(/\s+/g, ' ')
      ?.trim() ?? '';
  }

  const cards = document.querySelectorAll(CARD_SELECTOR);
  debugInfo.cardCount = cards.length;

  const rawLeads = Array.from(cards).map((card) => {
    const profileElementCandidates = Array.from(card.querySelectorAll(PROFILE_LINK_SELECTOR));
    const profileElement = profileElementCandidates.find((anchor) => {
      const href = anchor?.href ?? '';
      return PROFILE_URL_PATTERNS.some((pattern) => pattern.test(href));
    }) ?? profileElementCandidates[0] ?? null;

    const profileUrl = profileElement?.href ?? '';
    const name = normaliseText(profileElement) || normaliseText(card.querySelector(NAME_SELECTOR));
    const headline = normaliseText(card.querySelector(HEADLINE_SELECTOR));
    const location = normaliseText(card.querySelector(LOCATION_SELECTOR));
    const company = normaliseText(card.querySelector(COMPANY_SELECTOR));

    return {
      name,
      headline,
      company,
      location,
      profileUrl
    };
  });

  debugInfo.leadsBeforeFilter = rawLeads.length;

  const leads = rawLeads.filter((lead) => {
    const hasUrl = PROFILE_URL_PATTERNS.some((pattern) => pattern.test(lead.profileUrl));
    if (!hasUrl) {
      debugInfo.missingProfileUrl += 1;
    }
    return hasUrl;
  });

  debugInfo.leadsAfterFilter = leads.length;

  return { leads, debugInfo };
}
