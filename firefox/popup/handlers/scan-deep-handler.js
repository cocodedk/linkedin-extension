/**
 * Deep scan handler - visits each profile for accurate company data
 */

import { saveLeads } from '../../scripts/storage.js';
import { setStatus, renderLeads } from '../ui.js';
import {
  getProfileLinksScript,
  extractCompanyScript,
  extractProfileDataScript
} from './scan-deep-scripts.js';

/**
 * Deep scan: Visit each profile to extract company from overlay
 * Runs in background service worker to survive popup closure
 */
export async function handleDeepScan() {
  setStatus('Starting deep scan in background...');

  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url.includes('linkedin.com/search/results')) {
      setStatus('Please navigate to LinkedIn search results first', 'warning');
      return;
    }

    // Send message to background worker
    setStatus('Deep scan running in background. You can close this popup.');

    chrome.runtime.sendMessage(
      { type: 'START_DEEP_SCAN', searchTabId: tab.id },
      (response) => {
        if (response.success) {
          console.log('Deep scan started successfully');
        } else {
          console.error('Deep scan failed:', response.error);
        }
      }
    );

    // Close popup after 2 seconds to show message
    setTimeout(() => window.close(), 2000);

  } catch (error) {
    console.error('Deep scan error:', error);
    setStatus(`Deep scan failed: ${error.message}`, 'error');
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
