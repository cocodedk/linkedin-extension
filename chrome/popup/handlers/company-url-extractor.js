/**
 * Extract company URL from profile page
 * Self-contained for executeScript injection
 */

export function extractCompanyUrlScript() {
  try {
    // Method 1: Find company links in the profile experience section
    const companyLinks = document.querySelectorAll('a[href*="/company/"]');
    if (companyLinks.length > 0) {
      const href = companyLinks[0].getAttribute('href');
      if (href) {
        // Ensure we have a full URL
        return href.startsWith('http') ? href : `https://www.linkedin.com${href}`;
      }
    }

    // Method 2: Try to find company link from the experience section
    // Look for links that contain company names and lead to /company/ pages
    const experienceLinks = document.querySelectorAll(
      'section[data-section="experience"] a[href*="/company/"]'
    );
    if (experienceLinks.length > 0) {
      const href = experienceLinks[0].getAttribute('href');
      if (href) {
        return href.startsWith('http') ? href : `https://www.linkedin.com${href}`;
      }
    }

    // Method 3: Try XPath approach similar to company name extraction
    // Look for company links in the profile overlay or experience section
    const xpathExpressions = [
      '//a[contains(@href, "/company/")]',
      '//section[contains(@data-section, "experience")]//a[contains(@href, "/company/")]'
    ];

    for (const xpath of xpathExpressions) {
      const linkNode = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;

      if (linkNode && linkNode.getAttribute) {
        const href = linkNode.getAttribute('href');
        if (href) {
          return href.startsWith('http') ? href : `https://www.linkedin.com${href}`;
        }
      }
    }

    return '';
  } catch (error) {
    console.error('Error extracting company URL:', error);
    return '';
  }
}
