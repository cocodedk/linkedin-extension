/**
 * Virk.dk enrichment handler
 */

import { getLeads, saveLeads } from '../../scripts/storage.js';
import { setStatus, renderLeads } from '../ui.js';
import { enrichLeadWithVirk } from '../../scripts/virk/virk-enrichment.js';

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

  setStatus(`Starting Virk enrichment for ${leadsWithCompany.length} leads...`);

  try {
    // Create virk.dk tab
    const tab = await browser.tabs.create({
      url: 'https://datacvr.virk.dk/',
      active: false
    });

    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    let enrichedCount = 0;
    const enrichedLeads = [];

    // Process each lead
    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i];

      if (!lead.company) {
        enrichedLeads.push(lead);
        continue;
      }

      setStatus(`Enriching ${i + 1}/${leads.length}: ${lead.company}...`);

      const enrichedLead = await enrichLeadWithVirk(lead, tab.id);
      enrichedLeads.push(enrichedLead);

      if (enrichedLead.virkEnriched) {
        enrichedCount++;
      }
    }

    // Save enriched leads
    await saveLeads(enrichedLeads);

    // Close virk.dk tab
    await browser.tabs.remove(tab.id);

    // Update UI
    renderLeads(enrichedLeads);
    setStatus(`✅ Enriched ${enrichedCount}/${leadsWithCompany.length} leads with Virk data`, 'success');

  } catch (error) {
    console.error('Virk enrichment error:', error);
    setStatus(`Enrichment failed: ${error.message}`, 'error');
  }
}
