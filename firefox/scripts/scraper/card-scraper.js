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
}
