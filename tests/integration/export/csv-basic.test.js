/**
 * Basic CSV Export Tests
 */

import { test, expect } from '@playwright/test';
import { navigateToPopup, setupTestData, delay } from '../helpers/extension-utils.js';
import { minimalLead, fullLead } from '../fixtures/test-data.js';
import { setupExportTestHooks, getStoredExtensionId } from './test-setup.js';
import fs from 'fs';

setupExportTestHooks();

test.describe('CSV Export - Basic Tests', () => {
  test('should export CSV with valid leads without crashing browser', async ({ page }) => {
    const extensionId = getStoredExtensionId();
    await setupTestData(page, [minimalLead, fullLead], extensionId);
    await navigateToPopup(page, extensionId);
    await delay();
    const downloadPromise = page.waitForEvent('download');
    await page.click('#export-csv-btn');
    await delay();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('linkedin-leads.csv');
    const downloadPath = await download.path();
    const content = fs.readFileSync(downloadPath, 'utf-8');
    expect(content).toContain('name,headline,company');
    expect(content).toContain('John Doe');
    expect(content).toContain('Jane Smith');
    await fs.promises.unlink(downloadPath).catch(() => {});
  });

  test('should show warning when exporting CSV with empty leads', async ({ page }) => {
    const extensionId = getStoredExtensionId();
    await navigateToPopup(page, extensionId);
    await delay();
    await page.click('#export-csv-btn');
    await delay();
    const statusText = await page.textContent('#status');
    expect(statusText).toContain('No leads to export');
    expect(statusText).toContain('warning');
  });

  test('should verify CSV file content and format', async ({ page }) => {
    const extensionId = getStoredExtensionId();
    await setupTestData(page, [minimalLead], extensionId);
    await navigateToPopup(page, extensionId);
    await delay();
    const downloadPromise = page.waitForEvent('download');
    await page.click('#export-csv-btn');
    await delay();
    const download = await downloadPromise;
    const downloadPath = await download.path();
    const content = fs.readFileSync(downloadPath, 'utf-8');
    const lines = content.split('\n');
    expect(lines[0]).toContain('name');
    expect(lines[0]).toContain('headline');
    expect(lines[0]).toContain('company');
    expect(lines.length).toBeGreaterThan(1);
    expect(content).toMatch(/^[^,]+,[^,]+,[^,]+/m);
    await fs.promises.unlink(downloadPath).catch(() => {});
  });

  test('should verify download completes successfully', async ({ page }) => {
    const extensionId = getStoredExtensionId();
    await setupTestData(page, [minimalLead], extensionId);
    await navigateToPopup(page, extensionId);
    await delay();
    const downloadPromise = page.waitForEvent('download');
    await page.click('#export-csv-btn');
    await delay();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('linkedin-leads.csv');
    const downloadPath = await download.path();
    expect(fs.existsSync(downloadPath)).toBe(true);
    await fs.promises.unlink(downloadPath).catch(() => {});
  });

  test('should verify correct download filename', async ({ page }) => {
    const extensionId = getStoredExtensionId();
    await setupTestData(page, [minimalLead], extensionId);
    await navigateToPopup(page, extensionId);
    await delay();
    const downloadPromise = page.waitForEvent('download');
    await page.click('#export-csv-btn');
    await delay();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('linkedin-leads.csv');
    await fs.promises.unlink(await download.path()).catch(() => {});
  });
});
