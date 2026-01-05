/**
 * Chrome storage utilities for extension testing
 */

import { delay } from './delay.js';
import { getExtensionId } from './extension-id.js';

/**
 * Set up test data in chrome.storage.local
 */
export async function setupTestData(page, leads, extensionId) {
  if (!extensionId) {
    extensionId = await getExtensionId(page);
  }
  const context = page.context();
  const extensionPage = await context.newPage();
  await extensionPage.goto(`chrome-extension://${extensionId}/popup.html`, {
    waitUntil: 'domcontentloaded'
  });
  await delay(1000);
  await extensionPage.evaluate((leadsData) => {
    return new Promise((resolve) => {
      chrome.storage.local.set({ leads: leadsData }, () => {
        resolve();
      });
    });
  }, leads);
  await extensionPage.close();
  await delay();
}

/**
 * Clear test data from chrome.storage.local
 */
export async function clearTestData(page, extensionId) {
  if (!extensionId) {
    extensionId = await getExtensionId(page);
  }
  const context = page.context();
  const extensionPage = await context.newPage();
  await extensionPage.goto(`chrome-extension://${extensionId}/popup.html`, {
    waitUntil: 'domcontentloaded'
  });
  await delay(1000);
  await extensionPage.evaluate(() => {
    return new Promise((resolve) => {
      chrome.storage.local.set({ leads: [] }, () => {
        resolve();
      });
    });
  });
  await extensionPage.close();
  await delay();
}

/**
 * Get leads from chrome.storage.local
 */
export async function getLeadsFromStorage(page, extensionId) {
  if (!extensionId) {
    extensionId = await getExtensionId(page);
  }
  const context = page.context();
  const extensionPage = await context.newPage();
  await extensionPage.goto(`chrome-extension://${extensionId}/popup.html`, {
    waitUntil: 'domcontentloaded'
  });
  await delay(1000);
  const leads = await extensionPage.evaluate(() => {
    return new Promise((resolve) => {
      chrome.storage.local.get('leads', (result) => {
        resolve(result.leads || []);
      });
    });
  });
  await extensionPage.close();
  return leads;
}
