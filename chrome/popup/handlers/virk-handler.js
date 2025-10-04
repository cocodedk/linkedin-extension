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
    // Create 3 virk.dk tabs for parallel processing
    const PARALLEL_TABS = 3;
    const tabs = await Promise.all(
      Array(PARALLEL_TABS).fill(0).map(() =>
        chrome.tabs.create({ url: 'https://datacvr.virk.dk/', active: false })
      )
    );

    // Wait for pages to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    let enrichedCount = 0;
    const enrichedLeads = [...leads];

    // Get leads that need enrichment
    const leadsToEnrich = leads.map((lead, index) => ({ lead, index }))
      .filter(({ lead }) => lead.company);

    // Process in parallel batches
    for (let i = 0; i < leadsToEnrich.length; i += PARALLEL_TABS) {
      const batch = leadsToEnrich.slice(i, i + PARALLEL_TABS);

      setStatus(`Enriching batch ${Math.floor(i / PARALLEL_TABS) + 1}/${Math.ceil(leadsToEnrich.length / PARALLEL_TABS)}...`);

      const results = await Promise.all(
        batch.map(({ lead, index }, batchIdx) =>
          enrichLeadWithVirk(lead, tabs[batchIdx].id).then(enriched => ({ enriched, index }))
        )
      );

      results.forEach(({ enriched, index }) => {
        enrichedLeads[index] = enriched;
        if (enriched.virkEnriched) enrichedCount++;
      });
    }

    // Save enriched leads
    await saveLeads(enrichedLeads);

    // Close virk.dk tabs
    await Promise.all(tabs.map(tab => chrome.tabs.remove(tab.id)));

    // Update UI
    renderLeads(enrichedLeads);
    setStatus(`✅ Enriched ${enrichedCount}/${leadsWithCompany.length} leads with Virk data`, 'success');

  } catch (error) {
    console.error('Virk enrichment error:', error);
    setStatus(`Enrichment failed: ${error.message}`, 'error');
  }
}
