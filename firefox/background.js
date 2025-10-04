/**
 * Background service worker for Firefox extension
 * Handles long-running tasks that need to survive popup closure
 */

import { runDeepScanInBackground } from './background/deep-scan-worker.js';
import { saveLeads } from './scripts/storage.js';

// Listen for messages from popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_DEEP_SCAN') {
    handleDeepScanRequest(message.searchTabId)
      .then(result => sendResponse({ success: true, leads: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));

    // Return true to indicate async response
    return true;
  }
});

/**
 * Handle deep scan request
 */
async function handleDeepScanRequest(searchTabId) {
  try {
    console.log('Background: Starting deep scan for tab', searchTabId);

    // Run deep scan
    const leads = await runDeepScanInBackground(searchTabId);

    // Save leads
    const savedLeads = await saveLeads(leads);

    console.log('Background: Deep scan complete, saved', savedLeads.length, 'leads');

    // Notify user with notification
    browser.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Deep Scan Complete',
      message: `Successfully extracted ${savedLeads.length} leads with company data`
    });

    return savedLeads;
  } catch (error) {
    console.error('Background: Deep scan error:', error);

    // Notify user of error
    browser.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Deep Scan Failed',
      message: error.message
    });

    throw error;
  }
}
