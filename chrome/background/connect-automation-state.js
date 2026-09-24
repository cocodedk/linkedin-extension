/**
 * Run state and lifecycle for Connect Automation: the shared state object,
 * the running-flag persisted to storage, and stop/cleanup handling.
 * Split out of connect-automation-worker.js so each module stays small.
 */

import {
  AUTO_CONNECT_STATE_KEY,
  AUTO_CONNECT_MODE_KEY,
  ABORT_FLAG_KEY
} from '../scripts/connect/connect-automation-utils.js';

export const state = {
  running: false,
  mode: null,
  cancelRequested: false,
  currentTabId: null,
  total: 0,
  processed: 0,
  successes: 0,
  failures: 0
};

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));

export async function updateRunningState(isRunning, mode = null) {
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

export async function setAbortFlag(tabId, value) {
  if (!tabId) {
    return;
  }
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
  if (!state.running) {
    return;
  }
  if (state.currentTabId && tabId === state.currentTabId) {
    state.cancelRequested = true;
  }
});
