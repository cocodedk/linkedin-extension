/**
 * CSV export functionality
 */

import { HEADERS, MAX_LEADS, CHUNK_SIZE } from './constants.js';

export function toCsv(leads) {
  // Validate input
  if (!Array.isArray(leads)) {
    throw new Error('Leads must be an array');
  }

  console.log(`Starting CSV export for ${leads.length} leads`);

  // Prevent memory issues with extremely large datasets
  if (leads.length > MAX_LEADS) {
    throw new Error(`Too many leads (${leads.length}). Maximum allowed: ${MAX_LEADS}`);
  }

  const headerRow = HEADERS.join(',');

  // Process leads in chunks to avoid memory spikes and spread operator issues
  let csvContent = headerRow + '\n';

  for (let i = 0; i < leads.length; i += CHUNK_SIZE) {
    if (i % 1000 === 0) {
      console.log(`Processing leads ${i} to ${Math.min(i + CHUNK_SIZE, leads.length)}`);
    }
    const chunk = leads.slice(i, i + CHUNK_SIZE);
    const chunkRows = chunk.map((lead) => {
      // Handle null/undefined leads gracefully
      if (!lead || typeof lead !== 'object') {
        return HEADERS.map(() => '""').join(',');
      }
      return HEADERS.map((key) => {
        const value = lead?.[key] ?? '';
        // Safely convert to string, handling circular references and complex objects
        let stringValue = '';
        try {
          if (typeof value === 'object' && value !== null) {
            // Handle arrays and objects specially
            if (Array.isArray(value)) {
              stringValue = value.join('; '); // Join arrays with semicolons
            } else if (value instanceof Date) {
              stringValue = value.toISOString(); // Convert dates to ISO strings
            } else {
              stringValue = JSON.stringify(value); // Fallback for other objects
            }
          } else {
            stringValue = String(value);
          }
        } catch (e) {
          stringValue = '[Unable to convert]';
        }
        const escaped = stringValue.replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',');
    });

    // Append chunk rows without using spread operator
    csvContent += chunkRows.join('\n') + '\n';
  }

  // Remove trailing newline
  return csvContent.replace(/\n$/, '');
}
