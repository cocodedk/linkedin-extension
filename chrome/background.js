/**
 * Background service worker for Chrome extension
 * Handles long-running tasks that need to survive popup closure
 */

import { runtime } from './api/runtime.js';
import {
  handleDeepScanRequest,
  handleDeepScanAllRequest,
  handleVirkEnrichmentRequest,
  handleStopDeepScanAllRequest,
  handleGetDeepScanAllStatus,
  handleStartAutoConnectSingleRequest,
  handleStartAutoConnectAllRequest,
  handleStopAutoConnectRequest
} from './background/message-handlers.js';

// Listen for messages from popup
runtime.onMessage.addListener((message, sender, sendResponse) => {
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

  if (message.type === 'START_AUTO_CONNECT_SINGLE') {
    handleStartAutoConnectSingleRequest(message.tabId)
      .then(info => sendResponse({ success: true, mode: info.mode }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message.type === 'START_AUTO_CONNECT_ALL') {
    handleStartAutoConnectAllRequest()
      .then(summary => sendResponse({ success: true, total: summary.total }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message.type === 'STOP_AUTO_CONNECT') {
    handleStopAutoConnectRequest()
      .then(result => sendResponse({ success: true, stopped: result.stopped, mode: result.mode }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});
