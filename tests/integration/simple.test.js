/**
 * Simple test to verify Playwright is working
 */

import { test, expect } from '@playwright/test';

test.describe('Simple Playwright Tests', () => {
  test('should navigate to a page', async ({ page }) => {
    await page.goto('https://example.com');
    await expect(page).toHaveTitle(/Example Domain/);
  });

  test('should be able to interact with page elements', async ({ page }) => {
    await page.goto('https://example.com');
    const heading = page.locator('h1');
    await expect(heading).toContainText('Example Domain');
  });
});
