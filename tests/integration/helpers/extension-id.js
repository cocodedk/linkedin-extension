/**
 * Extension ID detection utilities
 */

import { findExtensionInPages, waitForExtensionPage } from './extension-id-helpers.js';

let cachedExtensionId = null;

/**
 * Get extension ID from page context using CDP
 */
export async function getExtensionId(page) {
  if (cachedExtensionId) {
    return cachedExtensionId;
  }

  const context = page.context();

  // Method 1: Use CDP to get extension targets
  try {
    const client = await context.newCDPSession(page);
    const targets = await client.send('Target.getTargets');
    console.log(
      'Available targets:',
      targets.targetInfos.map((t) => ({ type: t.type, url: t.url }))
    );

    for (const target of targets.targetInfos) {
      if (target.type === 'service_worker' && target.url.includes('chrome-extension://')) {
        const matches = target.url.match(/chrome-extension:\/\/([a-z]{32})/);
        if (matches && matches[1]) {
          cachedExtensionId = matches[1];
          return cachedExtensionId;
        }
      }
    }
  } catch (e) {
    console.log('CDP method failed:', e.message);
  }

  // Method 2: Try to find extension pages in context
  cachedExtensionId = await findExtensionInPages(context);
  if (cachedExtensionId) {
    return cachedExtensionId;
  }

  // Method 3: Wait for extension page to appear
  cachedExtensionId = await waitForExtensionPage(context);
  if (cachedExtensionId) {
    return cachedExtensionId;
  }

  // Method 4: Wait and retry CDP
  console.log('Waiting for extension to load...');
  await new Promise((resolve) => setTimeout(resolve, 5000));

  try {
    const client = await context.newCDPSession(page);
    const targets = await client.send('Target.getTargets');
    console.log(
      'Retrying CDP, available targets:',
      targets.targetInfos.map((t) => ({ type: t.type, url: t.url }))
    );

    for (const target of targets.targetInfos) {
      if (target.type === 'service_worker' && target.url.includes('chrome-extension://')) {
        const matches = target.url.match(/chrome-extension:\/\/([a-z]{32})/);
        if (matches && matches[1]) {
          cachedExtensionId = matches[1];
          return cachedExtensionId;
        }
      }
    }
  } catch (e) {
    console.log('Retry CDP failed:', e.message);
  }

  throw new Error('Could not find extension ID. Make sure the extension is loaded.');
}

/**
 * Clear cached extension ID (for testing purposes)
 */
export function clearCachedExtensionId() {
  cachedExtensionId = null;
}
