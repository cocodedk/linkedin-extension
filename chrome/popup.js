/**
 * Main popup controller - orchestrates UI and event handling
 */

import { getLeads, getApiKey } from './scripts/storage.js';
import { renderLeads } from './popup/ui.js';
import {
  handleScan,
  handleViewLeads,
  handleExportCsv,
  handleExportJson,
  handleClearLeads,
  handleSaveApiKey,
  handleEvaluate,
  handleGenerateAiQuery
} from './popup/handlers.js';

// DOM elements
const scanBtn = document.getElementById('scan-btn');
const viewBtn = document.getElementById('view-btn');
const evaluateBtn = document.getElementById('evaluate-btn');
const exportCsvBtn = document.getElementById('export-csv-btn');
const exportJsonBtn = document.getElementById('export-json-btn');
const saveApiKeyBtn = document.getElementById('save-api-key-btn');
const clearLeadsBtn = document.getElementById('clear-leads-btn');
const generateAiQueryBtn = document.getElementById('generate-ai-query-btn');
const apiKeyInput = document.getElementById('api-key');

// Event listeners
scanBtn.addEventListener('click', handleScan);
viewBtn.addEventListener('click', handleViewLeads);
evaluateBtn.addEventListener('click', () => handleEvaluate(evaluateBtn, apiKeyInput));
exportCsvBtn.addEventListener('click', handleExportCsv);
exportJsonBtn.addEventListener('click', handleExportJson);
saveApiKeyBtn.addEventListener('click', () => handleSaveApiKey(apiKeyInput));
clearLeadsBtn.addEventListener('click', handleClearLeads);
generateAiQueryBtn.addEventListener('click', () => handleGenerateAiQuery(generateAiQueryBtn, apiKeyInput));

// Initialize
async function initialise() {
  const apiKey = await getApiKey();
  apiKeyInput.value = apiKey;
  const leads = await getLeads();
  renderLeads(leads);
}

document.addEventListener('DOMContentLoaded', initialise);
