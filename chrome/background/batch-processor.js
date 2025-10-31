/**
 * Batch processing utilities for parallel profile extraction
 */

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Process profiles in parallel batches
 */
export async function processBatches(profiles, processProfileFn, options = {}) {
  const batchSize = Number.isFinite(options.batchSize) && options.batchSize > 0
    ? options.batchSize
    : 3;
  const batchDelayMs = Number.isFinite(options.batchDelayMs) && options.batchDelayMs >= 0
    ? options.batchDelayMs
    : 3000;
  const leads = [];

  for (let i = 0; i < profiles.length; i += batchSize) {
    const batch = profiles.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(profiles.length / batchSize);

    console.log(`Processing batch ${batchNumber}/${totalBatches}`);

    const batchResults = await Promise.all(
      batch.map(profile => processProfileFn(profile))
    );

    leads.push(...batchResults);
    const hasMoreBatches = i + batchSize < profiles.length;
    if (hasMoreBatches && batchDelayMs > 0) {
      await sleep(batchDelayMs); // Rate limit between batches
    }
  }

  return leads;
}
