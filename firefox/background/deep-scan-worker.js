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

/**
 * Run deep scan in background
 * @param {number} searchTabId - ID of the search results tab
 * @returns {Promise<Array>} Extracted leads
 */
export async function runDeepScanInBackground(searchTabId) {
  console.log('Starting deep scan in background...');

  // Step 1: Get all profile links from search results
  const [profilesResult] = await browser.scripting.executeScript({
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
    processProfile(profile, extractCompanyScript, extractProfileDataScript);

  const leads = await processBatches(profiles, processProfileWithScripts, 2);  // Process 2 profiles at a time

  console.log(`Deep scan complete! Processed ${leads.length} leads`);
  return leads;
}
