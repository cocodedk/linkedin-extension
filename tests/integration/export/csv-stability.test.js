/**
 * CSV Export Stability and Recovery Tests
 */

import { test, expect } from '@playwright/test';
import { navigateToPopup, setupTestData, delay } from '../helpers/extension-utils.js';
import { minimalLead } from '../fixtures/test-data.js';
import { setupExportTestHooks, getStoredExtensionId } from './test-setup.js';
import fs from 'fs';

setupExportTestHooks();

test.describe('CSV Export - Stability Tests', () => {
  test('should handle multiple consecutive exports without crashing', async ({ page }) => {
    const extensionId = getStoredExtensionId();
    await setupTestData(page, [minimalLead], extensionId);
    await navigateToPopup(page, extensionId);
    await delay();

    for (let i = 0; i < 3; i++) {
      const downloadPromise = page.waitForEvent('download');
      await page.click('#export-csv-btn');
      await delay();

      const download = await downloadPromise;
      const downloadPath = await download.path();
      expect(fs.existsSync(downloadPath)).toBe(true);
      await fs.promises.unlink(downloadPath).catch(() => {});
      await delay();
    }
  });

  test('should export CSV after popup close and reopen', async ({ page, context }) => {
    const extensionId = getStoredExtensionId();
    await setupTestData(page, [minimalLead], extensionId);
    await navigateToPopup(page, extensionId);
    await delay();

    await page.close();
    await delay();

    const newPage = await context.newPage();
    await navigateToPopup(newPage, extensionId);
    await delay();

    const downloadPromise = newPage.waitForEvent('download');
    await newPage.click('#export-csv-btn');
    await delay();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('linkedin-leads.csv');

    await fs.promises.unlink(await download.path()).catch(() => {});
    await newPage.close();
  });
});
