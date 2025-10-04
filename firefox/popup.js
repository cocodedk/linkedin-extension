/**
 * Main popup controller - orchestrates UI and event handling
 */

import { getLeads, getApiKey } from './scripts/storage.js';
import { renderLeads } from './popup/ui.js';
import { updateButtonVisibility } from './popup/ui/button-visibility.js';
import {
  handleScan,
  handleScanNext,
  handleViewLeads,
  handleExportCsv,
  handleExportJson,
  handleClearLeads,
  handleSaveApiKey,
  handleEvaluate,
  handleGenerateAiQuery
} from './popup/handlers.js';
import { handleEnrichWithVirk } from './popup/handlers/virk-handler.js';

// DOM elements
const scanBtn = document.getElementById('scan-btn');
const scanNextBtn = document.getElementById('scan-next-btn');
const openVirkBtn = document.getElementById('open-virk-btn');
const viewBtn = document.getElementById('view-btn');
const evaluateBtn = document.getElementById('evaluate-btn');
const enrichVirkBtn = document.getElementById('enrich-virk-btn');
const generateAiQueryBtn = document.getElementById('generate-ai-query-btn');
const openTabBtn = document.getElementById('open-tab-btn');
const exportCsvBtn = document.getElementById('export-csv-btn');
const exportJsonBtn = document.getElementById('export-json-btn');
const saveApiKeyBtn = document.getElementById('save-api-key-btn');
const clearLeadsBtn = document.getElementById('clear-leads-btn');
const apiKeyInput = document.getElementById('api-key');

// Get cross-browser API
const browserApi = globalThis.browser ?? globalThis.chrome;

// Event listeners
scanBtn.addEventListener('click', handleScan);
scanNextBtn.addEventListener('click', handleScanNext);
openVirkBtn.addEventListener('click', () => {
  browserApi.tabs.create({ url: 'https://datacvr.virk.dk/' });
});
viewBtn.addEventListener('click', handleViewLeads);
evaluateBtn.addEventListener('click', () => handleEvaluate(evaluateBtn, apiKeyInput));
enrichVirkBtn.addEventListener('click', handleEnrichWithVirk);
exportCsvBtn.addEventListener('click', handleExportCsv);
exportJsonBtn.addEventListener('click', handleExportJson);
saveApiKeyBtn.addEventListener('click', () => handleSaveApiKey(apiKeyInput));
clearLeadsBtn.addEventListener('click', handleClearLeads);
generateAiQueryBtn.addEventListener('click', () => handleGenerateAiQuery(generateAiQueryBtn, apiKeyInput));
openTabBtn.addEventListener('click', async () => {
  const leadsUrl = browserApi.runtime.getURL('leads.html');
  const tabs = await browserApi.tabs.query({ url: leadsUrl });

  if (tabs.length > 0) {
    // Tab exists, focus it and reload
    await browserApi.tabs.update(tabs[0].id, { active: true });
    await browserApi.tabs.reload(tabs[0].id);
  } else {
    // No tab exists, create new one
    await browserApi.tabs.create({ url: leadsUrl });
  }
});

// Initialize
async function initialise() {
  const apiKey = await getApiKey();
  apiKeyInput.value = apiKey;
  const leads = await getLeads();
  renderLeads(leads);
  await updateButtonVisibility(leads);
}

document.addEventListener('DOMContentLoaded', initialise);
