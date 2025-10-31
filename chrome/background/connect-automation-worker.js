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
  cancelRequested: false,
  currentTabId: null,
  total: 0,
  processed: 0,
  successes: 0,
  failures: 0
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));

async function setAbortFlag(tabId, value) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (flagKey, flagValue) => {
        window[flagKey] = Boolean(flagValue);
      },
      args: [ABORT_FLAG_KEY, value]
    });
  } catch (error) {
    console.warn('Failed to set abort flag on tab', tabId, error);
  }
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

async function updateRunningState(isRunning) {
  await chrome.storage.local.set({
    [AUTO_CONNECT_STATE_KEY]: Boolean(isRunning),
    ...(isRunning ? { [AUTO_CONNECT_MODE_KEY]: 'batch' } : {})
  });
  if (!isRunning) {
    await chrome.storage.local.remove(AUTO_CONNECT_MODE_KEY);
  }
}

function sendRuntimeMessage(payload) {
  chrome.runtime.sendMessage(payload).catch(() => {});
}

async function runAutoConnectAll(targets, connectSettings) {
  state.processed = 0;
  state.successes = 0;
  state.failures = 0;

  sendRuntimeMessage({ type: 'AUTO_CONNECT_STARTED', total: targets.length });

  for (let index = 0; index < targets.length; index += 1) {
    if (state.cancelRequested) break;
    const lead = targets[index];
    let tab = null;
    try {
      tab = await chrome.tabs.create({ url: lead.profileUrl, active: false });
      state.currentTabId = tab.id;

      await waitForTabComplete(tab.id, Math.max(connectSettings.initialDelayMs + 15000, 45000));
      await setAbortFlag(tab.id, false);

      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: connectWithProfileScript,
        args: [connectSettings]
      });

      const success = Boolean(result?.success);
      if (success) state.successes += 1;
      else state.failures += 1;

      state.processed += 1;

      sendRuntimeMessage({
        type: 'AUTO_CONNECT_PROGRESS',
        index: index + 1,
        total: targets.length,
        lead: {
          name: lead?.name || null,
          profileUrl: lead?.profileUrl || null,
          headline: lead?.headline || null
        },
        result,
        message: success ? 'Connection request sent.' : describeConnectFailure(result)
      });
    } catch (error) {
      state.processed += 1;
      state.failures += 1;
      console.error('Auto connect all error:', error);
      sendRuntimeMessage({
        type: 'AUTO_CONNECT_PROGRESS',
        index: index + 1,
        total: targets.length,
        lead: {
          name: lead?.name || null,
          profileUrl: lead?.profileUrl || null,
          headline: lead?.headline || null
        },
        result: { success: false, error: error.message },
        message: error.message
      });
    } finally {
      if (tab?.id) {
        try {
          await chrome.tabs.remove(tab.id);
        } catch (removeError) {
          console.warn('Failed to close profile tab', removeError);
        }
      }
      state.currentTabId = null;
      if (state.cancelRequested) break;
      await sleep(2000);
    }
  }
}

function resetState() {
  state.running = false;
  state.cancelRequested = false;
  state.currentTabId = null;
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

  state.running = true;
  state.cancelRequested = false;
  state.total = targets.length;
  state.processed = 0;
  state.successes = 0;
  state.failures = 0;

  await updateRunningState(true);

  runAutoConnectAll(targets, connectSettings)
    .catch((error) => {
      console.error('Auto connect all failed:', error);
      sendRuntimeMessage({
        type: 'AUTO_CONNECT_PROGRESS',
        index: state.processed + 1,
        total: state.total,
        result: { success: false, error: error.message },
        message: error.message
      });
    })
    .finally(async () => {
      const cancelled = state.cancelRequested;
      const summary = {
        total: state.total,
        processed: state.processed,
        successes: state.successes,
        failures: state.failures,
        cancelled
      };

      resetState();
      await updateRunningState(false);

      sendRuntimeMessage({
        type: 'AUTO_CONNECT_COMPLETE',
        summary
      });
    });

  return { total: targets.length };
}

export async function stopAutoConnectAll() {
  if (!state.running) {
    return { stopped: false };
  }
  state.cancelRequested = true;
  if (state.currentTabId) {
    await setAbortFlag(state.currentTabId, true);
  }
  return { stopped: true };
}
