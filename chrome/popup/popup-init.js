/**
 * Initialization logic for popup
 */

import { getLeads } from '../scripts/storage.js';
import { renderLeads as renderLeadsUi } from './ui.js';
import { updateButtonVisibility } from './ui/button-visibility.js';
import { describeConnectFailure } from '../scripts/connect/connect-automation-utils.js';
import { setStatus } from './ui.js';
import { initializeSettingsDisplay } from './ui/settings-display.js';

// Global state
let cachedLeads = [];

// Lead rendering function
function renderLeads(leads) {
  cachedLeads = Array.isArray(leads) ? leads : [];
  renderLeadsUi(cachedLeads);
}

// Message listener for background communication
function setupMessageListener() {
  chrome.runtime.onMessage.addListener((message) => {
    switch (message?.type) {
      case 'AUTO_CONNECT_STARTED': {
        const mode = message.mode === 'batch' ? 'batch' : 'single';
        const total = message.total ?? 0;
        const labelText = mode === 'batch'
          ? `Auto Connect All started for ${total} lead(s).`
          : 'Auto Connect started.';
        setStatus(`${labelText} You can close the popup.`, 'info');
        updateButtonVisibility(cachedLeads).catch((error) => {
          console.warn('Failed to update button visibility:', error);
        });
        break;
      }
      case 'AUTO_CONNECT_PROGRESS': {
        const {
          lead = {},
          index = 0,
          total = 0,
          result = {},
          message: progressMessage,
          mode = 'single'
        } = message;
        const name = lead.name || lead.profileUrl || `Lead ${index}`;
        const success = Boolean(result.success);
        const reason = success ? '' : progressMessage || describeConnectFailure(result);
        const label = success ? 'success' : (result.reason === 'aborted' ? 'warning' : 'error');
        const suffix = reason ? ` ${reason}` : '';
        const prefix = mode === 'batch' ? 'Auto Connect All' : 'Auto Connect';
        setStatus(`${prefix} ${success ? 'sent' : 'failed'} for ${name} (${index}/${total}).${suffix}`, label);
        break;
      }
      case 'AUTO_CONNECT_COMPLETE': {
        const summary = message.summary || {};
        const mode = message.mode === 'batch' ? 'batch' : 'single';
        const { total = 0, successes = 0, failures = 0, cancelled = false } = summary;
        const label = cancelled ? 'warning' : failures ? 'warning' : 'success';
        const extra = cancelled ? ' (cancelled)' : '';
        if (mode === 'batch') {
          setStatus(`Auto Connect All finished${extra}. Successes: ${successes}/${total}, Failures: ${failures}.`, label);
        } else {
          const outcome = failures > 0 ? 'Failed to send connection.' : 'Connection request sent!';
          const base = cancelled ? 'Auto Connect cancelled.' : outcome;
          setStatus(base, label);
        }
        updateButtonVisibility(cachedLeads).catch((error) => {
          console.warn('Failed to update button visibility:', error);
        });
        break;
      }
      default:
        break;
    }
  });
}

// Initialize popup
export async function initializePopup() {
  const leads = await getLeads();
  console.log(`Popup: Loaded ${leads.length} leads from storage`);
  const enrichedCount = leads.filter(l => l.virkEnriched).length;
  console.log(`Popup: ${enrichedCount} leads have Virk enrichment`);
  renderLeads(leads);
  await updateButtonVisibility(leads);
  initializeSettingsDisplay();
  setupMessageListener();
}

export { cachedLeads };
