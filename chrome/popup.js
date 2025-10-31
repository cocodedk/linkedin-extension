/**
 * Main popup controller - orchestrates UI and event handling
 */

import { getLeads } from './scripts/storage.js';
import { renderLeads as renderLeadsUi, setStatus } from './popup/ui.js';
import { updateButtonVisibility } from './popup/ui/button-visibility.js';
import {
  handleScan,
  handleScanNext,
  handleViewLeads,
  handleExportCsv,
  handleExportJson,
  handleClearLeads,
  handleEvaluate,
  handleGenerateAiQuery,
  handleDeepScan,
  handleDeepScanAll,
  handleStopDeepScanAll,
  handleConnectAutomation,
  handleConnectAutomationAll,
  handleStopConnectAutomation
} from './popup/handlers.js';
import { handleEnrichWithVirk } from './popup/handlers/virk-handler.js';
import { describeConnectFailure } from './scripts/connect/connect-automation-utils.js';

// DOM elements
const scanBtn = document.getElementById('scan-btn');
const scanNextBtn = document.getElementById('scan-next-btn');
const deepScanBtn = document.getElementById('deep-scan-btn');
const deepScanAllBtn = document.getElementById('deep-scan-all-btn');
const stopDeepScanAllBtn = document.getElementById('stop-deep-scan-all-btn');
const openVirkBtn = document.getElementById('open-virk-btn');
const autoConnectBtn = document.getElementById('auto-connect-btn');
const autoConnectAllBtn = document.getElementById('auto-connect-all-btn');
const autoConnectStopBtn = document.getElementById('auto-connect-stop-btn');
const viewBtn = document.getElementById('view-btn');
const evaluateBtn = document.getElementById('evaluate-btn');
const enrichVirkBtn = document.getElementById('enrich-virk-btn');
const exportCsvBtn = document.getElementById('export-csv-btn');
const exportJsonBtn = document.getElementById('export-json-btn');
const clearLeadsBtn = document.getElementById('clear-leads-btn');
const generateAiQueryBtn = document.getElementById('generate-ai-query-btn');
const openTabBtn = document.getElementById('open-tab-btn');
const openSettingsBtn = document.getElementById('open-settings-btn');

// Event listeners
scanBtn.addEventListener('click', handleScan);
scanNextBtn.addEventListener('click', handleScanNext);
deepScanBtn?.addEventListener('click', handleDeepScan);
deepScanAllBtn.addEventListener('click', handleDeepScanAll);
stopDeepScanAllBtn.addEventListener('click', handleStopDeepScanAll);
openVirkBtn.addEventListener('click', async () => {
  const { tabs } = await import('./api/tabs.js');
  tabs.create({ url: 'https://datacvr.virk.dk/' });
});
autoConnectBtn?.addEventListener('click', () => handleConnectAutomation(autoConnectBtn, autoConnectStopBtn));
autoConnectAllBtn?.addEventListener('click', () => handleConnectAutomationAll(autoConnectAllBtn, autoConnectStopBtn));
autoConnectStopBtn?.addEventListener('click', () => handleStopConnectAutomation(autoConnectStopBtn));
viewBtn.addEventListener('click', handleViewLeads);
evaluateBtn.addEventListener('click', () => handleEvaluate(evaluateBtn));
enrichVirkBtn.addEventListener('click', handleEnrichWithVirk);
exportCsvBtn.addEventListener('click', handleExportCsv);
exportJsonBtn.addEventListener('click', handleExportJson);
clearLeadsBtn.addEventListener('click', handleClearLeads);
generateAiQueryBtn.addEventListener('click', () => handleGenerateAiQuery(generateAiQueryBtn));
openTabBtn.addEventListener('click', async () => {
  const { runtime } = await import('./api/runtime.js');
  const { tabs } = await import('./api/tabs.js');
  const leadsUrl = runtime.getURL('leads.html');
  const tabList = await tabs.query({ url: leadsUrl });

  if (tabList.length > 0) {
    // Tab exists, focus it and reload
    await tabs.update(tabList[0].id, { active: true });
    await tabs.reload(tabList[0].id);
  } else {
    // No tab exists, create new one
    await tabs.create({ url: leadsUrl });
  }
});

openSettingsBtn?.addEventListener('click', async () => {
  try {
    const [{ runtime }, { tabs }] = await Promise.all([
      import('./api/runtime.js'),
      import('./api/tabs.js')
    ]);
    const settingsUrl = runtime.getURL('settings.html');
    await tabs.create({ url: settingsUrl });
    window.close();
  } catch (error) {
    console.error('Failed to open settings page:', error);
  }
});

// Initialize
let cachedLeads = [];

function renderLeads(leads) {
  cachedLeads = Array.isArray(leads) ? leads : [];
  renderLeadsUi(cachedLeads);
}

async function initialise() {
  const leads = await getLeads();
  console.log(`Popup: Loaded ${leads.length} leads from storage`);
  const enrichedCount = leads.filter(l => l.virkEnriched).length;
  console.log(`Popup: ${enrichedCount} leads have Virk enrichment`);
  renderLeads(leads);
  await updateButtonVisibility(leads);
}

document.addEventListener('DOMContentLoaded', initialise);

chrome.runtime.onMessage.addListener((message) => {
  switch (message?.type) {
    case 'AUTO_CONNECT_STARTED': {
      const total = message.total ?? 0;
      setStatus(`Auto Connect All started for ${total} lead(s).`, 'info');
      updateButtonVisibility(cachedLeads).catch((error) => {
        console.warn('Failed to update button visibility:', error);
      });
      break;
    }
    case 'AUTO_CONNECT_PROGRESS': {
      const { lead = {}, index = 0, total = 0, result = {}, message: progressMessage } = message;
      const name = lead.name || lead.profileUrl || `Lead ${index}`;
      const success = Boolean(result.success);
      const reason = success ? '' : progressMessage || describeConnectFailure(result);
      const label = success ? 'success' : (result.reason === 'aborted' ? 'warning' : 'error');
      const suffix = reason ? ` ${reason}` : '';
      setStatus(`Auto connect ${success ? 'sent' : 'failed'} for ${name} (${index}/${total}).${suffix}`, label);
      break;
    }
    case 'AUTO_CONNECT_COMPLETE': {
      const summary = message.summary || {};
      const { total = 0, successes = 0, failures = 0, cancelled = false } = summary;
      const label = cancelled ? 'warning' : failures ? 'warning' : 'success';
      const extra = cancelled ? ' (cancelled)' : '';
      setStatus(`Auto Connect All finished${extra}. Successes: ${successes}/${total}, Failures: ${failures}.`, label);
      updateButtonVisibility(cachedLeads).catch((error) => {
        console.warn('Failed to update button visibility:', error);
      });
      break;
    }
    default:
      break;
  }
});
