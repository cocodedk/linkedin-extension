/**
 * New tab export handlers
 */

import { toCsv, toJson, openInNewTab } from '../../scripts/exporters.js';
import { setStatus } from '../ui.js';
import { validateAndGetLeads } from './export-handlers-utils.js';

export async function handleOpenCsvInTab() {
  try {
    const leads = await validateAndGetLeads();
    if (!leads) return;
    const content = toCsv(leads);
    await openInNewTab(content, 'linkedin-leads.csv', 'text/csv');
    setStatus('CSV opened in new tab', 'success');
  } catch (error) {
    console.error('Open CSV in tab error:', error);
    setStatus(`Failed to open tab: ${error.message}`, 'error');
  }
}

export async function handleOpenJsonInTab() {
  try {
    const leads = await validateAndGetLeads();
    if (!leads) return;
    const content = toJson(leads);
    await openInNewTab(content, 'linkedin-leads.json', 'application/json');
    setStatus('JSON opened in new tab', 'success');
  } catch (error) {
    console.error('Open JSON in tab error:', error);
    setStatus(`Failed to open tab: ${error.message}`, 'error');
  }
}
