/**
 * Virk.dk enrichment orchestration
 * Main logic for enriching leads with virk.dk data
 */

import { TIMING as DEFAULT_TIMING } from './virk-selectors.js';
import {
  searchScript,
  clickFilterScript,
  navigateScript,
  extractDataScript
} from './virk-scripts.js';
import { checkCompanyCount } from './count-checker.js';

/**
 * Enrich a single lead with virk.dk data
 * @param {Object} lead - Lead object to enrich
 * @param {number} tabId - Tab ID of virk.dk page
 * @returns {Promise<Object>} Enriched lead object
 */
export async function enrichLeadWithVirk(lead, tabId, options = {}) {
  const timing = {
    ...DEFAULT_TIMING,
    ...(options.timing || {})
  };
  const startTime = Date.now();
  console.log(`[Virk] ⏱️ Starting enrichment for: ${lead.name} (${lead.company})`);

  if (!lead.company) {
    console.log(`[Virk] Skipping ${lead.name} - no company`);
    return { ...lead, virkEnriched: false };
  }

  try {
    // Step 1: Search for company
    const step1Start = Date.now();
    console.log(`[Virk] Step 1: Searching for "${lead.company}" in tab ${tabId}`);
    await chrome.scripting.executeScript({
      target: { tabId },
      func: searchScript,
      args: [lead.company]
    });

    console.log(`[Virk] ⏱️ Step 1 took ${Date.now() - step1Start}ms`);
    const sleepStart = Date.now();
    await sleep(timing.searchDelay);
    console.log(`[Virk] ⏱️ Search delay: ${Date.now() - sleepStart}ms (configured: ${timing.searchDelay}ms)`);

    // Step 2: Check company count with retry (page might still be loading)
    const step2Start = Date.now();
    console.log(`[Virk] Step 2 for "${lead.company}": Checking company count from filter label`);
    const { count, result } = await checkCompanyCount(tabId, lead.company);

    console.log(`[Virk] ⏱️ Step 2 for "${lead.company}" took ${Date.now() - step2Start}ms`);
    console.log(`[Virk] 🔍 Count check complete for "${lead.company}": count=${count}, alreadyFiltered=${result?.alreadyFiltered}`);

    if (count === 0) {
      console.log(`[Virk] No companies found for "${lead.company}" - marking as not enriched`);
      return { ...lead, virkEnriched: false };
    }

    // Step 3: Click filter to show only companies (skip if already filtered)
    const step3Start = Date.now();
    console.log(`[Virk] 📍 Entering Step 3 for "${lead.company}"`);
    if (result?.alreadyFiltered) {
      console.log(`[Virk] Step 3 for "${lead.company}": Results already filtered - skipping filter click`);
    } else {
      console.log(`[Virk] Step 3 for "${lead.company}": Clicking company filter to show results`);
      try {
        await chrome.scripting.executeScript({
          target: { tabId },
          func: clickFilterScript
        });
        console.log(`[Virk] ✅ Filter click executed for "${lead.company}"`);
      } catch (error) {
        console.error(`[Virk] ❌ Error clicking filter for "${lead.company}":`, error);
        throw error;
      }
      const navSleepStart = Date.now();
      await sleep(timing.navigationDelay);
      console.log(`[Virk] ⏱️ Navigation delay: ${Date.now() - navSleepStart}ms (configured: ${timing.navigationDelay}ms)`);
    }
    console.log(`[Virk] ⏱️ Step 3 for "${lead.company}" took ${Date.now() - step3Start}ms`);

    // Step 4: Navigate to first company (regardless of how many matches)
    const step4Start = Date.now();
    console.log(`[Virk] Step 4: Navigating to first result for "${lead.company}"`);
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        func: navigateScript
      });
      console.log(`[Virk] ✅ Navigation executed for "${lead.company}"`);
    } catch (error) {
      console.error(`[Virk] ❌ Error navigating for "${lead.company}":`, error);
      throw error;
    }

    const pageSleepStart = Date.now();
    await sleep(timing.pageLoadDelay);
    console.log(`[Virk] ⏱️ Page load delay: ${Date.now() - pageSleepStart}ms (configured: ${timing.pageLoadDelay}ms)`);
    console.log(`[Virk] ⏱️ Step 4 for "${lead.company}" took ${Date.now() - step4Start}ms`);

    // Log current URL to verify we're on the detail page
    const [urlResult] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => ({ url: window.location.href, title: document.title })
    });
    console.log(`[Virk] 📄 Current page for "${lead.company}": ${urlResult.result.url}`);
    console.log(`[Virk] 📄 Page title: ${urlResult.result.title}`);

    // Step 5: Extract company data
    const step5Start = Date.now();
    console.log(`[Virk] Step 5: Extracting company data for "${lead.company}"`);
    let dataResult;
    try {
      [dataResult] = await chrome.scripting.executeScript({
        target: { tabId },
        func: extractDataScript
      });
      console.log(`[Virk] ✅ Data extraction executed for "${lead.company}"`);
    } catch (error) {
      console.error(`[Virk] ❌ Error extracting data for "${lead.company}":`, error);
      throw error;
    }

    const virkData = dataResult.result;
    console.log(`[Virk] Extracted data for "${lead.company}":`, virkData);
    console.log(`[Virk] ⏱️ Step 5 for "${lead.company}" took ${Date.now() - step5Start}ms`);

    const enrichedLead = {
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

    const totalTime = Date.now() - startTime;
    console.log(`[Virk] ⏱️ ✅ TOTAL TIME for "${lead.company}": ${totalTime}ms (${(totalTime/1000).toFixed(1)}s)`);
    console.log(`[Virk] ✅ Successfully enriched ${lead.name} with CVR: ${virkData.cvrNumber}`);
    return enrichedLead;

  } catch (error) {
    console.error(`[Virk] ❌ Error enriching ${lead.name}:`, error);
    return { ...lead, virkEnriched: false };
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
