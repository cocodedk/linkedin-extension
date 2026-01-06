/**
 * Button visibility helper functions
 */

/**
 * Get current active tab's URL
 * @returns {Promise<string|null>} Current tab URL or null
 */
export async function getCurrentTabUrl() {
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
export async function isDeepScanAllRunning() {
  try {
    const { storage } = await import('../../api/storage.js');
    const { isDeepScanAllRunning } = await storage.local.get('isDeepScanAllRunning');
    return isDeepScanAllRunning || false;
  } catch (error) {
    console.error('Failed to check Deep Scan ALL status:', error);
    return false;
  }
}
