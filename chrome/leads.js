/**
 * Full-page leads view controller
 */

import { getLeads, getApiKey } from './scripts/storage.js';
import { renderLeads } from './popup/ui.js';
import {
  handleExportCsv,
  handleExportJson,
  handleCopyCsv,
  handleCopyJson,
  handleOpenCsvInTab,
  handleOpenJsonInTab,
  handleSaveCsvWithFS,
  handleSaveJsonWithFS,
  handleClearLeads,
  handleSaveApiKey,
  handleEvaluate,
  handleViewLeads
} from './popup/handlers.js';
import { handleEnrichWithVirk } from './popup/handlers/virk-handler.js';

// DOM elements
const viewBtn = document.getElementById('view-btn');
const evaluateBtn = document.getElementById('evaluate-btn');
const enrichVirkBtn = document.getElementById('enrich-virk-btn');
const exportCsvBtn = document.getElementById('export-csv-btn');
const exportJsonBtn = document.getElementById('export-json-btn');
const copyCsvBtn = document.getElementById('copy-csv-btn');
const copyJsonBtn = document.getElementById('copy-json-btn');
const openCsvTabBtn = document.getElementById('open-csv-tab-btn');
const openJsonTabBtn = document.getElementById('open-json-tab-btn');
const saveCsvFsBtn = document.getElementById('save-csv-fs-btn');
const saveJsonFsBtn = document.getElementById('save-json-fs-btn');
const saveApiKeyBtn = document.getElementById('save-api-key-btn');
const clearLeadsBtn = document.getElementById('clear-leads-btn');
const apiKeyInput = document.getElementById('api-key');
const leadCountEl = document.getElementById('lead-count');

// Event listeners
viewBtn.addEventListener('click', async () => {
  await handleViewLeads();
  updateLeadCount();
});

evaluateBtn.addEventListener('click', async () => {
  await handleEvaluate(evaluateBtn, apiKeyInput);
  updateLeadCount();
});

enrichVirkBtn.addEventListener('click', async () => {
  await handleEnrichWithVirk();
  updateLeadCount();
});

exportCsvBtn.addEventListener('click', handleExportCsv);
exportJsonBtn.addEventListener('click', handleExportJson);
copyCsvBtn.addEventListener('click', handleCopyCsv);
copyJsonBtn.addEventListener('click', handleCopyJson);
openCsvTabBtn.addEventListener('click', handleOpenCsvInTab);
openJsonTabBtn.addEventListener('click', handleOpenJsonInTab);
saveCsvFsBtn.addEventListener('click', handleSaveCsvWithFS);
saveJsonFsBtn.addEventListener('click', handleSaveJsonWithFS);
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
