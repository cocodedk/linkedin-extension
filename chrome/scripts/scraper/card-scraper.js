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
  // Card is already a profile link, use it directly
  const profileUrl = card.href;

  // Try to get name from link with data-view-name
  let name = '';
  const nameLink = card.querySelector('a[data-view-name="search-result-lockup-title"]');
  if (nameLink) {
    name = nameLink.textContent.trim();
  }

  // Fallback to image alt
  if (!name) {
    const img = card.querySelector('img[alt][src*="profile-displayphoto"]');
    if (img) {
      name = img.getAttribute('alt').trim();
    }
  }

  // Try to extract additional data from the card's context
  // Note: LinkedIn may have moved company/headline/location data
  // so these might be empty for now, which is acceptable for a quick scan
  const headline = '';
  const location = '';
  const company = '';

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
