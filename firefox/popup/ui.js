/**
 * UI manipulation and rendering utilities
 */

const statusEl = document.getElementById('status');
const leadsTableBody = document.querySelector('#leads-table tbody');

export function setStatus(message, type = 'info') {
  statusEl.textContent = message;
  statusEl.dataset.type = type;
}

export function renderLeads(leads) {
  leadsTableBody.innerHTML = '';
  if (!Array.isArray(leads) || leads.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 7;
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

