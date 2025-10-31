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
  virkParallelTabs: document.getElementById('setting-virk-parallel-tabs'),
  virkWarmupDelay: document.getElementById('setting-virk-warmup-delay'),
  virkSearchDelay: document.getElementById('setting-virk-search-delay'),
  virkNavigationDelay: document.getElementById('setting-virk-navigation-delay'),
  virkPageLoadDelay: document.getElementById('setting-virk-page-load-delay')
};

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
  inputs.virkParallelTabs.value = settings.virk.parallelTabs;
  inputs.virkWarmupDelay.value = settings.virk.tabWarmupDelayMs;
  inputs.virkSearchDelay.value = settings.virk.searchDelayMs;
  inputs.virkNavigationDelay.value = settings.virk.navigationDelayMs;
  inputs.virkPageLoadDelay.value = settings.virk.pageLoadDelayMs;
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
