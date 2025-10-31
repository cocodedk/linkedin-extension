import { getApiKey, setApiKey } from './scripts/storage.js';
import { getSettings, saveSettings, resetSettings } from './scripts/settings.js';
import { setStatus } from './popup/ui/status.js';

const apiKeyInput = document.getElementById('api-key');
const saveApiKeyBtn = document.getElementById('save-api-key-btn');
const settingsForm = document.getElementById('settings-form');
const resetSettingsBtn = document.getElementById('reset-settings-btn');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const openPopupBtn = document.getElementById('open-popup-btn');
const openLeadsBtn = document.getElementById('open-leads-btn');

const inputs = {
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

function updateConnectAutomationUi() {
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

function readNumber(input) {
  if (!input) return Number.NaN;
  const value = input.value.trim();
  if (value === '') return Number.NaN;
  return Number(value);
}

function collectSettings() {
  return {
    deepScan: {
      profileLoadDelayMs: readNumber(inputs.profileLoadDelay),
      batchSize: readNumber(inputs.deepScanBatchSize),
      batchDelayMs: readNumber(inputs.deepScanBatchDelay)
    },
    deepScanAll: {
      maxPages: readNumber(inputs.deepScanAllMaxPages),
      pageDelayMs: readNumber(inputs.deepScanAllPageDelay)
    },
    connectAutomation: {
      enabled: Boolean(inputs.connectEnabled?.checked),
      message: inputs.connectMessage?.value ?? '',
      initialDelayMs: readNumber(inputs.connectInitialDelay),
      confirmDelayMs: readNumber(inputs.connectConfirmDelay),
      messageDelayMs: readNumber(inputs.connectMessageDelay),
      sendDelayMs: readNumber(inputs.connectSendDelay),
      typingCharMinDelayMs: readNumber(inputs.connectTypingMinDelay),
      typingCharMaxDelayMs: readNumber(inputs.connectTypingMaxDelay)
    },
    virk: {
      parallelTabs: readNumber(inputs.virkParallelTabs),
      tabWarmupDelayMs: readNumber(inputs.virkWarmupDelay),
      searchDelayMs: readNumber(inputs.virkSearchDelay),
      navigationDelayMs: readNumber(inputs.virkNavigationDelay),
      pageLoadDelayMs: readNumber(inputs.virkPageLoadDelay)
    }
  };
}

function applySettings(settings) {
  if (!settings) {
    return;
  }

  inputs.profileLoadDelay.value = settings.deepScan.profileLoadDelayMs;
  inputs.deepScanBatchSize.value = settings.deepScan.batchSize;
  inputs.deepScanBatchDelay.value = settings.deepScan.batchDelayMs;
  inputs.deepScanAllMaxPages.value = settings.deepScanAll.maxPages;
  inputs.deepScanAllPageDelay.value = settings.deepScanAll.pageDelayMs;
  if (inputs.connectEnabled) {
    inputs.connectEnabled.checked = Boolean(settings.connectAutomation.enabled);
  }
  if (inputs.connectMessage) {
    inputs.connectMessage.value = settings.connectAutomation.message;
  }
  if (inputs.connectInitialDelay) {
    inputs.connectInitialDelay.value = settings.connectAutomation.initialDelayMs;
  }
  if (inputs.connectConfirmDelay) {
    inputs.connectConfirmDelay.value = settings.connectAutomation.confirmDelayMs;
  }
  if (inputs.connectMessageDelay) {
    inputs.connectMessageDelay.value = settings.connectAutomation.messageDelayMs;
  }
  if (inputs.connectSendDelay) {
    inputs.connectSendDelay.value = settings.connectAutomation.sendDelayMs;
  }
  if (inputs.connectTypingMinDelay) {
    inputs.connectTypingMinDelay.value = settings.connectAutomation.typingCharMinDelayMs;
  }
  if (inputs.connectTypingMaxDelay) {
    inputs.connectTypingMaxDelay.value = settings.connectAutomation.typingCharMaxDelayMs;
  }
  inputs.virkParallelTabs.value = settings.virk.parallelTabs;
  inputs.virkWarmupDelay.value = settings.virk.tabWarmupDelayMs;
  inputs.virkSearchDelay.value = settings.virk.searchDelayMs;
  inputs.virkNavigationDelay.value = settings.virk.navigationDelayMs;
  inputs.virkPageLoadDelay.value = settings.virk.pageLoadDelayMs;
  updateConnectAutomationUi();
}

saveApiKeyBtn.addEventListener('click', async () => {
  try {
    saveApiKeyBtn.disabled = true;
    const apiKey = apiKeyInput.value.trim();
    await setApiKey(apiKey);
    setStatus(apiKey ? 'API key saved.' : 'API key cleared.', 'success');
  } catch (error) {
    console.error('Failed to save API key:', error);
    setStatus(`Failed to save API key: ${error.message}`, 'error');
  } finally {
    saveApiKeyBtn.disabled = false;
  }
});

settingsForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    saveSettingsBtn.disabled = true;
    const saved = await saveSettings(collectSettings());
    applySettings(saved);
    setStatus('Settings saved.', 'success');
  } catch (error) {
    console.error('Failed to save settings:', error);
    setStatus(`Failed to save settings: ${error.message}`, 'error');
  } finally {
    saveSettingsBtn.disabled = false;
  }
});

resetSettingsBtn.addEventListener('click', async () => {
  try {
    resetSettingsBtn.disabled = true;
    const defaults = await resetSettings();
    applySettings(defaults);
    setStatus('Settings reset to defaults.', 'success');
  } catch (error) {
    console.error('Failed to reset settings:', error);
    setStatus(`Failed to reset settings: ${error.message}`, 'error');
  } finally {
    resetSettingsBtn.disabled = false;
  }
});

openPopupBtn.addEventListener('click', async () => {
  try {
    const [{ runtime }, { tabs }] = await Promise.all([
      import('./api/runtime.js'),
      import('./api/tabs.js')
    ]);
    await tabs.create({ url: runtime.getURL('popup.html') });
  } catch (error) {
    console.error('Failed to open popup page:', error);
    setStatus(`Failed to open popup: ${error.message}`, 'error');
  }
});

openLeadsBtn.addEventListener('click', async () => {
  try {
    const [{ runtime }, { tabs }] = await Promise.all([
      import('./api/runtime.js'),
      import('./api/tabs.js')
    ]);
    await tabs.create({ url: runtime.getURL('leads.html') });
  } catch (error) {
    console.error('Failed to open leads page:', error);
    setStatus(`Failed to open leads page: ${error.message}`, 'error');
  }
});

inputs.connectEnabled?.addEventListener('change', updateConnectAutomationUi);

async function initialise() {
  try {
    const [apiKey, settings] = await Promise.all([
      getApiKey(),
      getSettings()
    ]);
    apiKeyInput.value = apiKey;
    applySettings(settings);
    setStatus('Settings loaded.', 'info');
  } catch (error) {
    console.error('Failed to load settings:', error);
    setStatus(`Failed to load settings: ${error.message}`, 'error');
  }
}

initialise();
