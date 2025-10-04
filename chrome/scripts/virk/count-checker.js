/**
 * Company count checker with retry logic
 * Handles delayed page loading on Virk.dk
 */

import { getCountScript } from './virk-scripts.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check company count with retry mechanism
 * @param {number} tabId - Tab ID to execute script in
 * @param {string} companyName - Company name being searched
 * @returns {Promise<Object>} Result with count and filters
 */
export async function checkCompanyCount(tabId, companyName) {
  let result = null;
  let retries = 0;
  const maxRetries = 5;

  // Retry until we get a valid result or hit max retries
  while (retries < maxRetries) {
    const [countResult] = await chrome.scripting.executeScript({
      target: { tabId },
      func: getCountScript
    });

    const tempResult = countResult.result;

    // Log what we got on this attempt
    console.log(`[Virk] Attempt ${retries + 1} for "${companyName}": labelText="${tempResult?.labelText}", count=${tempResult?.count}, url=${tempResult?.debugInfo?.url}`);

    // Check if we got a valid result:
    // - Already filtered (labelText = 'FROM_TABLE' and count >= 0)
    // - Or label with count in parentheses
    const isAlreadyFiltered = tempResult?.alreadyFiltered && tempResult?.count >= 0;
    const hasLabelWithCount = tempResult?.labelText?.includes('(');

    if (isAlreadyFiltered || hasLabelWithCount) {
      result = tempResult;
      console.log(`[Virk] ✅ Valid result found for "${companyName}" on attempt ${retries + 1}`);
      break;
    }

    // If page is still loading, wait longer and retry
    if (tempResult?.labelText === 'LOADING' && retries < maxRetries - 1) {
      console.log(`[Virk] Retry ${retries + 1}/${maxRetries} for "${companyName}": Page still loading, waiting 2000ms...`);
      await sleep(2000); // Wait 2000ms for Vue.js to render
      retries++;
      continue;
    }

    // If no results found but page is rendered, no point retrying
    if (tempResult?.labelText === 'NO_RESULTS') {
      result = tempResult;
      console.log(`[Virk] ❌ No companies found for "${companyName}" (page fully loaded)`);
      break;
    }

    // For other cases, wait and retry
    if (retries < maxRetries - 1) {
      console.log(`[Virk] Retry ${retries + 1}/${maxRetries} for "${companyName}": No valid result yet, waiting 1500ms...`);
      await sleep(1500); // Wait 1500ms before retry
      retries++;
    } else {
      // Last retry failed, use what we have
      console.log(`[Virk] ❌ Max retries reached for "${companyName}", using last result`);
      result = tempResult;
      break;
    }
  }

  const count = result?.count ?? 0;
  const allFilters = result?.allFilters ?? [];

  console.log(`[Virk] ========================================`);
  console.log(`[Virk] Company: "${companyName}"`);
  console.log(`[Virk] Found ${count} companies`);
  console.log(`[Virk] Label: ${result?.labelText}`);

  // Log debug info if available
  if (result?.debugInfo) {
    const debug = result.debugInfo;
    console.log(`[Virk] 📋 DEBUG INFO for "${companyName}":`);
    console.log(`[Virk] Search phrase: "${companyName}"`);
    console.log(`[Virk] URL: ${debug.url}`);
    console.log(`[Virk] Document title: ${debug.documentTitle || 'N/A'}`);
    console.log(`[Virk] Ready state: ${debug.readyState || 'N/A'}`);
    console.log(`[Virk] Is filtered page: ${debug.isFiltered}`);
    console.log(`[Virk] Table found: ${debug.tableFound ?? 'N/A'}`);
    console.log(`[Virk] Label found: ${debug.labelFound ?? 'N/A'}`);
    console.log(`[Virk] Row count: ${debug.rowCount ?? 'N/A'}`);

    if (debug.tableHTML) {
      console.log(`[Virk] 📋 FULL TABLE HTML for "${companyName}":`);
      console.log(debug.tableHTML);
      console.log(`[Virk] 📋 END TABLE HTML for "${companyName}"`);
    }

    if (debug.firstRowHTML) {
      console.log(`[Virk] 📋 FIRST ROW HTML for "${companyName}":`);
      console.log(debug.firstRowHTML);
      console.log(`[Virk] 📋 END ROW HTML for "${companyName}"`);
    }

    if (debug.bodyHTML) {
      console.log(`[Virk] 📋 FULL BODY HTML for "${companyName}" (length: ${debug.bodyHTML.length}):`);
      console.log(debug.bodyHTML);
      console.log(`[Virk] 📋 END BODY HTML for "${companyName}"`);
    }

    if (debug.allDataCy) {
      console.log(`[Virk] All data-cy elements for "${companyName}":`, debug.allDataCy);
    }

    if (debug.labelHTML) {
      console.log(`[Virk] Label HTML for "${companyName}":`, debug.labelHTML);
    }

    if (debug.errorMessage) {
      console.error(`[Virk] ❌ Error for "${companyName}": ${debug.errorMessage}`);
      console.error(`[Virk] Stack: ${debug.errorStack}`);
    }
  }
  console.log(`[Virk] ========================================`);
  console.log(`[Virk] ✅ checkCompanyCount() returning for "${companyName}": count=${count}`);

  return { count, allFilters, result };
}
