/**
 * Test loading a minimal extension
 */

import { test, expect } from '@playwright/test';
import { getExtensionId, navigateToPopup, delay } from './helpers/extension-utils.js';

test.describe('Minimal Extension Test', () => {
  test('should load minimal test extension', async ({ page }) => {
    console.log('Testing minimal extension loading...');

    // Override extension path for this test
    const testExtensionPath = 'test-extension';

    // Try to find extension using CDP
    const context = page.context();
    await page.goto('about:blank');
    await delay(3000);

    const client = await context.newCDPSession(page);
    const targets = await client.send('Target.getTargets');
    console.log(
      'Available targets:',
      targets.targetInfos.map((t) => ({ type: t.type, url: t.url }))
    );

    // Look for extension
    const extensionTarget = targets.targetInfos.find(
      (target) => target.type === 'service_worker' && target.url.includes('chrome-extension://')
    );

    if (extensionTarget) {
      const matches = extensionTarget.url.match(/chrome-extension:\/\/([a-z]{32})/);
      if (matches && matches[1]) {
        console.log('Found extension ID:', matches[1]);

        // Try to navigate to popup
        const popupUrl = `chrome-extension://${matches[1]}/popup.html`;
        await page.goto(popupUrl);
        await delay();

        const title = await page.textContent('h1');
        expect(title).toContain('Test Extension');
      }
    } else {
      console.log('No extension service worker found');
      // This will fail the test
      expect(extensionTarget).toBeTruthy();
    }
  });
});
