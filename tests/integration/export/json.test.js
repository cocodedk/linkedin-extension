/**
 * JSON Export Tests
 */

import { test, expect } from '@playwright/test';
import { navigateToPopup, setupTestData, delay } from '../helpers/extension-utils.js';
import { minimalLead, fullLead, leadWithAllFields } from '../fixtures/test-data.js';
import { setupExportTestHooks, getStoredExtensionId } from './test-setup.js';
import fs from 'fs';

setupExportTestHooks();

test.describe('JSON Export Tests', () => {
  test('should export JSON with valid leads', async ({ page }) => {
    const extensionId = getStoredExtensionId();
    await setupTestData(page, [minimalLead, fullLead], extensionId);
    await navigateToPopup(page, extensionId);
    await delay();

    const downloadPromise = page.waitForEvent('download');
    await page.click('#export-json-btn');
    await delay();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('linkedin-leads.json');

    const downloadPath = await download.path();
    const content = fs.readFileSync(downloadPath, 'utf-8');
    const json = JSON.parse(content);

    expect(Array.isArray(json)).toBe(true);
    expect(json.length).toBe(2);
    expect(json[0].name).toBe('John Doe');
    expect(json[1].name).toBe('Jane Smith');

    await fs.promises.unlink(downloadPath).catch(() => {});
  });

  test('should show warning when exporting JSON with empty leads', async ({ page }) => {
    const extensionId = getStoredExtensionId();
    await navigateToPopup(page, extensionId);
    await delay();

    await page.click('#export-json-btn');
    await delay();

    const statusText = await page.textContent('#status');
    expect(statusText).toContain('No leads to export');
  });

  test('should export JSON with all fields including Virk data', async ({ page }) => {
    const extensionId = getStoredExtensionId();
    await setupTestData(page, [leadWithAllFields], extensionId);
    await navigateToPopup(page, extensionId);
    await delay();

    const downloadPromise = page.waitForEvent('download');
    await page.click('#export-json-btn');
    await delay();

    const download = await downloadPromise;
    const downloadPath = await download.path();
    const content = fs.readFileSync(downloadPath, 'utf-8');
    const json = JSON.parse(content);

    expect(json[0]).toHaveProperty('virkCvrNumber');
    expect(json[0]).toHaveProperty('virkAddress');
    expect(json[0]).toHaveProperty('aiScore');
    expect(json[0]).toHaveProperty('aiReasons');

    await fs.promises.unlink(downloadPath).catch(() => {});
  });
});
