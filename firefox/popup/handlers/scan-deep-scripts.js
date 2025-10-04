/**
 * Content scripts for deep LinkedIn scraping
 */

const XPATHS = {
  list: '/html/body/div[7]/div[3]/div[2]/div/div[1]/main/div/div/div/div/ul',
  name: '/div/div/div/div[2]/div[1]/div[1]/div/span[1]/span/a/span/span[1]',
  link: '/div/div/div/div[2]/div[1]/div[1]/div/span[1]/span/a'
};

/**
 * Get profile links from search results using XPath
 */
export function getProfileLinksScript() {
  const profiles = [];
  const listItems = document.evaluate(
    `${XPATHS.list}/li`, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null
  );

  for (let i = 0; i < listItems.snapshotLength; i++) {
    const index = i + 1;
    try {
      const nameNode = document.evaluate(
        `${XPATHS.list}/li[${index}]${XPATHS.name}`,
        document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
      ).singleNodeValue;

      const linkNode = document.evaluate(
        `${XPATHS.list}/li[${index}]${XPATHS.link}`,
        document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
      ).singleNodeValue;

      if (nameNode && linkNode) {
        const name = nameNode.textContent.trim();
        const url = linkNode.href;
        if (name && url && url.includes('/in/')) {
          profiles.push({ name, profileUrl: url });
        }
      }
    } catch (error) {
      console.error(`Error at ${index}:`, error);
    }
  }
  return profiles;
}

/**
 * Extract current company from profile page
 */
export function extractCompanyScript() {
  try {
    // Method 1: Find button with aria-label containing "Current company:"
    const buttons = document.querySelectorAll('button[aria-label*="Current company:"]');
    if (buttons.length > 0) {
      const ariaLabel = buttons[0].getAttribute('aria-label');
      // Extract "Telenor" from "Current company: Telenor. Click to skip to experience card"
      const match = ariaLabel.match(/Current company:\s*(.+?)\.\s*Click/);
      if (match) return match[1].trim();
    }

    // Method 2: Try XPath to company name element
    const companyXPath = '/html/body/div[7]/div[3]/div/div/div[2]/div/div/main/section[1]/div[2]/div[2]/ul/li[1]/button/span/div';
    const companyNode = document.evaluate(
      companyXPath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
    if (companyNode) {
      return companyNode.textContent.trim();
    }

    // Method 3: Fallback to company link
    const companyLinks = document.querySelectorAll('a[href*="/company/"]');
    if (companyLinks.length > 0) {
      return companyLinks[0].textContent.trim();
    }

    return '';
  } catch (error) {
    console.error('Error extracting company:', error);
    return '';
  }
}

/**
 * Extract headline and location from profile
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
