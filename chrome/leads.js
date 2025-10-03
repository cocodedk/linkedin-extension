/**
 * Full-page leads view controller
 */

import { getLeads, getApiKey } from './scripts/storage.js';
import { renderLeads } from './popup/ui.js';
import {
  handleExportCsv,
  handleExportJson,
  handleClearLeads,
  handleSaveApiKey,
  handleEvaluate
} from './popup/handlers.js';

// DOM elements
const evaluateBtn = document.getElementById('evaluate-btn');
const exportCsvBtn = document.getElementById('export-csv-btn');
const exportJsonBtn = document.getElementById('export-json-btn');
const saveApiKeyBtn = document.getElementById('save-api-key-btn');
const clearLeadsBtn = document.getElementById('clear-leads-btn');
const apiKeyInput = document.getElementById('api-key');
const leadCountEl = document.getElementById('lead-count');

// Event listeners
evaluateBtn.addEventListener('click', async () => {
  await handleEvaluate(evaluateBtn, apiKeyInput);
  updateLeadCount();
});

exportCsvBtn.addEventListener('click', handleExportCsv);
exportJsonBtn.addEventListener('click', handleExportJson);
saveApiKeyBtn.addEventListener('click', () => handleSaveApiKey(apiKeyInput));

clearLeadsBtn.addEventListener('click', async () => {
  if (confirm('Are you sure you want to clear all leads? This cannot be undone.')) {
    await handleClearLeads();
    updateLeadCount();
  }
});

// Update lead count in header
async function updateLeadCount() {
  const leads = await getLeads();
  leadCountEl.textContent = leads.length === 1 ? '1 lead' : `${leads.length} leads`;
}

// Initialize
async function initialise() {
  const apiKey = await getApiKey();
  apiKeyInput.value = apiKey;
  const leads = await getLeads();
  renderLeads(leads);
  updateLeadCount();
}

document.addEventListener('DOMContentLoaded', initialise);
