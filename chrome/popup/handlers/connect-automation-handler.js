/**
 * Handle manual and bulk connect automation from the popup.
 */

import { setStatus } from '../ui.js';
import { connectWithProfileScript } from './connect-automation.js';
import { getSettings } from '../../scripts/settings.js';
import { getLeads } from '../../scripts/storage.js';
import {
  PROFILE_URL_PATTERN,
  AUTO_CONNECT_STATE_KEY,
  AUTO_CONNECT_MODE_KEY,
  ABORT_FLAG_KEY,
  normaliseConnectSettings,
  describeConnectFailure
} from '../../scripts/connect/connect-automation-utils.js';

async function setAutoConnectRunning(isRunning) {
  try {
    await chrome.storage.local.set({ [AUTO_CONNECT_STATE_KEY]: Boolean(isRunning) });
  } catch (error) {
    console.warn('Failed to persist auto connect running state:', error);
  }
}

async function setAutoConnectMode(mode) {
  try {
    if (mode) {
      await chrome.storage.local.set({ [AUTO_CONNECT_MODE_KEY]: mode });
    } else {
      await chrome.storage.local.remove(AUTO_CONNECT_MODE_KEY);
    }
  } catch (error) {
    console.warn('Failed to update auto connect mode:', error);
  }
}

async function setAbortFlag(tabId, value) {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (flagKey, flagValue) => {
      window[flagKey] = Boolean(flagValue);
    },
    args: [ABORT_FLAG_KEY, value]
  });
}

export async function handleConnectAutomation(startButton, stopButton) {
  let started = false;
  try {
    if (startButton) startButton.disabled = true;
    setStatus('Preparing connection request...', 'info');

    const stateEntry = await chrome.storage.local.get(AUTO_CONNECT_STATE_KEY);
    if (stateEntry?.[AUTO_CONNECT_STATE_KEY]) {
      setStatus('Auto connect is already running.', 'info');
      return;
    }

    const settings = await getSettings();
    if (!settings.connectAutomation?.enabled) {
      setStatus('Enable Connect Automation in settings before using this button.', 'warning');
      return;
    }

    const connectAutomation = normaliseConnectSettings(settings.connectAutomation);
    if (!connectAutomation || !connectAutomation.message) {
      setStatus('Add a connection message in settings first.', 'warning');
      return;
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      setStatus('No active tab found.', 'error');
      return;
    }

    if (!PROFILE_URL_PATTERN.test(tab.url || '')) {
      setStatus('Open a LinkedIn profile page before running Auto Connect.', 'warning');
      return;
    }

    await setAutoConnectMode('single');
    await setAutoConnectRunning(true);
    started = true;

    if (stopButton) {
      stopButton.disabled = false;
      stopButton.style.display = '';
    }
    if (startButton) {
      startButton.style.display = 'none';
    }

    await setAbortFlag(tab.id, false);
    setStatus('Starting connection sequence...', 'info');

    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: connectWithProfileScript,
      args: [connectAutomation]
    });

    if (result?.success) {
      setStatus('Connection request sent! 🎉', 'success');
    } else if (result?.reason === 'aborted') {
      setStatus('Auto connect cancelled.', 'info');
    } else {
      const reason = describeConnectFailure(result);
      setStatus(`Auto connect failed: ${reason}`, 'error');
    }
  } catch (error) {
    console.error('Auto connect failed:', error);
    setStatus(`Auto connect failed: ${error.message}`, 'error');
  } finally {
    if (started) {
      await setAutoConnectRunning(false);
    }
    await setAutoConnectMode(null);
    if (stopButton) {
      stopButton.disabled = false;
      stopButton.style.display = 'none';
    }
    if (startButton) {
      startButton.disabled = false;
      startButton.style.display = '';
    }
  }
}

export async function handleConnectAutomationAll(startButton, stopButton) {
  try {
    if (startButton) startButton.disabled = true;
    setStatus('Preparing bulk auto connect...', 'info');

    const stateEntry = await chrome.storage.local.get(AUTO_CONNECT_STATE_KEY);
    if (stateEntry?.[AUTO_CONNECT_STATE_KEY]) {
      setStatus('Auto connect is already running.', 'info');
      return;
    }

    const settings = await getSettings();
    if (!settings.connectAutomation?.enabled) {
      setStatus('Enable Connect Automation in settings before using Auto Connect All.', 'warning');
      return;
    }

    const connectAutomation = normaliseConnectSettings(settings.connectAutomation);
    if (!connectAutomation || !connectAutomation.message) {
      setStatus('Add a connection message in settings first.', 'warning');
      return;
    }

    const leads = await getLeads();
    const targets = leads.filter((lead) => PROFILE_URL_PATTERN.test(lead?.profileUrl || ''));
    if (targets.length === 0) {
      setStatus('No leads with LinkedIn profile URLs to connect.', 'warning');
      return;
    }

    const response = await chrome.runtime.sendMessage({ type: 'START_AUTO_CONNECT_ALL' });

    if (!response || !response.success) {
      const message = response?.error || 'Unknown error';
      setStatus(`Failed to start Auto Connect All: ${message}`, 'error');
      return;
    }

    setStatus(`Auto Connect All started for ${response.total} lead(s).`, 'info');
    if (stopButton) {
      stopButton.disabled = false;
      stopButton.style.display = '';
    }
    if (startButton) {
      startButton.style.display = 'none';
    }
  } catch (error) {
    console.error('Failed to start Auto Connect All:', error);
    setStatus(`Failed to start Auto Connect All: ${error.message}`, 'error');
  } finally {
    if (startButton) startButton.disabled = false;
  }
}

export async function handleStopConnectAutomation(stopButton) {
  try {
    if (stopButton) stopButton.disabled = true;
    setStatus('Requesting auto connect to stop...', 'info');

    const modeEntry = await chrome.storage.local.get(AUTO_CONNECT_MODE_KEY);
    const mode = modeEntry?.[AUTO_CONNECT_MODE_KEY] ?? null;

    if (mode === 'batch') {
      await chrome.runtime.sendMessage({ type: 'STOP_AUTO_CONNECT_ALL' });
      setStatus('Auto connect all will stop after the current profile.', 'info');
      return;
    }

    const stateEntry = await chrome.storage.local.get(AUTO_CONNECT_STATE_KEY);
    const isRunning = Boolean(stateEntry?.[AUTO_CONNECT_STATE_KEY]);
    if (!isRunning) {
      if (stopButton) {
        stopButton.style.display = 'none';
      }
      setStatus('Auto connect is not currently running.', 'info');
      return;
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      setStatus('No active tab found to stop.', 'warning');
      return;
    }

    if (!PROFILE_URL_PATTERN.test(tab.url || '')) {
      setStatus('Auto connect stop works on active LinkedIn profile tabs only.', 'warning');
      return;
    }

    await setAbortFlag(tab.id, true);
    setStatus('Auto connect will cancel after the current step.', 'info');
  } catch (error) {
    console.error('Failed to stop auto connect:', error);
    setStatus(`Failed to stop auto connect: ${error.message}`, 'error');
  } finally {
    if (stopButton) stopButton.disabled = false;
  }
}
