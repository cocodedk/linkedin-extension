export function scrapeLinkedInResults() {
  const COMPANY_SELECTOR = [
    '.entity-result__summary--2-lines',
    '.entity-result__summary-list li',
    '.entity-result__primary-subtitle',
    '.entity-result__primary-subtitle span'
  ].join(', ');
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
  const PROFILE_URL_PATTERNS = [/\/in\//i, /\/profile\/view/i, /\/sales\//i];

  const debugInfo = {
    cardCount: 0,
    leadsBeforeFilter: 0,
    leadsAfterFilter: 0,
    missingProfileUrl: 0
  };

  function normaliseText(node) {
    if (!node) {
      return '';
    }

    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent?.replace(/\s+/g, ' ')?.trim() ?? '';
    }

    if (!(node instanceof Element)) {
      return String(node?.textContent ?? '').replace(/\s+/g, ' ').trim();
    }

    const clone = node.cloneNode(true);
    clone.querySelectorAll('.visually-hidden, script, style').forEach((hiddenNode) => {
      hiddenNode.remove();
    });

    const text = clone.textContent?.replace(/\s+/g, ' ')?.trim() ?? '';
    return text.replace(/\bStatus is offline\b/gi, '').trim();
  }

  const cards = document.querySelectorAll(CARD_SELECTOR);
  debugInfo.cardCount = cards.length;

  function deriveCompany({ summaryText, headlineText }) {
    const sources = [summaryText, headlineText].filter(Boolean);
    for (const text of sources) {
      const atMatch = text.match(/\bat\s+([^•|,;:]+)/i);
      if (atMatch?.[1]) {
        return atMatch[1].trim();
      }

      const atSymbolMatch = text.match(/@\s*([^•|,;:]+)/);
      if (atSymbolMatch?.[1]) {
        return atSymbolMatch[1].trim();
      }
    }

    return sources[0] ?? '';
  }

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
    const companySummary = normaliseText(card.querySelector(COMPANY_SELECTOR));
    const company = deriveCompany({ summaryText: companySummary, headlineText: headline });

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
