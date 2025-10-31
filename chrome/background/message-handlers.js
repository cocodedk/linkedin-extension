/**
 * Message handlers for background service worker
 */

import { notifications } from '../api/notifications.js';
import { runDeepScanInBackground } from './deep-scan-worker.js';
import { runVirkEnrichmentInBackground } from './virk-enrichment-worker.js';
import { runDeepScanAllInBackground, stopDeepScanAll, getDeepScanAllStatus } from './deep-scan-all-worker.js';
import {
  startAutoConnectSingle,
  startAutoConnectAll,
  stopAutoConnect
} from './connect-automation-worker.js';
import { saveLeads } from '../scripts/storage.js';

export async function handleDeepScanRequest(searchTabId) {
  try {
    console.log('Background: Starting deep scan for tab', searchTabId);
    const leads = await runDeepScanInBackground(searchTabId);
    const savedLeads = await saveLeads(leads);
    console.log('Background: Deep scan complete, saved', savedLeads.length, 'leads');

    notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Deep Scan Complete',
      message: `Successfully extracted ${savedLeads.length} leads with company data`
    });

    return savedLeads;
  } catch (error) {
    console.error('Background: Deep scan error:', error);

    notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Deep Scan Failed',
      message: error.message
    });

    throw error;
  }
}

export async function handleDeepScanAllRequest(searchTabId) {
  try {
    console.log('Background: Starting Deep Scan ALL for tab', searchTabId);
    await runDeepScanAllInBackground(searchTabId);
  } catch (error) {
    console.error('Background: Deep Scan ALL error:', error);
    throw error;
  }
}

export async function handleVirkEnrichmentRequest() {
  try {
    console.log('Background: Starting Virk enrichment...');
    const result = await runVirkEnrichmentInBackground();
    console.log(`Background: Virk enrichment complete, enriched ${result.enriched}/${result.total} leads`);

    notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Virk Enrichment Complete',
      message: `✅ Enriched ${result.enriched}/${result.total} leads with CVR data`
    });

    return result;
  } catch (error) {
    console.error('Background: Virk enrichment error:', error);

    notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Virk Enrichment Failed',
      message: error.message
    });

    throw error;
  }
}

export async function handleStopDeepScanAllRequest() {
  return await stopDeepScanAll();
}

export async function handleGetDeepScanAllStatus() {
  return await getDeepScanAllStatus();
}

export async function handleStartAutoConnectSingleRequest(tabId) {
  return await startAutoConnectSingle(tabId);
}

export async function handleStartAutoConnectAllRequest() {
  return await startAutoConnectAll();
}

export async function handleStopAutoConnectRequest() {
  return await stopAutoConnect();
}
