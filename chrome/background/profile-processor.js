/**
 * Process individual LinkedIn profiles
 */

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Process a single profile - extract company and data
 * @param {Object} options
 * @param {number} [options.profileLoadDelayMs=4000]
 */
export async function processProfile(profile, extractCompanyScript, extractProfileDataScript, options = {}) {
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

    // Extract company (no longer needs click/wait for overlay)
    const [companyResult] = await chrome.scripting.executeScript({
      target: { tabId: profileTab.id },
      func: extractCompanyScript
    });

    // Extract headline and location
    const [profileData] = await chrome.scripting.executeScript({
      target: { tabId: profileTab.id },
      func: extractProfileDataScript
    });

    await chrome.tabs.remove(profileTab.id);

    const data = profileData.result || {};
    const company = companyResult.result || '';

    return buildLeadData(profile, company, data);

  } catch (error) {
    console.error(`Error processing ${profile.name}:`, error);
    if (profileTab) {
      try {
        await chrome.tabs.remove(profileTab.id);
      } catch (e) {
        // Tab may already be closed
      }
    }
    return buildLeadData(profile, '', {});
  }
}

function buildLeadData(profile, company, data) {
  return {
    name: profile.name,
    headline: data.headline || '',
    company: company || '',
    location: data.location || '',
    contact: profile.profileUrl,
    contactLinks: [{ href: profile.profileUrl, label: 'LinkedIn', type: 'linkedin' }],
    profileUrl: profile.profileUrl
  };
}
