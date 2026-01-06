/**
 * XPath-based pagination utilities for LinkedIn
 */

export function clickLinkedInNextPageByXPath() {
  // Use the specific XPath for LinkedIn pagination button
  const xpath = '/html/body/div/div[2]/div[2]/div[2]/main/div/div/div/div[1]/div/div/div/div[3]/div/button[2]';
  try {
    const result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );
    const button = result.singleNodeValue;

    if (button instanceof HTMLButtonElement && !button.disabled) {
      button.click();
      return { success: true };
    }

    return { success: false, message: 'Next page button not found or disabled.' };
  } catch (error) {
    return { success: false, message: `XPath evaluation failed: ${error.message}` };
  }
}
