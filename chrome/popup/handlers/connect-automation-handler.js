/**
 * Handle manual and bulk connect automation from the popup.
 * Delegates execution to the background worker so state survives popup closure.
 */

import { setStatus } from '../ui.js';
import { getSettings } from '../../scripts/settings.js';
import { getLeads } from '../../scripts/storage.js';
import { PROFILE_URL_PATTERN } from '../../scripts/connect/connect-automation-utils.js';

async function ensureConnectAutomationEnabled() {
  const settings = await getSettings();
  if (!settings.connectAutomation?.enabled) {
    throw new Error('Enable Connect Automation in settings first.');
  }
  const message = (settings.connectAutomation?.message || '').trim();
  if (!message) {
    throw new Error('Add a connection message in settings first.');
  }
  return settings;
}

export async function handleConnectAutomation(startButton, stopButton) {
  try {
    if (startButton) startButton.disabled = true;
    setStatus('Preparing connection request...', 'info');

    await ensureConnectAutomationEnabled();

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      throw new Error('No active tab found.');
    }

    if (!PROFILE_URL_PATTERN.test(tab.url || '')) {
      throw new Error('Open a LinkedIn profile page before running Auto Connect.');
    }

    const response = await chrome.runtime.sendMessage({
      type: 'START_AUTO_CONNECT_SINGLE',
      tabId: tab.id
    });

    if (!response || !response.success) {
      throw new Error(response?.error || 'Unknown error starting Auto Connect.');
    }

    setStatus('Auto connect started. You can close the popup.', 'info');
    if (stopButton) {
      stopButton.disabled = false;
      stopButton.style.display = '';
    }
    if (startButton) {
      startButton.style.display = 'none';
    }
  } catch (error) {
    console.error('Auto connect failed to start:', error);
    setStatus(`Failed to start auto connect: ${error.message}`, 'error');
  } finally {
    if (startButton) startButton.disabled = false;
  }
}

export async function handleConnectAutomationAll(startButton, stopButton) {
  try {
    if (startButton) startButton.disabled = true;
    setStatus('Preparing bulk auto connect...', 'info');

    await ensureConnectAutomationEnabled();

    const leads = await getLeads();
    const targets = leads.filter((lead) => PROFILE_URL_PATTERN.test(lead?.profileUrl || ''));
    if (targets.length === 0) {
      throw new Error('No leads with LinkedIn profile URLs to connect.');
    }

    const response = await chrome.runtime.sendMessage({ type: 'START_AUTO_CONNECT_ALL' });
    if (!response || !response.success) {
      throw new Error(response?.error || 'Unknown error starting Auto Connect All.');
    }

    setStatus(`Auto Connect All started for ${response.total} lead(s). You can close the popup.`, 'info');
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

    const response = await chrome.runtime.sendMessage({ type: 'STOP_AUTO_CONNECT' });

    if (!response || !response.success) {
      setStatus('Auto connect is not currently running.', 'info');
      if (stopButton) stopButton.style.display = 'none';
      return;
    }

    if (response.stopped) {
      const modeLabel = response.mode === 'batch' ? 'Auto Connect All' : 'Auto Connect';
      setStatus(`${modeLabel} will cancel after the current step.`, 'info');
    } else {
      setStatus('Auto connect is not currently running.', 'info');
      if (stopButton) stopButton.style.display = 'none';
    }
  } catch (error) {
    console.error('Failed to stop auto connect:', error);
    setStatus(`Failed to stop auto connect: ${error.message}`, 'error');
  } finally {
    if (stopButton) stopButton.disabled = false;
  }
}
