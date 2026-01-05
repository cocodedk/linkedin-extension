/**
 * CSV Export Dataset Size Tests
 */

import { test, expect } from '@playwright/test';
import { navigateToPopup, setupTestData, delay } from '../helpers/extension-utils.js';
import { getSmallDataset, getMediumDataset, getLargeDataset } from '../fixtures/test-data.js';
import { setupExportTestHooks, getStoredExtensionId } from './test-setup.js';
import fs from 'fs';

setupExportTestHooks();

test.describe('CSV Export - Dataset Size Tests', () => {
  test('should export CSV with small dataset (1-10 leads)', async ({ page }) => {
    const extensionId = getStoredExtensionId();
    const leads = getSmallDataset();
    await setupTestData(page, leads, extensionId);
    await navigateToPopup(page, extensionId);
    await delay();

    const downloadPromise = page.waitForEvent('download');
    await page.click('#export-csv-btn');
    await delay();

    const download = await downloadPromise;
    const downloadPath = await download.path();
    const content = fs.readFileSync(downloadPath, 'utf-8');
    const lines = content.split('\n');
    expect(lines.length).toBeGreaterThan(leads.length);
    expect(content).toContain('name,headline,company');

    await fs.promises.unlink(downloadPath).catch(() => {});
  });

  test('should export CSV with medium dataset (50-100 leads) without crashing', async ({
    page
  }) => {
    const extensionId = getStoredExtensionId();
    const leads = getMediumDataset();
    await setupTestData(page, leads, extensionId);
    await navigateToPopup(page, extensionId);
    await delay();

    const downloadPromise = page.waitForEvent('download');
    await page.click('#export-csv-btn');
    await delay();

    const download = await downloadPromise;
    const downloadPath = await download.path();
    const content = fs.readFileSync(downloadPath, 'utf-8');
    const lines = content.split('\n');
    expect(lines.length).toBeGreaterThan(leads.length);

    await fs.promises.unlink(downloadPath).catch(() => {});
  });

  test.skip('should export CSV with large dataset (500+ leads) without crashing', async ({
    page
  }) => {
    const extensionId = getStoredExtensionId();
    const leads = getLargeDataset();
    await setupTestData(page, leads, extensionId);
    await navigateToPopup(page, extensionId);
    await delay();

    const downloadPromise = page.waitForEvent('download');
    await page.click('#export-csv-btn');
    await delay();

    const download = await downloadPromise;
    const downloadPath = await download.path();
    const content = fs.readFileSync(downloadPath, 'utf-8');
    const lines = content.split('\n');
    expect(lines.length).toBeGreaterThan(leads.length);

    await fs.promises.unlink(downloadPath).catch(() => {});
  });
});
