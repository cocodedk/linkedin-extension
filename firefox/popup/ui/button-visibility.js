/**
 * Button visibility controller based on context (domain, leads count, etc.)
 */

/**
 * Get current active tab's URL
 * @returns {Promise<string|null>} Current tab URL or null
 */
async function getCurrentTabUrl() {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    return tab?.url || null;
  } catch (error) {
    console.error('Failed to get current tab URL:', error);
    return null;
  }
}

/**
 * Check if current tab is on LinkedIn
 * @returns {Promise<boolean>}
 */
export async function isOnLinkedIn() {
  const url = await getCurrentTabUrl();
  return url ? url.includes('linkedin.com') : false;
}

/**
 * Check if current tab is on Virk.dk (datacvr)
 * @returns {Promise<boolean>}
 */
export async function isOnVirk() {
  const url = await getCurrentTabUrl();
  return url ? url.includes('datacvr.virk.dk') : false;
}

/**
 * Update button visibility based on current context
 * @param {Object} leads - Current leads data
 */
export async function updateButtonVisibility(leads) {
  const onLinkedIn = await isOnLinkedIn();
  const onVirk = await isOnVirk();
  const hasLeads = leads && leads.length > 0;

  // LinkedIn-specific buttons
  const scanBtn = document.getElementById('scan-btn');
  const scanNextBtn = document.getElementById('scan-next-btn');
  const openVirkBtn = document.getElementById('open-virk-btn');
  const generateAiQueryBtn = document.getElementById('generate-ai-query-btn');

  // Virk enrichment button (only show when NOT on virk.dk AND has leads)
  const enrichVirkBtn = document.getElementById('enrich-virk-btn');

  // Show/hide LinkedIn-only buttons
  if (scanBtn) scanBtn.style.display = onLinkedIn ? '' : 'none';
  if (scanNextBtn) scanNextBtn.style.display = onLinkedIn ? '' : 'none';
  if (openVirkBtn) openVirkBtn.style.display = onLinkedIn ? '' : 'none';
  if (generateAiQueryBtn) generateAiQueryBtn.style.display = onLinkedIn ? '' : 'none';

  // Show Virk enrichment button when on datacvr.virk.dk OR when has leads (but not on other virk.dk pages)
  if (enrichVirkBtn) {
    enrichVirkBtn.style.display = (onVirk || hasLeads) ? '' : 'none';
  }
}
