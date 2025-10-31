import { getLeads } from '../scripts/storage.js';
import { getSettings } from '../scripts/settings.js';
import { connectWithProfileScript } from '../popup/handlers/connect-automation.js';
import {
  PROFILE_URL_PATTERN,
  AUTO_CONNECT_STATE_KEY,
  AUTO_CONNECT_MODE_KEY,
  ABORT_FLAG_KEY,
  normaliseConnectSettings,
  describeConnectFailure
} from '../scripts/connect/connect-automation-utils.js';

const state = {
  running: false,
  mode: null,
  cancelRequested: false,
  currentTabId: null,
  total: 0,
  processed: 0,
  successes: 0,
  failures: 0
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));

async function updateRunningState(isRunning, mode = null) {
  state.running = Boolean(isRunning);
  state.mode = isRunning ? mode : null;

  try {
    if (state.running) {
      await chrome.storage.local.set({
        [AUTO_CONNECT_STATE_KEY]: true,
        [AUTO_CONNECT_MODE_KEY]: state.mode
      });
    } else {
      await chrome.storage.local.set({ [AUTO_CONNECT_STATE_KEY]: false });
      await chrome.storage.local.remove(AUTO_CONNECT_MODE_KEY);
    }
  } catch (error) {
    console.warn('Failed to update auto connect state flags:', error);
  }
}

async function setAbortFlag(tabId, value) {
  if (!tabId) return;
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (flagKey, flagValue) => {
        window[flagKey] = Boolean(flagValue);
      },
      args: [ABORT_FLAG_KEY, value]
    });
  } catch (error) {
    console.warn(`Failed to set abort flag on tab ${tabId}:`, error);
  }
}

function sendRuntimeMessage(payload) {
  chrome.runtime.sendMessage(payload).catch(() => {});
}

function buildLeadInfoFromLead(lead) {
  if (!lead) return {};
  return {
    name: lead.name || null,
    profileUrl: lead.profileUrl || null,
    headline: lead.headline || null
  };
}

async function buildLeadInfoFromTab(tab) {
  if (!tab) return {};
  return {
    name: tab.title || null,
    profileUrl: tab.url || null,
    headline: null
  };
}

async function waitForTabComplete(tabId, timeoutMs = 60000) {
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

async function finishRun(mode) {
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

async function runConnectOnExistingTab(tabId, connectSettings) {
  const tab = await chrome.tabs.get(tabId).catch(() => null);
  const leadInfo = await buildLeadInfoFromTab(tab);

  try {
    await setAbortFlag(tabId, false);
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: connectWithProfileScript,
      args: [connectSettings]
    });

    state.processed = 1;
    const success = Boolean(result?.success);
    if (success) {
      state.successes = 1;
    } else {
      state.failures = 1;
    }

    sendRuntimeMessage({
      type: 'AUTO_CONNECT_PROGRESS',
      mode: 'single',
      index: 1,
      total: 1,
      lead: leadInfo,
      result,
      message: success ? 'Connection request sent.' : describeConnectFailure(result)
    });
  } catch (error) {
    state.processed = 1;
    state.failures = 1;

    sendRuntimeMessage({
      type: 'AUTO_CONNECT_PROGRESS',
      mode: 'single',
      index: 1,
      total: 1,
      lead: leadInfo,
      result: { success: false, error: error.message },
      message: error.message
    });
    throw error;
  }
}

async function runAutoConnectAll(targets, connectSettings) {
  state.processed = 0;
  state.successes = 0;
  state.failures = 0;

  sendRuntimeMessage({
    type: 'AUTO_CONNECT_STARTED',
    mode: 'batch',
    total: targets.length
  });

  for (let index = 0; index < targets.length; index += 1) {
    if (state.cancelRequested) break;

    const lead = targets[index];
    const leadInfo = buildLeadInfoFromLead(lead);
    let tab = null;

    try {
      tab = await chrome.tabs.create({ url: lead.profileUrl, active: false });
      state.currentTabId = tab.id;

      await waitForTabComplete(
        tab.id,
        Math.max(connectSettings.initialDelayMs + 15000, 45000)
      );
      await setAbortFlag(tab.id, false);

      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: connectWithProfileScript,
        args: [connectSettings]
      });

      const success = Boolean(result?.success);
      if (success) {
        state.successes += 1;
      } else {
        state.failures += 1;
      }

      state.processed += 1;
      sendRuntimeMessage({
        type: 'AUTO_CONNECT_PROGRESS',
        mode: 'batch',
        index: index + 1,
        total: targets.length,
        lead: leadInfo,
        result,
        message: success ? 'Connection request sent.' : describeConnectFailure(result)
      });
    } catch (error) {
      state.processed += 1;
      state.failures += 1;
      console.error('Auto connect all error:', error);
      sendRuntimeMessage({
        type: 'AUTO_CONNECT_PROGRESS',
        mode: 'batch',
        index: index + 1,
        total: targets.length,
        lead: leadInfo,
        result: { success: false, error: error.message },
        message: error.message
      });
    } finally {
      if (tab?.id) {
        try {
          await chrome.tabs.remove(tab.id);
        } catch (removeError) {
          console.warn('Failed to close profile tab:', removeError);
        }
      }
      state.currentTabId = null;
      if (state.cancelRequested) break;
      await sleep(2000);
    }
  }
}

export async function startAutoConnectSingle(tabId) {
  if (state.running) {
    throw new Error('Auto Connect is already running.');
  }

  const settings = await getSettings();
  if (!settings.connectAutomation?.enabled) {
    throw new Error('Enable Connect Automation in settings first.');
  }

  const connectSettings = normaliseConnectSettings(settings.connectAutomation);
  if (!connectSettings || !connectSettings.message) {
    throw new Error('Add a connection message in settings first.');
  }

  const tab = await chrome.tabs.get(tabId).catch(() => null);
  if (!tab || !PROFILE_URL_PATTERN.test(tab.url || '')) {
    throw new Error('Active tab is not a LinkedIn profile.');
  }

  state.cancelRequested = false;
  state.currentTabId = tabId;
  state.total = 1;
  state.processed = 0;
  state.successes = 0;
  state.failures = 0;

  await updateRunningState(true, 'single');

  sendRuntimeMessage({
    type: 'AUTO_CONNECT_STARTED',
    mode: 'single',
    total: 1
  });

  runConnectOnExistingTab(tabId, connectSettings)
    .catch((error) => {
      console.error('Auto connect single error:', error);
    })
    .finally(() => finishRun('single'));

  return { mode: 'single' };
}

export async function startAutoConnectAll() {
  if (state.running) {
    throw new Error('Auto Connect is already running.');
  }

  const settings = await getSettings();
  if (!settings.connectAutomation?.enabled) {
    throw new Error('Enable Connect Automation in settings first.');
  }

  const connectSettings = normaliseConnectSettings(settings.connectAutomation);
  if (!connectSettings || !connectSettings.message) {
    throw new Error('Add a connection message in settings first.');
  }

  const leads = await getLeads();
  const targets = leads.filter((lead) => PROFILE_URL_PATTERN.test(lead?.profileUrl || ''));
  if (targets.length === 0) {
    throw new Error('No leads with LinkedIn profile URLs to connect.');
  }

  state.cancelRequested = false;
  state.currentTabId = null;
  state.total = targets.length;
  state.processed = 0;
  state.successes = 0;
  state.failures = 0;

  await updateRunningState(true, 'batch');

  runAutoConnectAll(targets, connectSettings)
    .catch((error) => {
      console.error('Auto connect all failed:', error);
    })
    .finally(() => finishRun('batch'));

  return { total: targets.length };
}

export async function stopAutoConnect() {
  if (!state.running) {
    return { stopped: false, mode: null };
  }

  state.cancelRequested = true;
  if (state.currentTabId) {
    await setAbortFlag(state.currentTabId, true);
  }

  return { stopped: true, mode: state.mode };
}

chrome.tabs.onRemoved.addListener((tabId) => {
  if (!state.running) return;
  if (state.currentTabId && tabId === state.currentTabId) {
    state.cancelRequested = true;
  }
});
