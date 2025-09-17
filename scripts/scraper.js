const CARD_SELECTOR = [
  '.reusable-search__result-container',
  '.search-result__wrapper',
  '.search-results-container [data-view-name="search-entity-result-universal-template"]',
  '.search-results-container [data-chameleon-result-urn]'
].join(', ');
const NAME_SELECTOR = [
  'span[dir="ltr"]',
  '.entity-result__title-text a span',
  '.entity-result__title-text span',
  '.linked-area a[href*="/in/"] span',
  '.linked-area a[href*="/in/"]'
].join(', ');
const HEADLINE_SELECTOR = [
  '.entity-result__primary-subtitle',
  '.search-result__result-text',
  '.linked-area .t-14.t-black.t-normal'
].join(', ');
const LOCATION_SELECTOR = [
  '.entity-result__secondary-subtitle',
  '.search-result__result-meta',
  '.linked-area .t-12.t-normal',
  '.linked-area .t-12.t-black--light'
].join(', ');
const PROFILE_LINK_SELECTOR = [
  'a.app-aware-link[href*="/in/"]',
  'a[href*="/in/"][data-test-app-aware-link]',
  '.linked-area a[href*="/in/"]'
].join(', ');
const COMPANY_SELECTOR = '.entity-result__summary-list li, .entity-result__primary-subtitle span';

function normaliseText(node) {
  return node?.textContent?.replace(/\s+/g, ' ')
    ?.trim() ?? '';
}

export function scrapeLinkedInResults() {
  const cards = document.querySelectorAll(CARD_SELECTOR);
  return Array.from(cards).map((card) => {
    const profileElement = card.querySelector(PROFILE_LINK_SELECTOR);
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
  }).filter((lead) => lead.profileUrl);
}
