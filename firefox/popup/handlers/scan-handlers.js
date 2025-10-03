/**
 * Scan and view handlers
 */

import { getLeads, saveLeads } from '../../scripts/storage.js';
import { setStatus, renderLeads } from '../ui.js';
import { scrapeActiveTab } from '../browser-utils.js';

export async function handleScan() {
  setStatus('Scanning results...');
  try {
    const result = await scrapeActiveTab();
    const leadsFromPage = Array.isArray(result?.leads) ? result.leads : [];
    if (!leadsFromPage.length) {
      setStatus('No results found on the page.', 'warning');
      return;
    }

    const leads = await saveLeads(leadsFromPage);
    setStatus(`Stored ${leads.length} lead(s).`, 'success');
    renderLeads(leads);
  } catch (error) {
    console.error(error);
    setStatus(`Scan failed: ${error.message}`, 'error');
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

