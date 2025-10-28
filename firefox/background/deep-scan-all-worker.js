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
  MAX_PAGES,
  PAGE_DELAY_MS,
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

export async function runDeepScanAllInBackground(searchTabId) {
  console.log('Deep Scan ALL: Starting...');
  initState(searchTabId);
  await saveStateToStorage();
  await updateBadge(state.currentPage);
  await showStartNotification();

  try {
    while (state.isRunning && state.currentPage <= MAX_PAGES) {
      console.log(`Deep Scan ALL: Processing page ${state.currentPage}/${MAX_PAGES}`);
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
      if (state.currentPage >= MAX_PAGES || !state.isRunning) break;
      const hasNext = await checkNextButtonExists(searchTabId);
      if (!hasNext) break;
      await clickNextButton(searchTabId);
      await sleep(PAGE_DELAY_MS);
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
