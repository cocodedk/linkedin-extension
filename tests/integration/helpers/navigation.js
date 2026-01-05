/**
 * Navigation utilities for extension testing
 */

import { delay } from './delay.js';

/**
 * Navigate to extension popup
 */
export async function navigateToPopup(page, extensionId) {
  const popupUrl = `chrome-extension://${extensionId}/popup.html`;
  await page.goto(popupUrl);
  await delay();
}

/**
 * Navigate to extension leads page
 */
export async function navigateToLeadsPage(page, extensionId) {
  const leadsUrl = `chrome-extension://${extensionId}/leads.html`;
  await page.goto(leadsUrl);
  await delay();
}

/**
 * Wait for extension to be ready
 */
export async function waitForExtensionReady(page, extensionId) {
  await navigateToPopup(page, extensionId);
  await page.waitForSelector('body', { timeout: 10000 });
  await delay();
}
