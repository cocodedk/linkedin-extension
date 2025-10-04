/**
 * Process individual LinkedIn profiles
 */

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Process a single profile - extract company and data
 */
export async function processProfile(profile, extractCompanyScript, extractProfileDataScript) {
  let profileTab;
  try {
    profileTab = await browser.tabs.create({
      url: profile.profileUrl,
      active: false
    });

    // Wait for profile page to load
    await sleep(4000);

    // Extract company (no longer needs click/wait for overlay)
    const [companyResult] = await browser.scripting.executeScript({
      target: { tabId: profileTab.id },
      func: extractCompanyScript
    });

    // Extract headline and location
    const [profileData] = await browser.scripting.executeScript({
      target: { tabId: profileTab.id },
      func: extractProfileDataScript
    });

    await browser.tabs.remove(profileTab.id);

    const data = profileData.result || {};
    const company = companyResult.result || '';

    return buildLeadData(profile, company, data);

  } catch (error) {
    console.error(`Error processing ${profile.name}:`, error);
    if (profileTab) {
      try {
        await browser.tabs.remove(profileTab.id);
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
