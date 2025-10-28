/**
 * Main LinkedIn scraper - orchestrates card scraping
 */

import { CARD_SELECTOR, PROFILE_URL_PATTERNS } from './scraper/selectors.js';
import { scrapeCard } from './scraper/card-scraper.js';
import { scrapeProfilePage } from './scraper/profile-scraper.js';

export function scrapeLinkedInResults() {
  const debugInfo = {
    cardCount: 0,
    leadsBeforeFilter: 0,
    leadsAfterFilter: 0,
    missingProfileUrl: 0,
    selector: CARD_SELECTOR
  };

  const cards = document.querySelectorAll(CARD_SELECTOR);
  debugInfo.cardCount = cards.length;

  console.log('[LinkedIn Scraper] Cards found:', cards.length);
  console.log('[LinkedIn Scraper] Using selector:', CARD_SELECTOR);

  const rawLeads = Array.from(cards).map(scrapeCard);
  debugInfo.leadsBeforeFilter = rawLeads.length;

  console.log('[LinkedIn Scraper] Raw leads:', rawLeads);

  const leads = rawLeads.filter((lead) => {
    const hasUrl = PROFILE_URL_PATTERNS.some((p) => p.test(lead.profileUrl));
    if (!hasUrl) debugInfo.missingProfileUrl += 1;
    return hasUrl;
  });

  debugInfo.leadsAfterFilter = leads.length;
  console.log('[LinkedIn Scraper] Filtered leads:', leads.length);

  // Profile page fallback
  if (leads.length === 0) {
    console.log('[LinkedIn Scraper] No leads found, using profile page fallback');
    return {
      leads: [scrapeProfilePage()],
      debugInfo
    };
  }

  return { leads, debugInfo };
}
