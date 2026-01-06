/**
 * Settings page event handlers and form processing
 */

import { getSettings, saveSettings, resetSettings } from './scripts/settings.js';
import { showToast } from './popup/ui/toast.js';
import { readNumber, inputs, updateConnectAutomationUi } from './settings-page-inputs.js';

// Debounce utility function for auto-save timing
export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

export function collectSettings() {
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

export async function applySettings(settings) {
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
