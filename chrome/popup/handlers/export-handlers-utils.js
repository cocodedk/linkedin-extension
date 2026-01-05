/**
 * Shared utilities for export handlers
 */

import { getLeads } from '../../scripts/storage.js';
import { setStatus } from '../ui.js';

export async function validateAndGetLeads() {
  const leads = await getLeads();
  if (!Array.isArray(leads)) {
    setStatus('Invalid leads data format', 'error');
    return null;
  }
  if (leads.length === 0) {
    setStatus('No leads to export.', 'warning');
    return null;
  }
  return leads;
}
