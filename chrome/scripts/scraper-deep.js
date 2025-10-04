/**
 * Deep LinkedIn scraper - visits each profile to extract company
 * Uses profile page company verification overlay for accurate data
 */

/**
 * Get all profile links from search results
 * @returns {Array<{name: string, profileUrl: string}>}
 */
export function getProfileLinksFromResults() {
  const CARD_SELECTOR = '[data-view-name="search-entity-result-universal-template"]';
  const NAME_SELECTOR = 'a[href*="/in/"] span[dir="ltr"] span[aria-hidden="true"]';
  const PROFILE_LINK_SELECTOR = 'a[href*="/in/"][data-test-app-aware-link]';

  const cards = document.querySelectorAll(CARD_SELECTOR);
  const profiles = [];

  cards.forEach((card) => {
    const nameEl = card.querySelector(NAME_SELECTOR);
    const linkEl = card.querySelector(PROFILE_LINK_SELECTOR);

    if (nameEl && linkEl) {
      profiles.push({
        name: nameEl.textContent.trim(),
        profileUrl: linkEl.href
      });
    }
  });

  return profiles;
}

/**
 * Extract company from profile page overlay
 * @returns {Promise<string>} Company name or empty string
 */
export async function extractCompanyFromProfile() {
  // Wait for page to load
  await sleep(2000);

  // Click on company link to open overlay
  const companyLink = document.evaluate(
    '/html/body/div[7]/div[3]/div/div/div[2]/div/div/main/section[1]/div[2]/div[2]/div[1]/div[1]/span[1]/a',
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;

  if (!companyLink) {
    return '';
  }

  companyLink.click();

  // Wait for overlay to appear
  await sleep(1500);

  // Extract company name from overlay
  const companySpan = document.evaluate(
    '/html/body/div[4]/div/div/div[2]/section[2]/ul/li[1]/p[1]/span[1]',
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;

  if (!companySpan) {
    return '';
  }

  const text = companySpan.textContent.trim();
  // Extract "European Energy" from "European Energy: Verified using work email"
  const match = text.match(/^(.+?):/);
  return match ? match[1].trim() : text;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
