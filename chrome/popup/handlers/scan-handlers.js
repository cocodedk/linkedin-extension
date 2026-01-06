/**
 * Scan and view handlers
 */

import { getLeads, saveLeads } from '../../scripts/storage.js';
import { setStatus, renderLeads } from '../ui.js';
import { clickLinkedInNextPageButton } from '../chrome-utils.js';

export async function handleGoToNextPage() {
  setStatus('Going to next page...');
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.url?.includes('linkedin.com/search/results')) {
      setStatus('Please navigate to LinkedIn search results first.', 'warning');
      return;
    }

    await clickLinkedInNextPageButton();
    setStatus('Navigated to next page.', 'success');
  } catch (error) {
    console.error('Go to Next Page failed:', error);
    setStatus(`Go to Next Page failed: ${error.message}`, 'error');
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
