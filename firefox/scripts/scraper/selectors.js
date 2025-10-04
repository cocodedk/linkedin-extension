/**
 * CSS selectors for LinkedIn scraping
 */

export const CARD_SELECTOR = [
  '[data-view-name="search-entity-result-universal-template"]',
  '[data-chameleon-result-urn]',
  '.reusable-search__result-container',
  '.search-result__wrapper'
].join(', ');

export const NAME_SELECTOR = [
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

export const HEADLINE_SELECTOR = [
  '.entity-result__primary-subtitle',
  '.search-result__result-text',
  '.linked-area .t-14.t-black.t-normal',
  '.linked-area [class*="entity-result__primary-subtitle"]'
].join(', ');

export const LOCATION_SELECTOR = [
  '.entity-result__secondary-subtitle',
  '.search-result__result-meta',
  '.linked-area .t-12.t-normal',
  '.linked-area .t-12.t-black--light',
  '.linked-area .t-14.t-normal'
].join(', ');

export const COMPANY_SELECTOR = [
  '.entity-result__summary--2-lines',
  '.entity-result__summary-list li',
  '.entity-result__primary-subtitle',
  '.entity-result__primary-subtitle span'
].join(', ');

export const PROFILE_LINK_SELECTOR = [
  '.linked-area a[data-test-app-aware-link]:not([aria-hidden="true"])',
  'a.app-aware-link[href*="/in/"]',
  'a[href*="/in/"][data-test-app-aware-link]',
  '.linked-area a[href*="/in/"]'
].join(', ');

export const PROFILE_URL_PATTERNS = [/\/in\//i, /\/profile\/view/i, /\/sales\//i];
