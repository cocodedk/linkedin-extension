/**
 * Deep Scan ALL handler - scans all pages automatically
 */

import { tabs } from '../../api/tabs.js';
import { runtime } from '../../api/runtime.js';
import { setStatus } from '../ui.js';

/**
 * Deep Scan ALL: Scan all LinkedIn search result pages (up to 100)
 * Runs in background service worker to survive popup closure
 */
export async function handleDeepScanAll() {
  try {
    // Get active tab
    const [tab] = await tabs.query({ active: true, currentWindow: true });

    if (!tab.url.includes('linkedin.com/search/results')) {
      setStatus('Please navigate to LinkedIn search results first', 'warning');
      return;
    }

    // Show confirmation dialog
    const confirmed = confirm(
      'Deep Scan ALL will automatically scan up to 100 pages.\n\n' +
      'This may take a while. You can stop it at any time.\n\n' +
      'Continue?'
    );

    if (!confirmed) {
      setStatus('Deep Scan ALL cancelled');
      return;
    }

    // Send message to background worker
    setStatus('Deep Scan ALL starting... You can close this popup.');

    runtime.sendMessage(
      { type: 'START_DEEP_SCAN_ALL', searchTabId: tab.id },
      (response) => {
        if (response && response.success) {
          console.log('Deep Scan ALL started successfully');
        } else if (response) {
          console.error('Deep Scan ALL failed:', response.error);
        }
      }
    );

    // Close popup after 2 seconds
    setTimeout(() => window.close(), 2000);

  } catch (error) {
    console.error('Deep Scan ALL error:', error);
    setStatus(`Deep Scan ALL failed: ${error.message}`, 'error');
  }
}

/**
 * Stop Deep Scan ALL
 */
export async function handleStopDeepScanAll() {
  try {
    setStatus('Stopping Deep Scan ALL...');

    runtime.sendMessage(
      { type: 'STOP_DEEP_SCAN_ALL' },
      (response) => {
        if (response && response.success) {
          setStatus(`Deep Scan ALL stopped. Saved ${response.totalLeads} leads.`, 'success');
        } else if (response) {
          setStatus('Failed to stop Deep Scan ALL', 'error');
        }
      }
    );

  } catch (error) {
    console.error('Stop Deep Scan ALL error:', error);
    setStatus(`Failed to stop: ${error.message}`, 'error');
  }
}
