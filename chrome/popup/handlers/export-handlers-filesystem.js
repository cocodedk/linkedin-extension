/**
 * File System Access API export handlers
 */

import { toCsv, toJson, saveWithFileSystemAPI } from '../../scripts/exporters.js';
import { setStatus } from '../ui.js';
import { validateAndGetLeads } from './export-handlers-utils.js';

export async function handleSaveCsvWithFS() {
  try {
    const leads = await validateAndGetLeads();
    if (!leads) return;
    const content = toCsv(leads);
    await saveWithFileSystemAPI(content, 'linkedin-leads.csv');
    setStatus('CSV saved successfully', 'success');
  } catch (error) {
    console.error('Save CSV with FS error:', error);
    if (error.message.includes('not supported')) {
      setStatus('File System API not supported in this browser', 'warning');
    } else {
      setStatus(`Save failed: ${error.message}`, 'error');
    }
  }
}

export async function handleSaveJsonWithFS() {
  try {
    const leads = await validateAndGetLeads();
    if (!leads) return;
    const content = toJson(leads);
    await saveWithFileSystemAPI(content, 'linkedin-leads.json');
    setStatus('JSON saved successfully', 'success');
  } catch (error) {
    console.error('Save JSON with FS error:', error);
    if (error.message.includes('not supported')) {
      setStatus('File System API not supported in this browser', 'warning');
    } else {
      setStatus(`Save failed: ${error.message}`, 'error');
    }
  }
}
