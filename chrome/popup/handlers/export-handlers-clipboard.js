/**
 * Clipboard export handlers
 */

import { toCsv, toJson, copyToClipboard } from '../../scripts/exporters.js';
import { setStatus } from '../ui.js';
import { validateAndGetLeads } from './export-handlers-utils.js';

export async function handleCopyCsv() {
  try {
    const leads = await validateAndGetLeads();
    if (!leads) return;
    const content = toCsv(leads);
    await copyToClipboard(content, 'linkedin-leads.csv');
    setStatus('CSV copied to clipboard!', 'success');
  } catch (error) {
    console.error('Copy CSV error:', error);
    setStatus(`Copy failed: ${error.message}`, 'error');
  }
}

export async function handleCopyJson() {
  try {
    const leads = await validateAndGetLeads();
    if (!leads) return;
    const content = toJson(leads);
    await copyToClipboard(content, 'linkedin-leads.json');
    setStatus('JSON copied to clipboard!', 'success');
  } catch (error) {
    console.error('Copy JSON error:', error);
    setStatus(`Copy failed: ${error.message}`, 'error');
  }
}
