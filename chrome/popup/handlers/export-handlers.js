/**
 * Export handlers
 */

import { getLeads } from '../../scripts/storage.js';
import { toCsv, toJson, triggerDownload } from '../../scripts/exporters.js';
import { setStatus } from '../ui.js';

export async function handleExportCsv() {
  try {
    const leads = await getLeads();

    if (!leads.length) {
      setStatus('No leads to export.', 'warning');
      return;
    }

    // Validate leads data
    if (!Array.isArray(leads)) {
      throw new Error('Invalid leads data format');
    }

    const content = toCsv(leads);
    await triggerDownload({
      filename: 'linkedin-leads.csv',
      mimeType: 'text/csv',
      content
    });
    setStatus('CSV export triggered.', 'success');
  } catch (error) {
    console.error('CSV export error:', error);
    setStatus(`Export failed: ${error.message}`, 'error');
  }
}

export async function handleExportJson() {
  try {
    const leads = await getLeads();

    if (!leads.length) {
      setStatus('No leads to export.', 'warning');
      return;
    }

    // Validate leads data
    if (!Array.isArray(leads)) {
      throw new Error('Invalid leads data format');
    }

    const content = toJson(leads);
    await triggerDownload({
      filename: 'linkedin-leads.json',
      mimeType: 'application/json',
      content
    });
    setStatus('JSON export triggered.', 'success');
  } catch (error) {
    console.error('JSON export error:', error);
    setStatus(`Export failed: ${error.message}`, 'error');
  }
}
