/**
 * State management for Deep Scan ALL
 */

export const state = {
  isRunning: false,
  currentPage: 0,
  totalLeads: 0,
  searchTabId: null,
  consecutiveErrors: 0
};

export function initState(searchTabId) {
  state.isRunning = true;
  state.currentPage = 1;
  state.totalLeads = 0;
  state.searchTabId = searchTabId;
  state.consecutiveErrors = 0;
}

export function stopState() {
  state.isRunning = false;
}

export function incrementPage() {
  state.currentPage++;
}

export function updateLeadCount(count) {
  state.totalLeads = count;
}

export function incrementErrors() {
  state.consecutiveErrors++;
}

export function resetErrors() {
  state.consecutiveErrors = 0;
}

export async function saveStateToStorage() {
  await chrome.storage.local.set({
    isDeepScanAllRunning: state.isRunning,
    deepScanAllProgress: { ...state }
  });
}

export async function clearStateFromStorage() {
  state.isRunning = false;
  await chrome.storage.local.remove(['isDeepScanAllRunning', 'deepScanAllProgress']);
}

export async function getStatusFromStorage() {
  const { isDeepScanAllRunning } = await chrome.storage.local.get('isDeepScanAllRunning');
  return { isRunning: isDeepScanAllRunning || false };
}
