/**
 * Scan and view handlers
 */

import { getLeads, saveLeads } from '../../scripts/storage.js';
import { setStatus, renderLeads } from '../ui.js';
import { scrapeActiveTab, clickNextButton } from '../chrome-utils.js';

export async function handleScan() {
  setStatus('Scanning current page...');
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.url?.includes('linkedin.com/search/results')) {
      setStatus('Please navigate to LinkedIn search results first.', 'warning');
      return;
    }

    const scanResult = await scrapeActiveTab();
    const { leads = [], debugInfo = {} } = scanResult ?? {};
    console.debug('Scan results debug info:', debugInfo);

    if (!Array.isArray(leads) || leads.length === 0) {
      setStatus('No leads found on this page.', 'warning');
      return;
    }

    const savedLeads = await saveLeads(leads);
    renderLeads(savedLeads);
    setStatus(`Captured ${leads.length} lead(s). Stored ${savedLeads.length} total.`, 'success');
  } catch (error) {
    console.error('Scan failed:', error);
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
