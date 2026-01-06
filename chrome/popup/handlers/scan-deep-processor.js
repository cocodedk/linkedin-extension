/**
 * Profile processing logic for deep scan
 */

import { extractCompanyScript, extractProfileDataScript } from './scan-deep-scripts.js';
import { enrichWithCompanyData } from './company-enrichment.js';

/**
 * Process a single profile in a new tab
 * @param {Object} profile - Profile with name and profileUrl
 * @param {number} index - Current index
 * @param {number} total - Total profiles
 * @param {Function} setStatus - Status callback
 * @returns {Promise<Object>} Lead object
 */
export async function processProfile(profile, index, total, setStatus) {
  setStatus(`Processing ${index + 1}/${total}: ${profile.name}...`);

  let profileTab;

  try {
    // Open profile in new tab (background)
    profileTab = await chrome.tabs.create({
      url: profile.profileUrl,
      active: false
    });

    // Wait for profile to load
    await sleep(3000);

    // Extract company from profile overlay
    const [companyResult] = await chrome.scripting.executeScript({
      target: { tabId: profileTab.id },
      func: extractCompanyScript
    });

    const company = companyResult.result || '';

    // Get additional profile data
    const [profileData] = await chrome.scripting.executeScript({
      target: { tabId: profileTab.id },
      func: extractProfileDataScript
    });

    const data = profileData.result || {};

    // Extract company URL and enrich with additional company data
    const companyEnrichment = await enrichWithCompanyData(profileTab.id, '');

    // Close the profile tab
    await chrome.tabs.remove(profileTab.id);
    profileTab = null;

    return {
      name: profile.name,
      headline: data.headline || '',
      company: company,
      companySize: companyEnrichment?.companySize ?? null,
      companyIndustry: companyEnrichment?.companyIndustry ?? null,
      companyTechStack: companyEnrichment?.companyTechStack ?? null,
      location: data.location || '',
      contact: profile.profileUrl,
      contactLinks: [{ href: profile.profileUrl, label: 'LinkedIn', type: 'linkedin' }],
      profileUrl: profile.profileUrl
    };
  } catch (error) {
    console.error(`Error processing ${profile.name}:`, error);

    // Return lead without company data
    return {
      name: profile.name,
      headline: '',
      company: '',
      companySize: '',
      companyIndustry: '',
      companyTechStack: '',
      location: '',
      profileUrl: profile.profileUrl,
      contact: profile.profileUrl,
      contactLinks: [{ href: profile.profileUrl, label: 'LinkedIn', type: 'linkedin' }]
    };
  } finally {
    // Ensure profile tab is closed
    if (profileTab) {
      try {
        await chrome.tabs.remove(profileTab.id);
      } catch (e) {
        // Tab may already be closed
      }
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
