/**
 * Settings display component for showing deep scan configuration
 * Displays read-only settings values in a compact format
 */

import { getSettings } from '../../scripts/settings.js';

/**
 * Render deep scan settings in a compact read-only format
 * @param {HTMLElement} container - The container element to render settings into
 */
export async function renderSettingsDisplay(container) {
  if (!container) {
    console.warn('Settings display container not found');
    return;
  }

  try {
    const settings = await getSettings();

    const deepScanSettings = settings.deepScan || {};
    const deepScanAllSettings = settings.deepScanAll || {};

    const html = `
      <div class="deep-scan-settings">
        <div class="settings-line">
          <span class="settings-label">Deep Scan:</span>
          <span class="settings-values">
            Parallel Tabs: ${deepScanSettings.batchSize || 2} |
            Profile Delay: ${deepScanSettings.profileLoadDelayMs || 4000}ms |
            Batch Delay: ${deepScanSettings.batchDelayMs || 3000}ms
          </span>
        </div>
        <div class="settings-line">
          <span class="settings-label">Deep Scan ALL:</span>
          <span class="settings-values">
            Max Pages: ${deepScanAllSettings.maxPages || 100} |
            Page Delay: ${deepScanAllSettings.pageDelayMs || 2500}ms
          </span>
        </div>
      </div>
    `;

    container.innerHTML = html;
  } catch (error) {
    console.error('Failed to load settings for display:', error);
    container.innerHTML = '<div class="settings-error">Failed to load settings</div>';
  }
}

/**
 * Initialize settings display in the popup
 * Should be called after DOM is ready
 */
export function initializeSettingsDisplay() {
  const container = document.getElementById('deep-scan-settings');
  if (container) {
    renderSettingsDisplay(container);
  } else {
    console.warn('Deep scan settings container not found in DOM');
  }
}
