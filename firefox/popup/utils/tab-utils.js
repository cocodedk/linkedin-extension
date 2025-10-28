/**
 * Tab management utilities
 */

import { browserApi } from '../browser-api.js';

export async function getActiveTabId() {
  const [tab] = await browserApi.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    throw new Error('No active tab found.');
  }
  return tab.id;
}

export function pickElement(selectorList) {
  for (const selector of selectorList) {
    const node = document.querySelector(selector);
    if (node instanceof HTMLElement) {
      return node;
    }
  }
  return null;
}
