/**
 * Browser extension API utilities
 */

import { browserApi } from './browser-api.js';
import { scrapeLinkedInResults } from '../scripts/scraper.js';

export async function getActiveTabId() {
  const [tab] = await browserApi.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    throw new Error('No active tab found.');
  }
  return tab.id;
}

export async function injectQueryIntoLinkedIn({ tabId, query }) {
  const [{ result }] = await browserApi.scripting.executeScript({
    target: { tabId },
    func: ({ value }) => {
      const hostname = window.location.hostname;

      const setInputValue = inputElement => {
        const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        if (descriptor?.set) {
          descriptor.set.call(inputElement, value);
        } else {
          inputElement.value = value;
        }

        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        inputElement.dispatchEvent(new Event('change', { bubbles: true }));
        inputElement.focus();
      };

      const pickElement = selectorList => {
        for (const selector of selectorList) {
          const node = document.querySelector(selector);
          if (node instanceof HTMLElement) {
            return node;
          }
        }
        return null;
      };

      if (hostname.includes('linkedin.com')) {
        const input = pickElement([
          'input.search-global-typeahead__input',
          'input[data-view-name="search-global-typeahead-input"]',
          'input[role="combobox"][aria-label="Search"]'
        ]);

        if (!(input instanceof HTMLInputElement)) {
          return { success: false, message: 'Unable to locate LinkedIn search box.' };
        }

        setInputValue(input);
        return { success: true };
      }

      if (hostname.includes('datacvr.virk.dk')) {
        const input = pickElement([
          'input#searchstring',
          'input[name="search"]',
          'input[aria-label*="Søg"]',
          'input[placeholder*="Søg"]',
          'input[type="search"]'
        ]);

        if (!(input instanceof HTMLInputElement)) {
          return { success: false, message: 'Unable to locate DataCVR search box.' };
        }

        setInputValue(input);

        let triggered = false;

        const submitTargets = [
          'button[type="submit"]',
          'button[data-testid="search-button"]',
          'button[data-test="search-button"]',
          'button[aria-label*="Søg"]',
          'button[title*="Søg"]',
          'a[role="button"][aria-label*="Søg"]'
        ];

        const submitButton = pickElement(submitTargets);
        if (submitButton) {
          submitButton.click();
          triggered = true;
        }

        if (!triggered) {
          const form = input.closest('form');
          if (form instanceof HTMLFormElement) {
            const submitted = form.dispatchEvent(
              new Event('submit', { bubbles: true, cancelable: true })
            );
            if (submitted) {
              form.requestSubmit?.();
              triggered = true;
            }
          }
        }

        if (!triggered) {
          const eventInit = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true };
          input.dispatchEvent(new KeyboardEvent('keydown', eventInit));
          input.dispatchEvent(new KeyboardEvent('keypress', eventInit));
          input.dispatchEvent(new KeyboardEvent('keyup', eventInit));
        }

        return { success: true };
      }

      return { success: false, message: 'Unsupported site for query injection.' };
    },
    args: [{ value: query }]
  });

  if (!result?.success) {
    throw new Error(result?.message || 'Unable to inject search query.');
  }
}

export async function scrapeActiveTab() {
  const tabId = await getActiveTabId();
  const [{ result = {} } = {}] = await browserApi.scripting.executeScript({
    target: { tabId },
    func: scrapeLinkedInResults
  });
  return result;
}

export async function clickNextButton() {
  const tabId = await getActiveTabId();
  const [{ result }] = await browserApi.scripting.executeScript({
    target: { tabId },
    func: () => {
      const hostname = window.location.hostname;

      if (hostname.includes('linkedin.com')) {
        const nextButtons = document.querySelectorAll('span.artdeco-button__text');
        for (const span of nextButtons) {
          if (span.textContent.trim() === 'Next') {
            const button = span.closest('button');
            if (button instanceof HTMLButtonElement && !button.disabled) {
              button.click();
              return { success: true };
            }
          }
        }
        return { success: false, message: 'Next button not found or disabled' };
      }

      if (hostname.includes('datacvr.virk.dk')) {
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

      return { success: false, message: 'Unsupported site for pagination.' };
    }
  });

  if (!result?.success) {
    throw new Error(result?.message || 'Failed to click Next button');
  }
}
