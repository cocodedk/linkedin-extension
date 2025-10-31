/**
 * Virk.dk enrichment handler - triggers background worker
 */

import { runtime } from '../../api/runtime.js';
import { getLeads } from '../../scripts/storage.js';
import { setStatus } from '../ui.js';

export async function handleEnrichWithVirk() {
  const leads = await getLeads();

  if (leads.length === 0) {
    setStatus('No leads to enrich. Scan LinkedIn first.', 'warning');
    return;
  }

  const leadsWithCompany = leads.filter(lead => lead.company);
  if (leadsWithCompany.length === 0) {
    setStatus('No leads with company names found.', 'warning');
    return;
  }

  setStatus('Starting Virk enrichment in background...');

  try {
    // Send message to background worker
    runtime.sendMessage(
      { type: 'START_VIRK_ENRICHMENT' },
      (response) => {
        if (response && response.success) {
          console.log('Virk enrichment started successfully');
          console.log('Result:', response.result);
          setStatus(`✅ Enrichment complete! ${response.result.enriched}/${response.result.total} leads enriched`);
        } else if (response) {
          console.error('Virk enrichment failed:', response.error);
          setStatus(`❌ Enrichment failed: ${response.error}`, 'error');
        }
      }
    );

    // Keep popup open - status will update when background worker completes
    setStatus('Virk enrichment running in background... (check console for progress)');

  } catch (error) {
    console.error('Virk enrichment error:', error);
    setStatus(`Failed to start enrichment: ${error.message}`, 'error');
  }
}
