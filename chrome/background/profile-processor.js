/**
 * Process individual LinkedIn profiles
 */

import { enrichWithCompanyData } from '../popup/handlers/company-enrichment.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Process a single profile - extract company and data
 * @param {Object} options
 * @param {number} [options.profileLoadDelayMs=4000]
 */
export async function processProfile(
  profile,
  extractCompanyScript,
  extractProfileDataScript,
  options = {}
) {
  const profileLoadDelayMs = Number.isFinite(options.profileLoadDelayMs)
    ? options.profileLoadDelayMs
    : 4000;

  let profileTab;

  try {
    profileTab = await chrome.tabs.create({
      url: profile.profileUrl,
      active: false
    });

    // Wait for profile page to load before extracting data
    await sleep(profileLoadDelayMs);

    // Extract company
    const [companyResult] = await chrome.scripting.executeScript({
      target: { tabId: profileTab.id },
      func: extractCompanyScript
    });

    // Extract headline and location
    const [profileData] = await chrome.scripting.executeScript({
      target: { tabId: profileTab.id },
      func: extractProfileDataScript
    });

    const data = profileData.result || {};
    const company = companyResult.result || '';

    // Extract company URL and enrich with additional company data
    const companyEnrichment = await enrichWithCompanyData(profileTab.id, '');

    return buildLeadData(profile, company, data, companyEnrichment);
  } catch (error) {
    console.error(`Error processing ${profile.name}:`, error);
    return buildLeadData(profile, '', {}, {});
  } finally {
    if (profileTab) {
      try {
        await chrome.tabs.remove(profileTab.id);
      } catch (e) {
        // Tab may already be closed
      }
    }
  }
}

function buildLeadData(profile, company, data, companyEnrichment = {}) {
  return {
    name: profile.name,
    headline: data.headline || '',
    company: company || '',
    companySize: companyEnrichment.companySize || '',
    companyIndustry: companyEnrichment.companyIndustry || '',
    companyTechStack: companyEnrichment.companyTechStack || '',
    location: data.location || '',
    contact: profile.profileUrl,
    contactLinks: [{ href: profile.profileUrl, label: 'LinkedIn', type: 'linkedin' }],
    profileUrl: profile.profileUrl
  };
}
