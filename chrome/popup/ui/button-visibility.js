/**
 * Button visibility controller based on context (domain, leads count, etc.)
 */

/**
 * Get current active tab's URL
 * @returns {Promise<string|null>} Current tab URL or null
 */
async function getCurrentTabUrl() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
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
 * Check if Deep Scan ALL is running
 * @returns {Promise<boolean>}
 */
async function isDeepScanAllRunning() {
  try {
    const { storage } = await import('../../api/storage.js');
    const { isDeepScanAllRunning } = await storage.local.get('isDeepScanAllRunning');
    return isDeepScanAllRunning || false;
  } catch (error) {
    console.error('Failed to check Deep Scan ALL status:', error);
    return false;
  }
}

/**
 * Update button visibility based on current context
 * @param {Object} leads - Current leads data
 */
export async function updateButtonVisibility(leads) {
  const onLinkedIn = await isOnLinkedIn();
  const onVirk = await isOnVirk();
  let hasLeads = Array.isArray(leads) && leads.length > 0;
  try {
    const { leads: storedLeads = [] } = await chrome.storage.local.get('leads');
    hasLeads = storedLeads.length > 0;
  } catch (error) {
    console.error('Failed to read leads from storage:', error);
  }
  const deepScanRunning = await isDeepScanAllRunning();

  // LinkedIn-specific buttons
  const scanBtn = document.getElementById('scan-btn');
  const scanNextBtn = document.getElementById('scan-next-btn');
  const deepScanBtn = document.getElementById('deep-scan-btn');
  const deepScanAllBtn = document.getElementById('deep-scan-all-btn');
  const stopDeepScanAllBtn = document.getElementById('stop-deep-scan-all-btn');
  const openVirkBtn = document.getElementById('open-virk-btn');
  const generateAiQueryBtn = document.getElementById('generate-ai-query-btn');
  const autoConnectBtn = document.getElementById('auto-connect-btn');
  const autoConnectAllBtn = document.getElementById('auto-connect-all-btn');
  const autoConnectStopBtn = document.getElementById('auto-connect-stop-btn');

  // Virk enrichment button (only show when NOT on virk.dk AND has leads)
  const enrichVirkBtn = document.getElementById('enrich-virk-btn');

  let autoConnectRunning = false;
  try {
    const { isAutoConnectRunning } = await chrome.storage.local.get('isAutoConnectRunning');
    autoConnectRunning = Boolean(isAutoConnectRunning);
  } catch (error) {
    console.error('Failed to check auto connect status:', error);
  }

  // Show/hide LinkedIn-only buttons
  if (scanBtn) scanBtn.style.display = (onLinkedIn && !deepScanRunning) ? '' : 'none';
  if (scanNextBtn) scanNextBtn.style.display = (onLinkedIn && !deepScanRunning) ? '' : 'none';
  if (deepScanBtn) deepScanBtn.style.display = (onLinkedIn && !deepScanRunning) ? '' : 'none';
  if (openVirkBtn) openVirkBtn.style.display = onLinkedIn ? '' : 'none';
  if (generateAiQueryBtn) generateAiQueryBtn.style.display = onLinkedIn ? '' : 'none';
  if (autoConnectBtn) autoConnectBtn.style.display = (onLinkedIn && !autoConnectRunning) ? '' : 'none';
  if (autoConnectAllBtn) autoConnectAllBtn.style.display = (!autoConnectRunning && hasLeads) ? '' : 'none';
  if (autoConnectStopBtn) autoConnectStopBtn.style.display = autoConnectRunning ? '' : 'none';

  // Show Deep Scan ALL button only on LinkedIn and when NOT running
  if (deepScanAllBtn) {
    deepScanAllBtn.style.display = (onLinkedIn && !deepScanRunning) ? '' : 'none';
  }

  // Show Stop Deep Scan button only when running
  if (stopDeepScanAllBtn) {
    stopDeepScanAllBtn.style.display = deepScanRunning ? '' : 'none';
  }

  // Show Virk enrichment button when on datacvr.virk.dk OR when has leads (but not on other virk.dk pages)
  if (enrichVirkBtn) {
    enrichVirkBtn.style.display = (onVirk || hasLeads) ? '' : 'none';
  }
}
