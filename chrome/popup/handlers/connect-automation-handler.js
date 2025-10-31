/**
 * Handle manual connect automation from the popup.
 */

import { setStatus } from '../ui.js';
import { connectWithProfileScript } from './connect-automation.js';
import { getSettings } from '../../scripts/settings.js';

const PROFILE_URL_PATTERN = /linkedin\.com\/in\//i;

function normaliseSettings(raw) {
  if (!raw) return null;
  const {
    message = '',
    initialDelayMs,
    confirmDelayMs,
    messageDelayMs,
    sendDelayMs,
    typingCharMinDelayMs,
    typingCharMaxDelayMs
  } = raw;

  return {
    message: message.trim(),
    initialDelayMs,
    confirmDelayMs,
    messageDelayMs,
    sendDelayMs,
    typingCharMinDelayMs,
    typingCharMaxDelayMs
  };
}

function describeFailure(result) {
  if (!result) return 'Connect flow did not report a result.';

  switch (result.reason) {
    case 'empty-message':
      return 'Connection message is empty.';
    case 'connect-button-missing':
      return 'Connect button not available on this profile.';
    case 'connect-button-unavailable':
      return 'This profile cannot be contacted via the Connect button.';
    case 'add-note-missing':
      return 'LinkedIn did not show the “Add note” button.';
    case 'textarea-missing':
      return 'Message textbox not found.';
    case 'send-button-missing':
      return 'Send button not found.';
    case 'menu-button-missing':
      return 'The action menu was not available on this profile.';
    case 'menu-connect-missing':
      return 'Could not find the Connect option inside the action menu.';
    case 'menu-connect-unavailable':
      return 'The menu did not contain a Connect option.';
    default:
      return result.error || 'Unknown issue prevented sending the connection.';
  }
}

export async function handleConnectAutomation(button) {
  try {
    if (button) button.disabled = true;
    setStatus('Preparing connection request...', 'info');

    const settings = await getSettings();
    const connectAutomation = normaliseSettings(settings.connectAutomation);

    if (!settings.connectAutomation?.enabled) {
      setStatus('Enable Connect Automation in settings before using this button.', 'warning');
      return;
    }

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

    setStatus('Starting connection sequence...', 'info');

    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: connectWithProfileScript,
      args: [connectAutomation]
    });

    if (result?.success) {
      setStatus('Connection request sent! 🎉', 'success');
    } else {
      const reason = describeFailure(result);
      setStatus(`Auto connect failed: ${reason}`, 'error');
    }
  } catch (error) {
    console.error('Auto connect failed:', error);
    setStatus(`Auto connect failed: ${error.message}`, 'error');
  } finally {
    if (button) button.disabled = false;
  }
}
