/**
 * Shared test setup for export tests
 */

import { test } from '@playwright/test';
import { getExtensionId, clearTestData, delay } from '../helpers/extension-utils.js';

let extensionId = null;

/**
 * Get cached extension ID
 */
export function getStoredExtensionId() {
  return extensionId;
}

/**
 * Initialize extension ID before tests
 */
export async function initExtensionId(page) {
  if (!extensionId) {
    await page.goto('about:blank');
    console.log('Waiting for extension to load...');
    await delay(5000); // Wait longer for extension to load
    extensionId = await getExtensionId(page);
  }
  return extensionId;
}

/**
 * Clear test data using cached extension ID
 */
export async function clearData(page) {
  if (extensionId) {
    await clearTestData(page, extensionId);
  }
}

/**
 * Create standard beforeEach hooks for export tests
 */
export function setupExportTestHooks() {
  test.beforeEach(async ({ page }) => {
    await initExtensionId(page);
  });

  test.beforeEach(async ({ page }) => {
    await clearData(page);
  });
}
