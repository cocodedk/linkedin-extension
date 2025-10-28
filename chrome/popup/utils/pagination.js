/**
 * Pagination utilities for clicking next buttons
 */

export function clickLinkedInNext() {
  // Try data-testid selector first
  const nextBtn = document.querySelector('button[data-testid="pagination-controls-next-button-visible"]');
  if (nextBtn instanceof HTMLButtonElement && !nextBtn.disabled) {
    nextBtn.click();
    return { success: true };
  }

  // Fallback: Find button containing "Next" text
  const allButtons = document.querySelectorAll('button');
  for (const button of allButtons) {
    if (button.textContent.includes('Next') && !button.disabled) {
      button.click();
      return { success: true };
    }
  }

  return { success: false, message: 'Next button not found or disabled' };
}

export function clickVirkNext() {
  const pickElement = selectorList => {
    for (const selector of selectorList) {
      const node = document.querySelector(selector);
      if (node instanceof HTMLElement) {
        return node;
      }
    }
    return null;
  };

  const next = pickElement([
    'a[rel="next"]',
    'button[rel="next"]',
    'a[aria-label*="Næste"]',
    'button[aria-label*="Næste"]',
    'a[title*="Næste"]',
    '.pagination .next a',
    '.pagination__next',
    'button[data-testid="paging-next"]',
    'button[data-test="paging-next"]'
  ]);

  if (next instanceof HTMLButtonElement) {
    if (next.disabled) {
      return { success: false, message: 'Next pagination button disabled.' };
    }
    next.click();
    return { success: true };
  }

  if (next instanceof HTMLAnchorElement) {
    next.click();
    return { success: true };
  }

  return { success: false, message: 'Unable to locate DataCVR next page control.' };
}
