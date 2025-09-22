import { scrapeLinkedInResults } from './scripts/scraper.js';
import {
  getLeads,
  saveLeads,
  clearLeads,
  getApiKey,
  setApiKey,
  setLastAiQuery,
  getLastAiQuery
} from './scripts/storage.js';
import { toCsv, toJson, triggerDownload } from './scripts/exporters.js';
import { evaluateLeads } from './scripts/evaluation.js';
import { generateAiSearchQuery } from './scripts/ai-query.js';

const scanBtn = document.getElementById('scan-btn');
const viewBtn = document.getElementById('view-btn');
const evaluateBtn = document.getElementById('evaluate-btn');
const exportCsvBtn = document.getElementById('export-csv-btn');
const exportJsonBtn = document.getElementById('export-json-btn');
const saveApiKeyBtn = document.getElementById('save-api-key-btn');
const clearLeadsBtn = document.getElementById('clear-leads-btn');
const generateAiQueryBtn = document.getElementById('generate-ai-query-btn');
const apiKeyInput = document.getElementById('api-key');
const statusEl = document.getElementById('status');
const leadsTableBody = document.querySelector('#leads-table tbody');

function setStatus(message, type = 'info') {
  statusEl.textContent = message;
  statusEl.dataset.type = type;
}

function renderLeads(leads) {
  leadsTableBody.innerHTML = '';
  if (!Array.isArray(leads) || leads.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 8;
    cell.textContent = 'No leads stored yet.';
    row.appendChild(cell);
    leadsTableBody.appendChild(row);
    return;
  }

  leads.forEach((lead) => {
    const row = document.createElement('tr');
    const values = [
      lead.name ?? '',
      lead.headline ?? '',
      lead.company ?? '',
      lead.contact ?? '',
      lead.location ?? '',
      lead.aiScore ?? '',
      lead.aiReasons ?? '',
      lead.aiFitSummary ?? ''
    ];

    values.forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    });

    leadsTableBody.appendChild(row);
  });
}

async function getActiveTabId() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    throw new Error('No active tab found.');
  }
  return tab.id;
}

async function injectQueryIntoLinkedIn({ tabId, query }) {
  const selectors = [
    'input.search-global-typeahead__input',
    'input[data-view-name="search-global-typeahead-input"]',
    'input[role="combobox"][aria-label="Search"]'
  ];

  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: ({ selectors: selectorList, value }) => {
      const pickInput = () => {
        for (const selector of selectorList) {
          const node = document.querySelector(selector);
          if (node instanceof HTMLInputElement) {
            return node;
          }
        }
        return null;
      };

      const input = pickInput();
      if (!input) {
        return { success: false };
      }

      const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
      if (descriptor?.set) {
        descriptor.set.call(input, value);
      } else {
        input.value = value;
      }

      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.focus();
      return { success: true };
    },
    args: [{ selectors, value: query }]
  });

  if (!result?.success) {
    throw new Error('Unable to locate LinkedIn search box.');
  }
}

async function handleScan() {
  setStatus('Scanning results...');
  try {
    const tabId = await getActiveTabId();
    const [{ result = {} } = {}] = await chrome.scripting.executeScript({
      target: { tabId },
      func: scrapeLinkedInResults
    });

    const leadsFromPage = Array.isArray(result?.leads) ? result.leads : [];
    if (!leadsFromPage.length) {
      setStatus('No results found on the page.', 'warning');
      return;
    }

    const leads = await saveLeads(leadsFromPage);
    setStatus(`Stored ${leads.length} lead(s).`, 'success');
    renderLeads(leads);
  } catch (error) {
    console.error(error);
    setStatus(`Scan failed: ${error.message}`, 'error');
  }
}

async function handleViewLeads() {
  const leads = await getLeads();
  renderLeads(leads);
  setStatus(`Loaded ${leads.length} lead(s).`);
}

async function handleExportCsv() {
  const leads = await getLeads();
  if (!leads.length) {
    setStatus('No leads to export.', 'warning');
    return;
  }

  const content = toCsv(leads);
  await triggerDownload({
    filename: 'linkedin-leads.csv',
    mimeType: 'text/csv',
    content
  });
  setStatus('CSV export triggered.', 'success');
}

async function handleExportJson() {
  const leads = await getLeads();
  if (!leads.length) {
    setStatus('No leads to export.', 'warning');
    return;
  }

  const content = toJson(leads);
  await triggerDownload({
    filename: 'linkedin-leads.json',
    mimeType: 'application/json',
    content
  });
  setStatus('JSON export triggered.', 'success');
}

async function handleClearLeads() {
  await clearLeads();
  renderLeads([]);
  setStatus('Cleared stored leads.', 'success');
}

async function handleSaveApiKey() {
  const apiKey = apiKeyInput.value.trim();
  await setApiKey(apiKey);
  setStatus(apiKey ? 'API key saved.' : 'API key cleared.', 'success');
}

async function handleEvaluate() {
  const leads = await getLeads();
  if (!leads.length) {
    setStatus('No leads available for evaluation.', 'warning');
    return;
  }

  const apiKey = (await getApiKey()).trim();
  if (!apiKey) {
    setStatus('Add your OpenAI API key first.', 'warning');
    apiKeyInput.focus();
    return;
  }

  evaluateBtn.disabled = true;
  evaluateBtn.classList.add('evaluating');
  setStatus('Evaluating leads with OpenAI...');

  try {
    const evaluated = await evaluateLeads({
      leads,
      apiKey,
      onProgress: ({ lead, index, total }) => {
        const count = typeof index === 'number' && typeof total === 'number' ? `${index + 1}/${total}` : '';
        const label = lead.name || lead.profileUrl || 'lead';
        setStatus(`Scored ${label}${count ? ` (${count})` : ''}`);
      }
    });

    await saveLeads(evaluated);
    renderLeads(evaluated);
    setStatus('Evaluation complete.', 'success');
  } catch (error) {
    console.error(error);
    setStatus(`Evaluation failed: ${error.message}`, 'error');
  } finally {
    evaluateBtn.disabled = false;
    evaluateBtn.classList.remove('evaluating');
  }
}

async function handleGenerateAiQuery() {
  const apiKey = (await getApiKey()).trim();
  if (!apiKey) {
    setStatus('Add your OpenAI API key first.', 'warning');
    apiKeyInput.focus();
    return;
  }

  const suggestion = await getLastAiQuery();
  const defaultPrompt = suggestion?.icpDescription ?? '';
  const icpDescription = window.prompt('Describe who you want to find on LinkedIn:', defaultPrompt ?? '');
  if (icpDescription === null) {
    setStatus('AI query cancelled.');
    return;
  }

  const trimmedDescription = icpDescription.trim();
  if (!trimmedDescription) {
    setStatus('Provide a brief description so AI can help.', 'warning');
    return;
  }

  generateAiQueryBtn.disabled = true;
  setStatus('Generating LinkedIn query with AI...');

  try {
    const { query, summary } = await generateAiSearchQuery({ apiKey, icpDescription: trimmedDescription });
    const reviewed = window.prompt('Review the AI query before inserting into LinkedIn:', query);
    if (reviewed === null) {
      setStatus('AI query insertion cancelled.');
      return;
    }

    const finalQuery = reviewed.trim();
    if (!finalQuery) {
      setStatus('AI query was cleared. Nothing inserted.', 'warning');
      return;
    }

    const tabId = await getActiveTabId();
    await injectQueryIntoLinkedIn({ tabId, query: finalQuery });
    await setLastAiQuery({
      icpDescription: trimmedDescription,
      query: finalQuery,
      summary,
      generatedAt: new Date().toISOString()
    });

    setStatus('AI query inserted. Press enter in LinkedIn to search.', 'success');
  } catch (error) {
    console.error(error);
    setStatus(`AI query failed: ${error.message}`, 'error');
  } finally {
    generateAiQueryBtn.disabled = false;
  }
}

async function initialise() {
  const apiKey = await getApiKey();
  apiKeyInput.value = apiKey;
  const leads = await getLeads();
  renderLeads(leads);
}

scanBtn.addEventListener('click', handleScan);
viewBtn.addEventListener('click', handleViewLeads);
evaluateBtn.addEventListener('click', handleEvaluate);
exportCsvBtn.addEventListener('click', handleExportCsv);
exportJsonBtn.addEventListener('click', handleExportJson);
saveApiKeyBtn.addEventListener('click', handleSaveApiKey);
clearLeadsBtn.addEventListener('click', handleClearLeads);
generateAiQueryBtn.addEventListener('click', handleGenerateAiQuery);

document.addEventListener('DOMContentLoaded', initialise);
