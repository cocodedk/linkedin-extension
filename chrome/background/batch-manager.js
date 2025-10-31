/**
 * Manages batch processing for Virk enrichment
 * Creates fresh tabs, processes leads, closes tabs
 */

import { enrichLeadWithVirk } from '../scripts/virk/virk-enrichment.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Process a single batch with fresh tabs
 * @param {Array} batch - Array of {lead, index} objects
 * @param {number} batchNum - Current batch number
 * @param {number} totalBatches - Total number of batches
 * @param {Object} [options]
 * @param {number} [options.tabWarmupDelayMs=10000]
 * @param {Object} [options.timing]
 * @returns {Promise<Array>} Array of {enriched, index} results
 */
export async function processBatch(batch, batchNum, totalBatches, options = {}) {
  console.log(`\n📦 [Background] Processing batch ${batchNum}/${totalBatches} (${batch.length} leads)...`);
  console.log(`[Background] Batch contains:`, batch.map(b => `${b.lead.name} (${b.lead.company})`));

  // Create fresh tabs for this batch
  console.log(`[Background] Creating ${batch.length} fresh Virk.dk tabs...`);

  const warmupDelay = Number.isFinite(options.tabWarmupDelayMs) && options.tabWarmupDelayMs >= 0
    ? options.tabWarmupDelayMs
    : 10000;

  const batchWindows = await Promise.all(
    batch.map(async () => {
      // Create window with tab for each company
      const window = await chrome.windows.create({
        url: 'https://datacvr.virk.dk/',
        focused: true,
        type: 'normal'
      });

      const tabId = window.tabs[0].id;

      // Execute script to set up page context that might avoid bot detection
      try {
        await chrome.scripting.executeScript({
          target: { tabId },
          func: () => {
            // Set up window properties that might be expected by the site
            if (!window.navigator.webdriver) {
              Object.defineProperty(window.navigator, 'webdriver', {
                get: () => undefined
              });
            }

            // Override some common automation detection methods
            if (!window.chrome || !window.chrome.runtime) {
              window.chrome = window.chrome || {};
              window.chrome.runtime = window.chrome.runtime || {};
            }
          }
        });
      } catch (e) {
        console.log(`[Background] Could not set up window context:`, e.message);
      }

      return { windowId: window.id, tabId };
    })
  );
  console.log(`[Background] Created windows:`, batchWindows.map(w => `window:${w.windowId}, tab:${w.tabId}`));

  // Wait for pages to load and JavaScript to initialize
  if (warmupDelay > 0) {
    await sleep(warmupDelay);
  }

  // Minimize windows after initialization to avoid UI clutter
  await Promise.all(batchWindows.map(({ windowId }) => chrome.windows.update(windowId, { state: 'minimized' })));

  const enrichmentOptions = options.timing ? { timing: options.timing } : undefined;

  try {
    // Process batch in parallel
    const results = await Promise.all(
      batch.map(({ lead, index }, batchIdx) => {
        console.log(`[Background] Assigning lead "${lead.name}" to window ${batchWindows[batchIdx].windowId}, tab ${batchWindows[batchIdx].tabId}`);
        return enrichLeadWithVirk(lead, batchWindows[batchIdx].tabId, enrichmentOptions)
          .then(enriched => {
            console.log(`[Background] Lead "${lead.name}" enrichment complete: ${enriched.virkEnriched ? '✅ Success' : '❌ Failed'}`);
            return { enriched, index };
          })
          .catch(error => {
            console.error(`[Background] ❌ Error enriching lead at index ${index}:`, error);
            return { enriched: { ...lead, virkEnriched: false }, index };
          });
      })
    );

    return results;
  } finally {
    // Always close windows
    console.log(`[Background] Closing ${batchWindows.length} windows from batch ${batchNum}...`);
    try {
      await Promise.all(batchWindows.map(({ windowId }) => chrome.windows.remove(windowId).catch(e => console.error('Window close error:', e))));
    } catch (error) {
      console.error(`[Background] Error closing batch ${batchNum} windows:`, error);
    }
  }
}
