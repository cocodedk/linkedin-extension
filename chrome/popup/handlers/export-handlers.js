/**
 * Export handlers
 */

import { getLeads } from '../../scripts/storage.js';
import { toCsv, toJson, triggerDownload } from '../../scripts/exporters.js';
import { setStatus } from '../ui.js';

export async function handleExportCsv() {
  const leads = await getLeads();
  if (!leads.length) {
    setStatus('No leads to export.', 'warning');
    return;
  }

  const content = toCsv(leads);
  await triggerDownload({
    filename: 'linkedin-leads.csv',
    mimeType: 'text/csv',
    content
  });
  setStatus('CSV export triggered.', 'success');
}

export async function handleExportJson() {
  const leads = await getLeads();
  if (!leads.length) {
    setStatus('No leads to export.', 'warning');
    return;
  }

  const content = toJson(leads);
  await triggerDownload({
    filename: 'linkedin-leads.json',
    mimeType: 'application/json',
    content
  });
  setStatus('JSON export triggered.', 'success');
}
