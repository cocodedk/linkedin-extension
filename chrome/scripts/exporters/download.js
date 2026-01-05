/**
 * Download functionality
 */

import { setupDownloadCleanup, cleanupDownloadResources } from './download-cleanup.js';

export async function triggerDownload({ filename, mimeType, content }) {
  let url = null;
  let listener = null;
  let timeoutId = null;
  try {
    // Validate inputs
    if (!content || !filename) {
      throw new Error('Missing required parameters');
    }

    // Check if downloads API is available
    if (!chrome?.downloads?.download) {
      throw new Error('Downloads API not available');
    }

    // Check content size - warn about very large files
    const contentSizeBytes = new Blob([content]).size;
    const contentSizeMB = contentSizeBytes / (1024 * 1024);

    if (contentSizeMB > 50) {
      console.warn(
        `Large file detected: ${contentSizeMB.toFixed(2)}MB. This may cause browser instability.`
      );
    }

    if (contentSizeMB > 100) {
      throw new Error(`File too large (${contentSizeMB.toFixed(2)}MB). Maximum allowed: 100MB`);
    }

    const blob = new Blob([content], { type: mimeType });
    url = URL.createObjectURL(blob);

    const downloadId = await chrome.downloads.download({
      url,
      filename,
      saveAs: true
    });

    // Event-driven cleanup: listen for download state changes
    const cleanup = setupDownloadCleanup(downloadId, url);
    listener = cleanup.listener;
    timeoutId = cleanup.timeoutId;
  } catch (error) {
    // Cleanup on error
    cleanupDownloadResources(listener, timeoutId, url);
    throw error;
  }
}
