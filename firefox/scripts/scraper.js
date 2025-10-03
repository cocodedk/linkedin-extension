/**
 * Main LinkedIn scraper - orchestrates card and profile scraping
 */

import { CARD_SELECTOR, PROFILE_URL_PATTERNS } from './scraper/selectors.js';
import { scrapeCard } from './scraper/card-scraper.js';
import { scrapeProfilePage } from './scraper/profile-scraper.js';

export function scrapeLinkedInResults() {
  const debugInfo = {
    cardCount: 0,
    leadsBeforeFilter: 0,
    leadsAfterFilter: 0,
    missingProfileUrl: 0
  };

  const cards = document.querySelectorAll(CARD_SELECTOR);
  debugInfo.cardCount = cards.length;

  const rawLeads = Array.from(cards).map(scrapeCard);
  debugInfo.leadsBeforeFilter = rawLeads.length;

  const leads = rawLeads.filter((lead) => {
    const hasUrl = PROFILE_URL_PATTERNS.some((pattern) => pattern.test(lead.profileUrl));
    if (!hasUrl) {
      debugInfo.missingProfileUrl += 1;
    }
    return hasUrl;
  });

  debugInfo.leadsAfterFilter = leads.length;

  // If no cards found, try scraping as profile page
  if (leads.length === 0) {
    const profileLead = scrapeProfilePage();
    return {
      leads: [profileLead],
      debugInfo
    };
  }

  return { leads, debugInfo };
}
