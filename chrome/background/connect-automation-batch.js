/**
 * Batch Connect Automation run: open each lead's profile in its own tab,
 * one at a time, and connect. Split out of connect-automation-worker.js so
 * each module stays small.
 */

import { connectWithProfileScript } from '../popup/handlers/connect-automation.js';
import { describeConnectFailure } from '../scripts/connect/connect-automation-utils.js';
import { state, sleep, setAbortFlag } from './connect-automation-state.js';
import {
  sendRuntimeMessage,
  buildLeadInfoFromLead,
  waitForTabComplete
} from './connect-automation-helpers.js';

export async function runAutoConnectAll(targets, connectSettings) {
  state.processed = 0;
  state.successes = 0;
  state.failures = 0;

  sendRuntimeMessage({
    type: 'AUTO_CONNECT_STARTED',
    mode: 'batch',
    total: targets.length
  });

  for (let index = 0; index < targets.length; index += 1) {
    if (state.cancelRequested) {
      break;
    }

    const lead = targets[index];
    const leadInfo = buildLeadInfoFromLead(lead);
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
    }

    if (state.cancelRequested) {
      break;
    }
    await sleep(2000);
  }
}
