/**
 * Settings page initialization and event setup
 */

import { getApiKey, setApiKey } from './scripts/storage.js';
import { getSettings, saveSettings, resetSettings } from './scripts/settings.js';
import { showToast } from './popup/ui/toast.js';
import {
  apiKeyInput,
  saveApiKeyBtn,
  settingsForm,
  resetSettingsBtn,
  openPopupBtn,
  openLeadsBtn,
  inputs,
  updateConnectAutomationUi,
  autoSaveInProgress
} from './settings-page-inputs.js';
import { collectSettings, applySettings, debounce } from './settings-page-handlers.js';

// Auto-save function with debouncing
const debouncedAutoSave = debounce(async () => {
  if (autoSaveInProgress) return;

  try {
    autoSaveInProgress = true;
    const settings = collectSettings();
    await saveSettings(settings);
    showToast('Settings saved automatically', 'success');
  } catch (error) {
    console.error('Auto-save failed:', error);
    showToast('Failed to save settings', 'error');
  } finally {
    autoSaveInProgress = false;
  }
}, 1000);

// Event handlers
async function handleSaveApiKey() {
  try {
    const apiKey = apiKeyInput.value.trim();
    await setApiKey(apiKey);
    showToast(apiKey ? 'API key saved' : 'API key cleared', 'success');
  } catch (error) {
    console.error('Save API key failed:', error);
    showToast('Failed to save API key', 'error');
  }
}

async function handleResetSettings() {
  try {
    const confirmed = confirm('Reset all settings to defaults? This cannot be undone.');
    if (!confirmed) return;

    const defaultSettings = await resetSettings();
    await applySettings(defaultSettings);
    showToast('Settings reset to defaults', 'success');
  } catch (error) {
    console.error('Reset settings failed:', error);
    showToast('Failed to reset settings', 'error');
  }
}

async function handleOpenPopup() {
  try {
    const popupUrl = chrome.runtime.getURL('popup.html');
    await chrome.tabs.create({ url: popupUrl });
    window.close();
  } catch (error) {
    console.error('Failed to open popup:', error);
  }
}

async function handleOpenLeads() {
  try {
    const leadsUrl = chrome.runtime.getURL('leads.html');
    const tabList = await chrome.tabs.query({ url: leadsUrl });

    if (tabList.length > 0) {
      // Tab exists, focus it and reload
      await chrome.tabs.update(tabList[0].id, { active: true });
      await chrome.tabs.reload(tabList[0].id);
    } else {
      // No tab exists, create new one
      await chrome.tabs.create({ url: leadsUrl });
    }
  } catch (error) {
    console.error('Failed to open leads page:', error);
  }
}

// Initialize the settings page
export async function initializeSettingsPage() {
  try {
    // Load current API key
    const apiKey = await getApiKey();
    if (apiKeyInput && apiKey) {
      apiKeyInput.value = apiKey;
    }

    // Load current settings
    const settings = await getSettings();
    await applySettings(settings);

    // Set up event listeners
    if (saveApiKeyBtn) {
      saveApiKeyBtn.addEventListener('click', handleSaveApiKey);
    }

    if (settingsForm) {
      settingsForm.addEventListener('input', debouncedAutoSave);
    }

    if (resetSettingsBtn) {
      resetSettingsBtn.addEventListener('click', handleResetSettings);
    }

    if (openPopupBtn) {
      openPopupBtn.addEventListener('click', handleOpenPopup);
    }

    if (openLeadsBtn) {
      openLeadsBtn.addEventListener('click', handleOpenLeads);
    }

    // Connect automation UI updates
    if (inputs.connectEnabled) {
      inputs.connectEnabled.addEventListener('change', updateConnectAutomationUi);
    }

    showToast('Settings loaded', 'info');
  } catch (error) {
    console.error('Settings page initialization failed:', error);
    showToast('Failed to load settings', 'error');
  }
}
