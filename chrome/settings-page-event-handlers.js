/**
 * Settings page event handler functions
 */

import { getApiKey, setApiKey } from './scripts/storage.js';
import { saveSettings, resetSettings } from './scripts/settings.js';
import { showToast } from './popup/ui/toast.js';
import { apiKeyInput, inputs, updateConnectAutomationUi } from './settings-page-inputs.js';
import { collectSettings, applySettings, debounce } from './settings-page-handlers.js';

// Note: autoSaveInProgress and debouncedAutoSave are now handled in settings-page-init.js

// Event handlers
export async function handleSaveApiKey() {
  try {
    const apiKey = apiKeyInput.value.trim();
    await setApiKey(apiKey);
    showToast(apiKey ? 'API key saved' : 'API key cleared', 'success');
  } catch (error) {
    console.error('Save API key failed:', error);
    showToast('Failed to save API key', 'error');
  }
}

export async function handleResetSettings() {
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

export async function handleOpenPopup() {
  try {
    const popupUrl = chrome.runtime.getURL('popup.html');
    await chrome.tabs.create({ url: popupUrl });
    window.close();
  } catch (error) {
    console.error('Failed to open popup:', error);
  }
}

export async function handleOpenLeads() {
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
