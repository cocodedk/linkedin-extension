/**
 * Extract company from profile page
 * Self-contained for executeScript injection
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
