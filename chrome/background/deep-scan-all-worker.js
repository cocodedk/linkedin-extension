/**
 * Deep Scan ALL background worker - multi-page scanning orchestrator
 */

import { runDeepScanInBackground } from './deep-scan-worker.js';
import { saveLeads, getLeads } from '../scripts/storage.js';
import {
  state,
  initState,
  stopState,
  incrementPage,
  updateLeadCount,
  incrementErrors,
  resetErrors,
  saveStateToStorage,
  clearStateFromStorage,
  getStatusFromStorage
} from './deep-scan-all-state.js';
import {
  updateBadge,
  clearBadge,
  checkNextButtonExists,
  clickNextButton,
  sleep,
  showStartNotification,
  showStoppedNotification,
  handleComplete,
  handleFailure,
  processPage
} from './deep-scan-all-helpers.js';
import { getSettings } from '../scripts/settings.js';

export async function runDeepScanAllInBackground(searchTabId) {
  console.log('Deep Scan ALL: Starting...');
  const { deepScanAll } = await getSettings();
  const maxPages = deepScanAll.maxPages;
  const pageDelayMs = deepScanAll.pageDelayMs;
  console.log(`Deep Scan ALL: Settings -> maxPages:${maxPages}, pageDelay:${pageDelayMs}ms`);
  initState(searchTabId);
  await saveStateToStorage();
  await updateBadge(state.currentPage);
  await showStartNotification(maxPages);

  try {
    while (state.isRunning && state.currentPage <= maxPages) {
      console.log(`Deep Scan ALL: Processing page ${state.currentPage}/${maxPages}`);
      try {
        const totalCount = await processPage(searchTabId, runDeepScanInBackground, getLeads, saveLeads);
        updateLeadCount(totalCount);
        resetErrors();
        console.log(`Deep Scan ALL: Page ${state.currentPage} complete. Total: ${state.totalLeads}`);
      } catch (error) {
        console.error(`Deep Scan ALL: Error on page ${state.currentPage}:`, error);
        incrementErrors();
        if (state.consecutiveErrors >= 3) {
          throw new Error(`Stopped after 3 consecutive errors: ${error.message}`);
        }
      }
      await updateBadge(state.currentPage);
      if (state.currentPage >= maxPages || !state.isRunning) break;
      const hasNext = await checkNextButtonExists(searchTabId);
      if (!hasNext) break;
      await clickNextButton(searchTabId);
      await sleep(pageDelayMs);
      incrementPage();
      await saveStateToStorage();
    }
    await handleComplete(state.currentPage, state.totalLeads, clearStateFromStorage, clearBadge);
  } catch (error) {
    await handleFailure(state.currentPage, error, clearStateFromStorage, clearBadge);
    throw error;
  }
}

export async function stopDeepScanAll() {
  console.log('Deep Scan ALL: Stopping...');
  const { currentPage, totalLeads } = state;
  stopState();
  await clearStateFromStorage();
  await clearBadge();
  await showStoppedNotification(currentPage, totalLeads);
  return { totalLeads, currentPage };
}

export async function getDeepScanAllStatus() {
  return await getStatusFromStorage();
}
