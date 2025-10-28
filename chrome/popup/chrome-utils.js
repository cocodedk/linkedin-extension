/**
 * Chrome extension API utilities (orchestrator)
 */

import { scrapeLinkedInResults } from '../scripts/scraper.js';
import { getActiveTabId } from './utils/tab-utils.js';
import { injectLinkedInQuery } from './utils/linkedin-injection.js';
import { injectVirkQuery } from './utils/virk-injection.js';
import { clickLinkedInNext, clickVirkNext } from './utils/pagination.js';

export { getActiveTabId };

export async function injectQueryIntoLinkedIn({ tabId, query }) {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: injectLinkedInQuery,
    args: [{ value: query }]
  });

  if (!result?.success) {
    throw new Error(result?.message || 'Unable to inject LinkedIn search query.');
  }
}

export async function injectQueryIntoVirk({ tabId, query }) {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: injectVirkQuery,
    args: [{ value: query }]
  });

  if (!result?.success) {
    throw new Error(result?.message || 'Unable to inject Virk search query.');
  }
}

export async function scrapeActiveTab() {
  const tabId = await getActiveTabId();
  const [{ result = {} } = {}] = await chrome.scripting.executeScript({
    target: { tabId },
    func: scrapeLinkedInResults
  });
  return result;
}

export async function clickNextButton() {
  const tabId = await getActiveTabId();

  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: clickLinkedInNext
  });

  if (!result?.success) {
    throw new Error(result?.message || 'Failed to click Next button');
  }
}

export async function clickVirkNextButton() {
  const tabId = await getActiveTabId();

  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: clickVirkNext
  });

  if (!result?.success) {
    throw new Error(result?.message || 'Failed to click Virk Next button');
  }
}
