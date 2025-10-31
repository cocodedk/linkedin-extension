/**
 * Deep scan background worker - orchestrates profile extraction
 */

import {
  getProfileLinksScript,
  extractCompanyScript,
  extractProfileDataScript
} from '../popup/handlers/scan-deep-scripts.js';
import { processProfile } from './profile-processor.js';
import { processBatches } from './batch-processor.js';
import { getSettings } from '../scripts/settings.js';

/**
 * Run deep scan in background
 * @param {number} searchTabId - ID of the search results tab
 * @returns {Promise<Array>} Extracted leads
 */
export async function runDeepScanInBackground(searchTabId) {
  console.log('Starting deep scan in background...');

  const { deepScan } = await getSettings();
  console.log(`Deep Scan: Settings -> batchSize:${deepScan.batchSize}, batchDelay:${deepScan.batchDelayMs}ms, profileDelay:${deepScan.profileLoadDelayMs}ms`);

  // Step 1: Get all profile links from search results
  const [profilesResult] = await chrome.scripting.executeScript({
    target: { tabId: searchTabId },
    func: getProfileLinksScript
  });

  const profiles = profilesResult.result || [];

  if (profiles.length === 0) {
    throw new Error('No profiles found on page');
  }

  console.log(`Found ${profiles.length} profiles to process`);

  // Step 2: Process profiles in parallel batches
  const processProfileWithScripts = (profile) =>
    processProfile(profile, extractCompanyScript, extractProfileDataScript, {
      profileLoadDelayMs: deepScan.profileLoadDelayMs
    });

  const leads = await processBatches(profiles, processProfileWithScripts, {
    batchSize: deepScan.batchSize,
    batchDelayMs: deepScan.batchDelayMs
  });

  console.log(`Deep scan complete! Processed ${leads.length} leads`);
  return leads;
}
