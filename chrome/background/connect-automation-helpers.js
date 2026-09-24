/**
 * Messaging, lead-info and run-completion helpers for Connect Automation.
 * Split out of connect-automation-worker.js so each module stays small.
 */

import { getSettings } from '../scripts/settings.js';
import { normaliseConnectSettings } from '../scripts/connect/connect-automation-utils.js';
import { state, updateRunningState } from './connect-automation-state.js';

export function sendRuntimeMessage(payload) {
  chrome.runtime.sendMessage(payload).catch(() => {});
}

export async function getValidatedConnectSettings() {
  const settings = await getSettings();
  if (!settings.connectAutomation?.enabled) {
    throw new Error('Enable Connect Automation in settings first.');
  }

  const connectSettings = normaliseConnectSettings(settings.connectAutomation);
  if (!connectSettings || !connectSettings.message) {
    throw new Error('Add a connection message in settings first.');
  }

  return connectSettings;
}

export function buildLeadInfoFromLead(lead) {
  if (!lead) {
    return {};
  }
  return {
    name: lead.name || null,
    profileUrl: lead.profileUrl || null,
    headline: lead.headline || null
  };
}

export async function buildLeadInfoFromTab(tab) {
  if (!tab) {
    return {};
  }
  return {
    name: tab.title || null,
    profileUrl: tab.url || null,
    headline: null
  };
}

export async function waitForTabComplete(tabId, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Timed out waiting for profile to load.'));
    }, timeoutMs);

    function handleUpdated(updatedTabId, info) {
      if (updatedTabId === tabId && info.status === 'complete') {
        cleanup();
        resolve();
      }
    }

    function cleanup() {
      clearTimeout(timeout);
      chrome.tabs.onUpdated.removeListener(handleUpdated);
    }

    chrome.tabs.onUpdated.addListener(handleUpdated);
  });
}

export async function finishRun(mode) {
  const summary = {
    total: state.total,
    processed: state.processed,
    successes: state.successes,
    failures: state.failures,
    cancelled: state.cancelRequested
  };

  await updateRunningState(false);

  state.cancelRequested = false;
  state.currentTabId = null;
  state.total = 0;
  state.processed = 0;
  state.successes = 0;
  state.failures = 0;

  sendRuntimeMessage({
    type: 'AUTO_CONNECT_COMPLETE',
    mode,
    summary
  });
}
