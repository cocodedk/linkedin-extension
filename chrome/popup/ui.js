/**
 * UI rendering - main orchestrator
 */

import { setStatus } from './ui/status.js';
import {
  createLeadHeader,
  createLeadHeadline,
  createLeadContact,
  createLeadReasons,
  createLeadSummary
} from './ui/card-builders.js';
import { createTableRow } from './ui/table-builder.js';

export { setStatus };

const leadsTableBody = document.querySelector('#leads-table tbody');
const leadsCards = document.getElementById('leads-cards');

export function renderLeads(leads) {
  leadsTableBody.innerHTML = '';
  leadsCards.innerHTML = '';

  const safe = Array.isArray(leads) ? leads : [];
  if (safe.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No leads stored yet.';
    leadsCards.appendChild(empty);
    return;
  }

  safe.forEach((lead) => {
    // Card layout
    const card = document.createElement('article');
    card.className = 'lead-card';

    const header = createLeadHeader(lead);
    const headline = createLeadHeadline(lead);
    const contact = createLeadContact(lead);
    const reasons = createLeadReasons(lead);
    const summary = createLeadSummary(lead);

    card.append(header, headline, contact, reasons, summary);
    leadsCards.appendChild(card);

    // Also keep table row (hidden by CSS if desired)
    const row = createTableRow(lead);
    leadsTableBody.appendChild(row);
  });
}
