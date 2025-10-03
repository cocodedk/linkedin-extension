/**
 * Event handlers for popup actions
 */

import {
  getLeads,
  saveLeads,
  clearLeads,
  getApiKey,
  setApiKey,
  setLastAiQuery,
  getLastAiQuery
} from '../scripts/storage.js';
import { toCsv, toJson, triggerDownload } from '../scripts/exporters.js';
import { evaluateLeads } from '../scripts/evaluation.js';
import { generateAiSearchQuery } from '../scripts/ai-query.js';
import { setStatus, renderLeads } from './ui.js';
import { getActiveTabId, injectQueryIntoLinkedIn, scrapeActiveTab } from './browser-utils.js';

export async function handleScan() {
  setStatus('Scanning results...');
  try {
    const result = await scrapeActiveTab();
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

export async function handleViewLeads() {
  const leads = await getLeads();
  renderLeads(leads);
  setStatus(`Loaded ${leads.length} lead(s).`);
}

export async function handleExportCsv() {
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

export async function handleExportJson() {
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

export async function handleClearLeads() {
  await clearLeads();
  renderLeads([]);
  setStatus('Cleared stored leads.', 'success');
}

export async function handleSaveApiKey(apiKeyInput) {
  const apiKey = apiKeyInput.value.trim();
  await setApiKey(apiKey);
  setStatus(apiKey ? 'API key saved.' : 'API key cleared.', 'success');
}

export async function handleEvaluate(evaluateBtn, apiKeyInput) {
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

export async function handleGenerateAiQuery(generateAiQueryBtn, apiKeyInput) {
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
