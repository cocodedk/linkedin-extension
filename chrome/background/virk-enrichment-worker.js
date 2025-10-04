/**
 * Virk enrichment background worker
 * Runs independently of popup to survive popup closure
 */

import { getLeads, saveLeads } from '../scripts/storage.js';
import { processBatch } from './batch-manager.js';

const PARALLEL_TABS = 1;  // Process one lead at a time for debugging

/**
 * Run Virk enrichment in background
 * @returns {Promise<Object>} Result with enriched leads count
 */
export async function runVirkEnrichmentInBackground() {
  console.log('🚀 [Background] Starting Virk enrichment...');

  const leads = await getLeads();
  console.log(`[Background] Loaded ${leads.length} leads from storage`);

  const leadsWithCompany = leads.filter(lead => lead.company);
  console.log(`[Background] ${leadsWithCompany.length} leads have company names`);

  if (leadsWithCompany.length === 0) {
    console.error('[Background] No leads with company names found - aborting');
    throw new Error('No leads with company names found');
  }

  let enrichedCount = 0;
  const enrichedLeads = [...leads];

  // Get leads that need enrichment with their indices
  const leadsToEnrich = leads.map((lead, index) => ({ lead, index }))
    .filter(({ lead }) => lead.company);

  console.log(`[Background] Starting to process ${leadsToEnrich.length} leads...`);

  // Process in parallel batches
  for (let i = 0; i < leadsToEnrich.length; i += PARALLEL_TABS) {
    const batch = leadsToEnrich.slice(i, i + PARALLEL_TABS);
    const batchNum = Math.floor(i / PARALLEL_TABS) + 1;
    const totalBatches = Math.ceil(leadsToEnrich.length / PARALLEL_TABS);

    try {
      const results = await processBatch(batch, batchNum, totalBatches);

      results.forEach(({ enriched, index }) => {
        enrichedLeads[index] = enriched;
        if (enriched.virkEnriched) enrichedCount++;
      });

      // Save after each batch
      console.log(`[Background] 💾 Saving batch ${batchNum} results to storage...`);
      await saveLeads(enrichedLeads);
      console.log(`[Background] ✅ Progress saved - ${enrichedCount}/${leadsWithCompany.length} enriched so far`);

    } catch (error) {
      console.error(`[Background] ❌ Error in batch ${batchNum}:`, error);
    }
  }

  console.log(`\n🎉 [Background] Virk enrichment complete! Enriched ${enrichedCount}/${leadsWithCompany.length} leads`);

  return {
    total: leadsWithCompany.length,
    enriched: enrichedCount,
    leads: enrichedLeads
  };
}
