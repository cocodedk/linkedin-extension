/**
 * Main LinkedIn scraper - self-contained for executeScript injection
 * NOTE: This function must be self-contained as it runs in page context
 */

export function scrapeLinkedInResults() {
  // All dependencies inlined for executeScript context
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

  const COMPANY_SELECTOR = [
    '.entity-result__summary--2-lines',
    '.entity-result__summary-list li',
    '.entity-result__primary-subtitle',
    '.entity-result__primary-subtitle span'
  ].join(', ');

  const PROFILE_LINK_SELECTOR = [
    '.linked-area a[data-test-app-aware-link]:not([aria-hidden="true"])',
    'a.app-aware-link[href*="/in/"]',
    'a[href*="/in/"][data-test-app-aware-link]',
    '.linked-area a[href*="/in/"]'
  ].join(', ');

  const PROFILE_URL_PATTERNS = [/\/in\//i, /\/profile\/view/i, /\/sales\//i];

  function normaliseText(node) {
    if (!node) return '';
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent?.replace(/\s+/g, ' ')?.trim() ?? '';
    }
    if (!(node instanceof Element)) {
      return String(node?.textContent ?? '').replace(/\s+/g, ' ').trim();
    }
    const clone = node.cloneNode(true);
    clone.querySelectorAll('.visually-hidden, script, style').forEach((h) => h.remove());
    const text = clone.textContent?.replace(/\s+/g, ' ')?.trim() ?? '';
    return text.replace(/\bStatus is offline\b/gi, '').trim();
  }

  function extractCompany({ card, companySummary, headline }) {
    const listItem = card.querySelector('.entity-result__summary-list li');
    if (listItem) {
      const text = normaliseText(listItem);
      if (text) return text.replace(/[•|,;].*$/, '').trim();
    }

    const sources = [companySummary, headline].filter(Boolean);
    for (const text of sources) {
      const atMatch = text.match(/\bat\s+([^•|,;:#]+)\b/i);
      if (atMatch?.[1]) return atMatch[1].trim();
      const atSymbol = text.match(/@\s*([^•|,;:#]+)\b/);
      if (atSymbol?.[1]) return atSymbol[1].trim();
    }
    return '';
  }

  const debugInfo = { cardCount: 0, leadsBeforeFilter: 0, leadsAfterFilter: 0, missingProfileUrl: 0 };
  const cards = document.querySelectorAll(CARD_SELECTOR);
  debugInfo.cardCount = cards.length;

  const rawLeads = Array.from(cards).map((card) => {
    const profileCandidates = Array.from(card.querySelectorAll(PROFILE_LINK_SELECTOR));
    const profileElement = profileCandidates.find((a) =>
      PROFILE_URL_PATTERNS.some((p) => p.test(a?.href ?? ''))
    ) ?? profileCandidates[0] ?? null;

    const profileUrl = profileElement?.href ?? '';

    let name = normaliseText(card.querySelector(NAME_SELECTOR)) || normaliseText(profileElement);
    if (!name) {
      const img = card.querySelector('img.presence-entity__image[alt], img[alt]');
      if (img?.getAttribute) name = String(img.getAttribute('alt') || '').trim();
    }

    const headline = normaliseText(card.querySelector(HEADLINE_SELECTOR));
    const location = normaliseText(card.querySelector(LOCATION_SELECTOR));
    const companySummary = normaliseText(card.querySelector(COMPANY_SELECTOR));
    const company = extractCompany({ card, companySummary, headline });

    return {
      name,
      headline,
      company,
      location,
      contact: profileUrl,
      contactLinks: profileUrl ? [{ href: profileUrl, label: 'LinkedIn', type: 'linkedin' }] : [],
      profileUrl
    };
  });

  debugInfo.leadsBeforeFilter = rawLeads.length;

  const leads = rawLeads.filter((lead) => {
    const hasUrl = PROFILE_URL_PATTERNS.some((p) => p.test(lead.profileUrl));
    if (!hasUrl) debugInfo.missingProfileUrl += 1;
    return hasUrl;
  });

  debugInfo.leadsAfterFilter = leads.length;

  // Profile page fallback
  if (leads.length === 0) {
    const profileUrl = location?.href || '';
    const name = normaliseText(document.querySelector('main h1, h1'));
    const headline = normaliseText(document.querySelector('[class*="text-body-medium"]'));
    const locationText = normaliseText(document.querySelector('[class*="text-body-small"]'));

    return {
      leads: [{
        name,
        headline,
        company: '',
        location: locationText,
        contact: profileUrl,
        contactLinks: profileUrl ? [{ href: profileUrl, label: 'LinkedIn', type: 'linkedin' }] : [],
        profileUrl
      }],
      debugInfo
    };
  }

  return { leads, debugInfo };
}
