/**
 * Scan and view handlers
 */

import { getLeads, saveLeads } from '../../scripts/storage.js';
import { setStatus, renderLeads } from '../ui.js';
import { scrapeActiveTab, clickNextButton } from '../chrome-utils.js';

export async function handleScan() {
  setStatus('Starting deep scan in background...');
  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url.includes('linkedin.com/search/results')) {
      setStatus('Please navigate to LinkedIn search results first', 'warning');
      return;
    }

    // Send message to background worker for deep scan
    setStatus('Deep scan running in background. Popup will close.');

    chrome.runtime.sendMessage(
      { type: 'START_DEEP_SCAN', searchTabId: tab.id },
      (response) => {
        if (response && response.success) {
          console.log('Deep scan started successfully');
        } else if (response) {
          console.error('Deep scan failed:', response.error);
        }
      }
    );

    // Close popup after 2 seconds
    setTimeout(() => window.close(), 2000);

  } catch (error) {
    console.error(error);
    setStatus(`Scan failed: ${error.message}`, 'error');
  }
}

export async function handleScanNext() {
  setStatus('Clicking Next button...');
  try {
    await clickNextButton();
    setStatus('Waiting for page to load...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    await handleScan();
  } catch (error) {
    console.error(error);
    setStatus(`Scan Next failed: ${error.message}`, 'error');
  }
}

export async function handleViewLeads() {
  const leads = await getLeads();
  renderLeads(leads);
  setStatus(`Loaded ${leads.length} lead(s).`);
}

export async function handleClearLeads() {
  const { clearLeads } = await import('../../scripts/storage.js');
  await clearLeads();
  renderLeads([]);
  setStatus('Cleared stored leads.', 'success');
}
