/**
 * Background service worker for Firefox extension
 * Handles long-running tasks that need to survive popup closure
 */

import { browserApi } from './popup/browser-api.js';
import {
  handleDeepScanRequest,
  handleDeepScanAllRequest,
  handleVirkEnrichmentRequest,
  handleStopDeepScanAllRequest,
  handleGetDeepScanAllStatus
} from './background/message-handlers.js';

// Listen for messages from popup
browserApi.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_DEEP_SCAN') {
    handleDeepScanRequest(message.searchTabId)
      .then(result => sendResponse({ success: true, leads: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message.type === 'START_DEEP_SCAN_ALL') {
    handleDeepScanAllRequest(message.searchTabId)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message.type === 'STOP_DEEP_SCAN_ALL') {
    handleStopDeepScanAllRequest()
      .then(result => sendResponse({ success: true, totalLeads: result.totalLeads }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message.type === 'GET_DEEP_SCAN_ALL_STATUS') {
    handleGetDeepScanAllStatus()
      .then(status => sendResponse({ success: true, status }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message.type === 'START_VIRK_ENRICHMENT') {
    handleVirkEnrichmentRequest()
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});
