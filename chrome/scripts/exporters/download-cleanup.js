/**
 * Download cleanup utilities for event-driven URL revocation
 */

/**
 * Sets up event-driven cleanup for download
 * @param {number} downloadId - The download ID
 * @param {string} url - The blob URL to revoke
 * @returns {{listener: Function|null, timeoutId: number|null}} Cleanup handles
 */
export function setupDownloadCleanup(downloadId, url) {
  if (chrome.downloads?.onChanged?.addListener) {
    const listener = (delta) => {
      if (delta.id === downloadId && delta.state?.current) {
        const state = delta.state.current;
        if (state === 'in_progress' || state === 'complete') {
          chrome.downloads.onChanged.removeListener(listener);
          if (url) {
            URL.revokeObjectURL(url);
          }
        }
      }
    };
    chrome.downloads.onChanged.addListener(listener);
    return { listener, timeoutId: null };
  }
  // Fallback: longer timeout if onChanged API unavailable
  const timeoutId = setTimeout(() => {
    if (url) {
      URL.revokeObjectURL(url);
    }
  }, 10000);
  return { listener: null, timeoutId };
}

/**
 * Cleans up download resources
 * @param {Function|null} listener - The listener to remove
 * @param {number|null} timeoutId - The timeout ID to clear
 * @param {string|null} url - The URL to revoke
 */
export function cleanupDownloadResources(listener, timeoutId, url) {
  if (listener) {
    chrome.downloads?.onChanged?.removeListener(listener);
  }
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  if (url) {
    URL.revokeObjectURL(url);
  }
}
