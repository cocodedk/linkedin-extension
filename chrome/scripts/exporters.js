import { setupDownloadCleanup, cleanupDownloadResources } from './exporters/download-cleanup.js';

const HEADERS = [
  'name',
  'headline',
  'company',
  'contact',
  'location',
  'profileUrl',
  'aiScore',
  'aiReasons',
  'aiFitSummary',
  'virkCvrNumber',
  'virkAddress',
  'virkPostalCode',
  'virkCity',
  'virkStartDate',
  'virkCompanyForm',
  'virkStatus',
  'virkEnriched',
  'virkEnrichmentDate'
];

export function toCsv(leads) {
  // Validate input
  if (!Array.isArray(leads)) {
    throw new Error('Leads must be an array');
  }

  const headerRow = HEADERS.join(',');
  const rows = leads.map((lead) => {
    // Handle null/undefined leads gracefully
    if (!lead || typeof lead !== 'object') {
      return HEADERS.map(() => '""').join(',');
    }
    return HEADERS.map((key) => {
      const value = lead?.[key] ?? '';
      // Safely convert to string, handling circular references
      let stringValue = '';
      try {
        stringValue = String(value);
      } catch (e) {
        stringValue = '[Unable to convert]';
      }
      const escaped = stringValue.replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(',');
  });
  return [headerRow, ...rows].join('\n');
}

export function toJson(leads) {
  // Validate input - return empty array for invalid inputs
  if (!Array.isArray(leads)) {
    return '[]';
  }
  return JSON.stringify(leads, null, 2);
}

export async function triggerDownload({ filename, mimeType, content }) {
  let url = null;
  let listener = null;
  let timeoutId = null;
  try {
    // Validate inputs
    if (!content || !filename) {
      throw new Error('Missing required parameters');
    }

    // Check if downloads API is available
    if (!chrome?.downloads?.download) {
      throw new Error('Downloads API not available');
    }

    const blob = new Blob([content], { type: mimeType });
    url = URL.createObjectURL(blob);

    const downloadId = await chrome.downloads.download({
      url,
      filename,
      saveAs: true
    });

    // Event-driven cleanup: listen for download state changes
    const cleanup = setupDownloadCleanup(downloadId, url);
    listener = cleanup.listener;
    timeoutId = cleanup.timeoutId;
  } catch (error) {
    // Cleanup on error
    cleanupDownloadResources(listener, timeoutId, url);
    throw error;
  }
}
