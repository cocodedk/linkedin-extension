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
  const selectors = [
    'input.search-global-typeahead__input',
    'input[data-view-name="search-global-typeahead-input"]',
    'input[role="combobox"][aria-label="Search"]'
  ];

  const [{ result }] = await browserApi.scripting.executeScript({
    target: { tabId },
    func: ({ selectors: selectorList, value }) => {
      const pickInput = () => {
        for (const selector of selectorList) {
          const node = document.querySelector(selector);
          if (node instanceof HTMLInputElement) {
            return node;
          }
        }
        return null;
      };

      const input = pickInput();
      if (!input) {
        return { success: false };
      }

      const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
      if (descriptor?.set) {
        descriptor.set.call(input, value);
      } else {
        input.value = value;
      }

      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.focus();
      return { success: true };
    },
    args: [{ selectors, value: query }]
  });

  if (!result?.success) {
    throw new Error('Unable to locate LinkedIn search box.');
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

