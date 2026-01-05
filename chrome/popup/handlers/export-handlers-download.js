/**
 * Download export handlers
 */

import { toCsv, toJson, triggerDownload } from '../../scripts/exporters.js';
import { setStatus } from '../ui.js';
import { validateAndGetLeads } from './export-handlers-utils.js';

export async function handleExportCsv() {
  try {
    const leads = await validateAndGetLeads();
    if (!leads) return;

    if (leads.length > 1000) {
      setStatus(`Processing ${leads.length} leads. This may take a moment...`, 'info');
    }

    const content = toCsv(leads);
    await triggerDownload({
      filename: 'linkedin-leads.csv',
      mimeType: 'text/csv',
      content
    });
    setStatus(`CSV export completed successfully (${leads.length} leads).`, 'success');
  } catch (error) {
    console.error('CSV export error:', error);
    let userMessage = 'Export failed';
    if (error.message.includes('Too many leads')) {
      userMessage = 'Too many leads to export. Please reduce your dataset size.';
    } else if (error.message.includes('File too large')) {
      userMessage = 'Export file too large. Please reduce your dataset size.';
    } else if (error.message.includes('Downloads API not available')) {
      userMessage = 'Browser download feature not available. Please try again.';
    } else if (error.message) {
      userMessage = `Export failed: ${error.message}`;
    }
    setStatus(userMessage, 'error');
  }
}

export async function handleExportJson() {
  try {
    const leads = await validateAndGetLeads();
    if (!leads) return;

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
