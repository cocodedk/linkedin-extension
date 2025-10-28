/**
 * Helper functions for Deep Scan ALL
 */

import { action } from '../api/action.js';
import { scripting } from '../api/scripting.js';
import { notifications } from '../api/notifications.js';
import { checkLinkedInNextExists, clickLinkedInNext } from '../popup/utils/pagination.js';

export const MAX_PAGES = 100;
export const PAGE_DELAY_MS = 2500;

export async function updateBadge(pageNumber) {
  await action.setBadgeText({ text: String(pageNumber) });
  await action.setBadgeBackgroundColor({ color: '#0073b1' });
}

export async function clearBadge() {
  await action.setBadgeText({ text: '' });
}

export async function checkNextButtonExists(tabId) {
  const [{ result }] = await scripting.executeScript({
    target: { tabId },
    func: checkLinkedInNextExists
  });
  return result || false;
}

export async function clickNextButton(tabId) {
  const [{ result }] = await scripting.executeScript({
    target: { tabId },
    func: clickLinkedInNext
  });
  
  if (!result?.success) {
    throw new Error('Failed to click Next button');
  }
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function showStartNotification() {
  await notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: 'Deep Scan ALL Started',
    message: `Starting scan (Page 1/${MAX_PAGES})`
  });
}

export async function showCompleteNotification(currentPage, totalLeads) {
  await notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: 'Deep Scan ALL Complete',
    message: `Scanned ${currentPage} pages. Extracted ${totalLeads} leads.`
  });
}

export async function showStoppedNotification(currentPage, totalLeads) {
  await notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: 'Deep Scan ALL Stopped',
    message: `Stopped at page ${currentPage}. Saved ${totalLeads} leads.`
  });
}

export async function showErrorNotification(currentPage, error) {
  await notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: 'Deep Scan ALL Failed',
    message: `Failed at page ${currentPage}: ${error.message}`
  });
}

export async function handleComplete(currentPage, totalLeads, clearStateFn, clearBadgeFn) {
  await clearStateFn();
  await clearBadgeFn();
  await showCompleteNotification(currentPage, totalLeads);
}

export async function handleFailure(currentPage, error, clearStateFn, clearBadgeFn) {
  await clearStateFn();
  await clearBadgeFn();
  await showErrorNotification(currentPage, error);
}

export async function processPage(searchTabId, runDeepScanFn, getLeadsFn, saveLeadsFn) {
  const pageLeads = await runDeepScanFn(searchTabId);
  const allLeads = await getLeadsFn();
  const updatedLeads = [...allLeads, ...pageLeads];
  await saveLeadsFn(updatedLeads);
  return updatedLeads.length;
}
