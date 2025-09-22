export function scrapeLinkedInResults() {
  const COMPANY_LIST_ITEM_SELECTOR = '.entity-result__summary-list li';
  const COMPANY_SELECTOR = [
    '.entity-result__summary--2-lines',
    COMPANY_LIST_ITEM_SELECTOR,
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
    'a[data-test-app-aware-link][href*="/in/"] span[dir="ltr"] span[aria-hidden="true"]',
    'a.app-aware-link[href*="/in/"] span[dir="ltr"] span[aria-hidden="true"]',
    '.entity-result__title-text .app-aware-link span[aria-hidden="true"]',
    '.entity-result__title-text a span[aria-hidden="true"]',
    'a.app-aware-link[href*="/in/"] span[aria-hidden="true"]',
    '.entity-result__title-text span[dir="ltr"]',
    '.linked-area a[data-test-app-aware-link]:not([aria-hidden="true"]) span',
    '.linked-area a[data-test-app-aware-link]:not([aria-hidden="true"])',
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

  function deriveCompanyImproved({ card, summaryText, headlineText }) {
    const listItems = Array.from(card.querySelectorAll(COMPANY_LIST_ITEM_SELECTOR));
    if (listItems.length > 0) {
      const text = normaliseText(listItems[0]);
      if (text) {
        return text.replace(/[•|,;].*$/, '').trim();
      }
    }

    const sources = [summaryText, headlineText].filter(Boolean);
    for (const text of sources) {
      const atMatch = text.match(/\bat\s+([^•|,;:#]+)\b/i);
      if (atMatch?.[1]) {
        return atMatch[1].trim();
      }

      const atSymbolMatch = text.match(/@\s*([^•|,;:#]+)\b/);
      if (atSymbolMatch?.[1]) {
        return atSymbolMatch[1].trim();
      }
    }

    return '';
  }

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
    let name = normaliseText(card.querySelector(NAME_SELECTOR)) || normaliseText(profileElement);
    if (!name) {
      const img = card.querySelector('img.presence-entity__image[alt], img[alt]');
      if (img?.getAttribute) {
        name = String(img.getAttribute('alt') || '').trim();
      }
    }
    const headline = normaliseText(card.querySelector(HEADLINE_SELECTOR));
    const location = normaliseText(card.querySelector(LOCATION_SELECTOR));
    const companySummary = normaliseText(card.querySelector(COMPANY_SELECTOR));
    let company = deriveCompanyImproved({ card, summaryText: companySummary, headlineText: headline });
    if (!company || company === headline) {
      const candidates = [companySummary, headline].filter(Boolean);
      for (const text of candidates) {
        const mHos = text.match(/\bhos\s+([^�?�|,;:#]+)\b/i);
        if (mHos?.[1]) { company = mHos[1].trim(); break; }
        const mAt = text.match(/\bat\s+([^�?�|,;:#]+)\b/i);
        if (mAt?.[1]) { company = mAt[1].trim(); break; }
        const mAtSym = text.match(/@\s*([^�?�|,;:#]+)\b/);
        if (mAtSym?.[1]) { company = mAtSym[1].trim(); break; }
      }
      if (company === headline) {
        company = '';
      }
    }

    return {
      name,
      headline,
      company,
      location,
      contact: profileUrl,
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
