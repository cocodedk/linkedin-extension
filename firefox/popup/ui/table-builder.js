/**
 * Table row builder
 */

export function createTableRow(lead) {
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

  return row;
}

