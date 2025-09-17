const CARD_SELECTOR = '.reusable-search__result-container, .search-result__wrapper';
const NAME_SELECTOR = 'span[dir="ltr"]';
const HEADLINE_SELECTOR = '.entity-result__primary-subtitle, .search-result__result-text';
const LOCATION_SELECTOR = '.entity-result__secondary-subtitle, .search-result__result-meta';
const PROFILE_LINK_SELECTOR = 'a.app-aware-link[href*="/in/"]';
const COMPANY_SELECTOR = '.entity-result__summary-list li, .entity-result__primary-subtitle span';

function normaliseText(node) {
  return node?.textContent?.replace(/\s+/g, ' ')
    ?.trim() ?? '';
}

export function scrapeLinkedInResults() {
  const cards = document.querySelectorAll(CARD_SELECTOR);
  return Array.from(cards).map((card) => {
    const name = normaliseText(card.querySelector(NAME_SELECTOR));
    const headline = normaliseText(card.querySelector(HEADLINE_SELECTOR));
    const location = normaliseText(card.querySelector(LOCATION_SELECTOR));
    const profileUrl = card.querySelector(PROFILE_LINK_SELECTOR)?.href ?? '';
    const company = normaliseText(card.querySelector(COMPANY_SELECTOR));

    return {
      name,
      headline,
      company,
      location,
      profileUrl
    };
  }).filter((lead) => lead.profileUrl);
}
