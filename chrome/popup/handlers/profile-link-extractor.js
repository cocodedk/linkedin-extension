/**
 * Extract profile links from search results
 * Self-contained for executeScript injection
 */

export function getProfileLinksScript() {
  console.log('[Deep Scan] Starting profile extraction...');
  const profiles = [];

  // Use CSS selectors that match new LinkedIn structure
  const cardSelector = 'a[href*="/in/"][componentkey][tabindex]';
  const cards = document.querySelectorAll(cardSelector);

  console.log(`[Deep Scan] Found ${cards.length} profile cards`);

  cards.forEach((card, index) => {
    try {
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

      if (name && profileUrl && profileUrl.includes('/in/')) {
        profiles.push({ name, profileUrl });
        console.log(`[Deep Scan] Added profile ${index + 1}: ${name}`);
      } else {
        console.warn(`[Deep Scan] Missing data at index ${index}:`, { name, profileUrl });
      }
    } catch (error) {
      console.error(`[Deep Scan] Error at ${index}:`, error);
    }
  });

  console.log(`[Deep Scan] Extracted ${profiles.length} profiles`);
  return profiles;
}
