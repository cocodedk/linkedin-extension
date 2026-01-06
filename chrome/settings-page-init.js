/**
 * Settings page initialization and event setup
 */

import { getApiKey } from './scripts/storage.js';
import { getSettings, saveSettings } from './scripts/settings.js';
import { showToast } from './popup/ui/toast.js';
import { collectSettings, debounce } from './settings-page-handlers.js';
import {
  apiKeyInput,
  saveApiKeyBtn,
  settingsForm,
  resetSettingsBtn,
  openPopupBtn,
  openLeadsBtn,
  inputs,
  updateConnectAutomationUi
} from './settings-page-inputs.js';
import { applySettings } from './settings-page-handlers.js';
import {
  handleSaveApiKey,
  handleResetSettings,
  handleOpenPopup,
  handleOpenLeads
} from './settings-page-event-handlers.js';

// Auto-save state tracking
let autoSaveInProgress = false;

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
