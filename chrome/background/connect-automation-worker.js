/**
 * Connect Automation entry points. The public API the rest of the extension
 * imports (see message-handlers.js) — the implementation is split across
 * the sibling connect-automation-*.js modules so each file stays under the
 * repo's line limit.
 */

import { getLeads } from '../scripts/storage.js';
import { PROFILE_URL_PATTERN } from '../scripts/connect/connect-automation-utils.js';
import { state, updateRunningState } from './connect-automation-state.js';
import {
  sendRuntimeMessage,
  finishRun,
  getValidatedConnectSettings
} from './connect-automation-helpers.js';
import { runConnectOnExistingTab } from './connect-automation-single.js';
import { runAutoConnectAll } from './connect-automation-batch.js';

export { stopAutoConnect } from './connect-automation-state.js';

export async function startAutoConnectSingle(tabId) {
  if (state.running) {
    throw new Error('Auto Connect is already running.');
  }

  const connectSettings = await getValidatedConnectSettings();

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

  const connectSettings = await getValidatedConnectSettings();

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
