/**
 * Popup UI and Interaction Tests
 */

import { test, expect } from '@playwright/test';
import {
  getExtensionId,
  navigateToPopup,
  setupTestData,
  clearTestData,
  delay
} from './helpers/extension-utils.js';
import { minimalLead } from './fixtures/test-data.js';

let extensionId;

test.beforeEach(async ({ page }) => {
  if (!extensionId) {
    await page.goto('about:blank');
    console.log('Waiting for extension to load...');
    await delay(5000); // Wait longer for extension to load
    extensionId = await getExtensionId(page);
  }
  await clearTestData(page, extensionId);
});

test.describe('Popup UI Tests', () => {
  test('should load popup correctly', async ({ page }) => {
    await navigateToPopup(page, extensionId);
    await delay();
    const title = await page.textContent('h1');
    expect(title).toContain('LinkedIn Lead Exporter');
  });

  test('should display all main buttons', async ({ page }) => {
    await navigateToPopup(page, extensionId);
    await delay();
    await expect(page.locator('#scan-btn')).toBeVisible();
    await expect(page.locator('#view-btn')).toBeVisible();
    await expect(page.locator('#export-csv-btn')).toBeVisible();
    await expect(page.locator('#export-json-btn')).toBeVisible();
    await expect(page.locator('#clear-leads-btn')).toBeVisible();
  });

  test('should display status messages', async ({ page }) => {
    await navigateToPopup(page, extensionId);
    await delay();
    await expect(page.locator('#status')).toBeVisible();
  });

  test('should display leads table', async ({ page }) => {
    await navigateToPopup(page, extensionId);
    await delay();
    await expect(page.locator('#leads-table')).toBeVisible();
  });

  test('should display lead cards when leads exist', async ({ page }) => {
    await setupTestData(page, [minimalLead], extensionId);
    await navigateToPopup(page, extensionId);
    await delay();
    await expect(page.locator('#leads-cards')).toBeVisible();
  });
});

test.describe('Popup Interaction Tests', () => {
  test('should click view leads button', async ({ page }) => {
    await setupTestData(page, [minimalLead], extensionId);
    await navigateToPopup(page, extensionId);
    await delay();
    await page.click('#view-btn');
    await delay();
    expect(page.url()).toContain('leads.html');
  });

  test('should click clear leads button', async ({ page }) => {
    await setupTestData(page, [minimalLead], extensionId);
    await navigateToPopup(page, extensionId);
    await delay();
    await page.click('#clear-leads-btn');
    await delay();
    const statusText = await page.textContent('#status');
    expect(statusText).toBeTruthy();
  });

  test('should handle button states', async ({ page }) => {
    await navigateToPopup(page, extensionId);
    await delay();
    await expect(page.locator('#export-csv-btn')).toBeEnabled();
  });
});
