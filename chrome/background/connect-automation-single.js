/**
 * Single-tab Connect Automation run: connect to the profile open in an
 * already-existing tab. Split out of connect-automation-worker.js so each
 * module stays small.
 */

import { connectWithProfileScript } from '../popup/handlers/connect-automation.js';
import { describeConnectFailure } from '../scripts/connect/connect-automation-utils.js';
import { state, setAbortFlag } from './connect-automation-state.js';
import { sendRuntimeMessage, buildLeadInfoFromTab } from './connect-automation-helpers.js';

export async function runConnectOnExistingTab(tabId, connectSettings) {
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
