/**
 * Settings page input handling and DOM element references
 */

export const apiKeyInput = document.getElementById('api-key');
export const saveApiKeyBtn = document.getElementById('save-api-key-btn');
export const settingsForm = document.getElementById('settings-form');
export const resetSettingsBtn = document.getElementById('reset-settings-btn');
export const openPopupBtn = document.getElementById('open-popup-btn');
export const openLeadsBtn = document.getElementById('open-leads-btn');

// Auto-save state tracking
export let autoSaveInProgress = false;

export const inputs = {
  profileLoadDelay: document.getElementById('setting-deep-scan-profile-delay'),
  deepScanBatchSize: document.getElementById('setting-deep-scan-batch-size'),
  deepScanBatchDelay: document.getElementById('setting-deep-scan-batch-delay'),
  deepScanAllMaxPages: document.getElementById('setting-deep-scan-all-max-pages'),
  deepScanAllPageDelay: document.getElementById('setting-deep-scan-all-page-delay'),
  connectEnabled: document.getElementById('setting-connect-enabled'),
  connectMessage: document.getElementById('setting-connect-message'),
  connectInitialDelay: document.getElementById('setting-connect-initial-delay'),
  connectConfirmDelay: document.getElementById('setting-connect-confirm-delay'),
  connectMessageDelay: document.getElementById('setting-connect-message-delay'),
  connectSendDelay: document.getElementById('setting-connect-send-delay'),
  connectTypingMinDelay: document.getElementById('setting-connect-typing-min-delay'),
  connectTypingMaxDelay: document.getElementById('setting-connect-typing-max-delay'),
  virkParallelTabs: document.getElementById('setting-virk-parallel-tabs'),
  virkWarmupDelay: document.getElementById('setting-virk-warmup-delay'),
  virkSearchDelay: document.getElementById('setting-virk-search-delay'),
  virkNavigationDelay: document.getElementById('setting-virk-navigation-delay'),
  virkPageLoadDelay: document.getElementById('setting-virk-page-load-delay')
};

export function updateConnectAutomationUi() {
  if (!inputs.connectEnabled) return;
  const enabled = Boolean(inputs.connectEnabled.checked);
  const connectControls = [
    inputs.connectMessage,
    inputs.connectInitialDelay,
    inputs.connectConfirmDelay,
    inputs.connectMessageDelay,
    inputs.connectSendDelay,
    inputs.connectTypingMinDelay,
    inputs.connectTypingMaxDelay
  ].filter(Boolean);

  connectControls.forEach((control) => {
    control.disabled = !enabled;
    const parent = control.closest('label');
    if (parent) {
      parent.classList.toggle('disabled', !enabled);
    }
  });
}

export function readNumber(input) {
  if (!input) return Number.NaN;
  const value = input.value.trim();
  if (!value) return Number.NaN;
  const num = Number(value);
  return Number.isNaN(num) ? Number.NaN : num;
}
