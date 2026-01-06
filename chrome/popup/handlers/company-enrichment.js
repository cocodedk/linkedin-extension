/**
 * Company enrichment logic for deep scan
 * Extracts additional company data from company about pages
 */

import { extractCompanyUrlScript, extractCompanyDataScript } from './scan-deep-scripts.js';

/**
 * Enrich a lead with additional company data
 * @param {number} profileTabId - ID of the profile tab
 * @param {string} companyUrl - URL of the company page
 * @returns {Promise<Object>} Company enrichment data
 */
export async function enrichWithCompanyData(profileTabId, companyUrl) {
  let companyTab;

  try {
    // Extract company URL from profile page
    const [urlResult] = await chrome.scripting.executeScript({
      target: { tabId: profileTabId },
      func: extractCompanyUrlScript
    });

    const extractedCompanyUrl = urlResult.result || companyUrl;

    if (!extractedCompanyUrl) {
      console.log('[Company Enrichment] No company URL found, skipping enrichment');
      return { companySize: '', companyIndustry: '', companyTechStack: '' };
    }
    console.log(`[Company Enrichment] Found company URL: ${extractedCompanyUrl}`);

    // Create tab for company page
    companyTab = await chrome.tabs.create({
      url: extractedCompanyUrl,
      active: false
    });

    // Wait for company page to load
    await sleep(3000);

    // Normalize URL and navigate to about page if not already there
    let aboutUrl;
    try {
      const url = new URL(extractedCompanyUrl);
      url.search = '';
      url.hash = '';
      let pathname = url.pathname.replace(/\/$/, '');
      if (!pathname.endsWith('/about')) {
        pathname += '/about';
      }
      url.pathname = pathname;
      aboutUrl = url.toString();
    } catch (e) {
      aboutUrl = extractedCompanyUrl.endsWith('/about')
        ? extractedCompanyUrl
        : `${extractedCompanyUrl.replace(/\/$/, '')}/about`;
    }

    if (aboutUrl !== extractedCompanyUrl) {
      console.log(`[Company Enrichment] Navigating to about page: ${aboutUrl}`);
      await chrome.tabs.update(companyTab.id, { url: aboutUrl });
      await sleep(3000);
    }

    // Extract company data from about page
    const [dataResult] = await chrome.scripting.executeScript({
      target: { tabId: companyTab.id },
      func: extractCompanyDataScript
    });

    const companyData = dataResult.result || {};

    console.log('[Company Enrichment] Extracted company data:', companyData);

    return {
      companySize: companyData.companySize || '',
      companyIndustry: companyData.companyIndustry || '',
      companyTechStack: companyData.companyTechStack || ''
    };
  } catch (error) {
    console.error('[Company Enrichment] Error during company enrichment:', error);
    return { companySize: '', companyIndustry: '', companyTechStack: '' };
  } finally {
    if (companyTab) {
      try {
        await chrome.tabs.remove(companyTab.id);
      } catch (e) {
        // Tab may already be closed
      }
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
