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
const exportCsvBtn = document.getElementById('export-csv-btn');
const exportJsonBtn = document.getElementById('export-json-btn');
const saveApiKeyBtn = document.getElementById('save-api-key-btn');
const clearLeadsBtn = document.getElementById('clear-leads-btn');
const generateAiQueryBtn = document.getElementById('generate-ai-query-btn');
const openTabBtn = document.getElementById('open-tab-btn');
const apiKeyInput = document.getElementById('api-key');

// Event listeners
scanBtn.addEventListener('click', () => {
  // Start deep scan in background
  handleScan();
});
scanNextBtn.addEventListener('click', handleScanNext);
openVirkBtn.addEventListener('click', () => {
  browser.tabs.create({ url: 'https://datacvr.virk.dk/' });
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
  const leadsUrl = chrome.runtime.getURL('leads.html');
  const tabs = await chrome.tabs.query({ url: leadsUrl });

  if (tabs.length > 0) {
    // Tab exists, focus it and reload
    await chrome.tabs.update(tabs[0].id, { active: true });
    await chrome.tabs.reload(tabs[0].id);
  } else {
    // No tab exists, create new one
    await chrome.tabs.create({ url: leadsUrl });
  }
});

// Initialize
async function initialise() {
  const apiKey = await getApiKey();
  apiKeyInput.value = apiKey;
  const leads = await getLeads();
  console.log(`Popup: Loaded ${leads.length} leads from storage`);
  const enrichedCount = leads.filter(l => l.virkEnriched).length;
  console.log(`Popup: ${enrichedCount} leads have Virk enrichment`);
  renderLeads(leads);
  await updateButtonVisibility(leads);
}

document.addEventListener('DOMContentLoaded', initialise);
