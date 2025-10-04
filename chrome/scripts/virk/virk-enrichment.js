/**
 * Virk.dk enrichment orchestration
 * Main logic for enriching leads with virk.dk data
 */

import { TIMING } from './virk-selectors.js';
import {
  searchScript,
  getCountScript,
  clickFilterScript,
  navigateScript,
  extractDataScript
} from './virk-scripts.js';

/**
 * Enrich a single lead with virk.dk data
 * @param {Object} lead - Lead object to enrich
 * @param {number} tabId - Tab ID of virk.dk page
 * @returns {Promise<Object>} Enriched lead object
 */
export async function enrichLeadWithVirk(lead, tabId) {
  if (!lead.company) {
    return { ...lead, virkEnriched: false };
  }

  try {
    // Step 1: Search for company
    await chrome.scripting.executeScript({
      target: { tabId },
      func: searchScript,
      args: [lead.company]
    });

    await sleep(TIMING.searchDelay);

    // Step 2: Click filter to show only companies
    await chrome.scripting.executeScript({
      target: { tabId },
      func: clickFilterScript
    });

    await sleep(TIMING.navigationDelay);

    // Step 3: Check if any companies found
    const [countResult] = await chrome.scripting.executeScript({
      target: { tabId },
      func: getCountScript
    });

    const count = countResult.result;
    if (count === 0) {
      return { ...lead, virkEnriched: false };
    }

    // Step 4: Navigate to first company (regardless of how many matches)
    await chrome.scripting.executeScript({
      target: { tabId },
      func: navigateScript
    });

    await sleep(TIMING.pageLoadDelay);

    // Step 5: Extract company data
    const [dataResult] = await chrome.scripting.executeScript({
      target: { tabId },
      func: extractDataScript
    });

    const virkData = dataResult.result;

    return {
      ...lead,
      virkCvrNumber: virkData.cvrNumber,
      virkAddress: virkData.address,
      virkPostalCode: virkData.postalCode,
      virkCity: virkData.city,
      virkStartDate: virkData.startDate,
      virkCompanyForm: virkData.companyForm,
      virkStatus: virkData.status,
      virkEnriched: true,
      virkEnrichmentDate: new Date().toISOString()
    };
  } catch (error) {
    console.error('Virk enrichment error:', error);
    return { ...lead, virkEnriched: false };
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
