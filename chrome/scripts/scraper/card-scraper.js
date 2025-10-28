/**
 * Extract data from individual LinkedIn search result cards
 */

import { normaliseText } from './text-utils.js';
import { extractCompany } from './company-extractor.js';
import {
  NAME_SELECTOR,
  HEADLINE_SELECTOR,
  LOCATION_SELECTOR,
  COMPANY_SELECTOR,
  PROFILE_LINK_SELECTOR,
  PROFILE_URL_PATTERNS
} from './selectors.js';

export function scrapeCard(card) {
  console.log('[Card Scraper] Processing card:', card);

  const profileCandidates = Array.from(card.querySelectorAll(PROFILE_LINK_SELECTOR));
  const profileElement = profileCandidates.find((a) =>
    PROFILE_URL_PATTERNS.some((p) => p.test(a?.href ?? ''))
  ) ?? profileCandidates[0] ?? null;

  const profileUrl = profileElement?.href ?? card?.href ?? '';
  console.log('[Card Scraper] Profile URL:', profileUrl);

  const nameElement = card.querySelector(NAME_SELECTOR);
  let name = '';

  console.log('[Card Scraper] Name element:', nameElement);

  if (nameElement?.tagName === 'IMG') {
    name = String(nameElement.getAttribute('alt') || '').trim();
  } else {
    name = normaliseText(nameElement) || normaliseText(profileElement);
  }

  if (!name) {
    const img = card.querySelector('img[alt][src*="profile-displayphoto"], img.presence-entity__image[alt], img[alt]');
    if (img?.getAttribute) name = String(img.getAttribute('alt') || '').trim();
  }

  console.log('[Card Scraper] Extracted name:', name);

  const headline = normaliseText(card.querySelector(HEADLINE_SELECTOR));
  const location = normaliseText(card.querySelector(LOCATION_SELECTOR));
  const companySummary = normaliseText(card.querySelector(COMPANY_SELECTOR));
  const company = extractCompany({ card, companySummary, headline });

  const result = {
    name,
    headline,
    company,
    location,
    contact: profileUrl,
    contactLinks: profileUrl ? [{ href: profileUrl, label: 'LinkedIn', type: 'linkedin' }] : [],
    profileUrl
  };

  console.log('[Card Scraper] Result:', result);

  return result;
}
