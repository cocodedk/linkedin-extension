/**
 * CSV Export Edge Cases and Special Data Tests
 */

import { test, expect } from '@playwright/test';
import { navigateToPopup, setupTestData, delay } from '../helpers/extension-utils.js';
import {
  leadWithSpecialCharacters,
  leadWithNullValues,
  leadWithAllFields,
  leadWithVirkData,
  leadWithAIData
} from '../fixtures/test-data.js';
import { setupExportTestHooks, getStoredExtensionId } from './test-setup.js';
import fs from 'fs';

setupExportTestHooks();

test.describe('CSV Export - Edge Cases', () => {
  test('should export CSV with special characters', async ({ page }) => {
    const extensionId = getStoredExtensionId();
    await setupTestData(page, [leadWithSpecialCharacters], extensionId);
    await navigateToPopup(page, extensionId);
    await delay();
    const downloadPromise = page.waitForEvent('download');
    await page.click('#export-csv-btn');
    await delay();
    const download = await downloadPromise;
    const downloadPath = await download.path();
    const content = fs.readFileSync(downloadPath, 'utf-8');
    expect(content).toContain('John "Johnny" O\'Brien');
    expect(content).toContain('Company, Inc.');
    await fs.promises.unlink(downloadPath).catch(() => {});
  });

  test('should export CSV with null/undefined values', async ({ page }) => {
    const extensionId = getStoredExtensionId();
    await setupTestData(page, [leadWithNullValues], extensionId);
    await navigateToPopup(page, extensionId);
    await delay();
    const downloadPromise = page.waitForEvent('download');
    await page.click('#export-csv-btn');
    await delay();
    const download = await downloadPromise;
    const downloadPath = await download.path();
    const content = fs.readFileSync(downloadPath, 'utf-8');
    expect(content).toContain('Test User');
    expect(content).toContain('name,headline,company');
    await fs.promises.unlink(downloadPath).catch(() => {});
  });

  test('should export CSV with all field types', async ({ page }) => {
    const extensionId = getStoredExtensionId();
    await setupTestData(page, [leadWithAllFields], extensionId);
    await navigateToPopup(page, extensionId);
    await delay();
    const downloadPromise = page.waitForEvent('download');
    await page.click('#export-csv-btn');
    await delay();
    const download = await downloadPromise;
    const downloadPath = await download.path();
    const content = fs.readFileSync(downloadPath, 'utf-8');
    expect(content).toContain('name,headline,company,contact,location,profileUrl');
    expect(content).toContain('aiScore,aiReasons,aiFitSummary');
    expect(content).toContain('virkCvrNumber,virkAddress');
    await fs.promises.unlink(downloadPath).catch(() => {});
  });

  test('should export CSV with Virk enrichment data', async ({ page }) => {
    const extensionId = getStoredExtensionId();
    await setupTestData(page, [leadWithVirkData], extensionId);
    await navigateToPopup(page, extensionId);
    await delay();
    const downloadPromise = page.waitForEvent('download');
    await page.click('#export-csv-btn');
    await delay();
    const download = await downloadPromise;
    const downloadPath = await download.path();
    const content = fs.readFileSync(downloadPath, 'utf-8');
    expect(content).toContain('virkCvrNumber');
    expect(content).toContain('12345678');
    expect(content).toContain('København');
    await fs.promises.unlink(downloadPath).catch(() => {});
  });

  test('should export CSV with AI evaluation data', async ({ page }) => {
    const extensionId = getStoredExtensionId();
    await setupTestData(page, [leadWithAIData], extensionId);
    await navigateToPopup(page, extensionId);
    await delay();
    const downloadPromise = page.waitForEvent('download');
    await page.click('#export-csv-btn');
    await delay();
    const download = await downloadPromise;
    const downloadPath = await download.path();
    const content = fs.readFileSync(downloadPath, 'utf-8');
    expect(content).toContain('aiScore');
    expect(content).toContain('92');
    expect(content).toContain('aiReasons');
    expect(content).toContain('aiFitSummary');
    await fs.promises.unlink(downloadPath).catch(() => {});
  });
});
