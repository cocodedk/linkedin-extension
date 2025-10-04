/**
 * Extract headline and location from profile page
 * Self-contained for executeScript injection
 */

export function extractProfileDataScript() {
  try {
    // Headline is typically the first div in the intro section
    const headlineEl = document.querySelector('div.text-body-medium.break-words');
    const headline = headlineEl?.textContent?.trim() || '';

    // Location is typically in a span with geographic-area class or similar
    const locationEl = document.querySelector('span.text-body-small.inline.t-black--light.break-words');
    const location = locationEl?.textContent?.trim() || '';

    // Alternative selectors
    if (!headline) {
      const altHeadline = document.querySelector('section[data-section="headline"] div[class*="text-body"]');
      return {
        headline: altHeadline?.textContent?.trim() || '',
        location: location
      };
    }

    return { headline, location };
  } catch (error) {
    console.error('Error extracting profile data:', error);
    return { headline: '', location: '' };
  }
}
