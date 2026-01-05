/**
 * Storage Operation Tests
 */

import { test, expect } from '@playwright/test';
import {
  getExtensionId,
  setupTestData,
  clearTestData,
  getLeadsFromStorage,
  delay
} from './helpers/extension-utils.js';
import { minimalLead, fullLead, leadWithVirkData, leadWithAIData } from './fixtures/test-data.js';

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

test.describe('Storage Operations', () => {
  test('should save leads to storage', async ({ page }) => {
    await setupTestData(page, [minimalLead], extensionId);
    await delay();

    const leads = await getLeadsFromStorage(page);
    expect(leads).toHaveLength(1);
    expect(leads[0].name).toBe('John Doe');
  });

  test('should retrieve leads from storage', async ({ page }) => {
    await setupTestData(page, [minimalLead, fullLead], extensionId);
    await delay();

    const leads = await getLeadsFromStorage(page);
    expect(leads).toHaveLength(2);
    expect(leads[0].name).toBe('John Doe');
    expect(leads[1].name).toBe('Jane Smith');
  });

  test('should clear leads from storage', async ({ page }) => {
    await setupTestData(page, [minimalLead], extensionId);
    await delay();

    await clearTestData(page, extensionId);
    await delay();

    const leads = await getLeadsFromStorage(page);
    expect(leads).toHaveLength(0);
  });

  test('should persist storage across popup closes', async ({ page, context }) => {
    await setupTestData(page, [minimalLead], extensionId);
    await delay();

    await page.close();
    await delay();

    const newPage = await context.newPage();
    const leads = await getLeadsFromStorage(newPage);
    expect(leads).toHaveLength(1);
    expect(leads[0].name).toBe('John Doe');

    await newPage.close();
  });

  test('should store leads with Virk enrichment data', async ({ page }) => {
    await setupTestData(page, [leadWithVirkData], extensionId);
    await delay();

    const leads = await getLeadsFromStorage(page);
    expect(leads[0]).toHaveProperty('virkCvrNumber');
    expect(leads[0].virkCvrNumber).toBe('12345678');
    expect(leads[0].virkEnriched).toBe(true);
  });

  test('should store leads with AI evaluation data', async ({ page }) => {
    await setupTestData(page, [leadWithAIData], extensionId);
    await delay();

    const leads = await getLeadsFromStorage(page);
    expect(leads[0]).toHaveProperty('aiScore');
    expect(leads[0].aiScore).toBe(92);
    expect(leads[0]).toHaveProperty('aiReasons');
    expect(leads[0]).toHaveProperty('aiFitSummary');
  });
});
