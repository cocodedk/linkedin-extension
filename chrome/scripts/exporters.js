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

  const safeLeads = leads;
  const headerRow = HEADERS.join(',');
  const rows = safeLeads.map((lead) => {
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
  const safeLeads = Array.isArray(leads) ? leads : [];
  return JSON.stringify(safeLeads, null, 2);
}

export async function triggerDownload({ filename, mimeType, content }) {
  let url = null;
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

    await chrome.downloads.download({
      url,
      filename,
      saveAs: true
    });

    // Longer delay to ensure download completes before revoking URL
    setTimeout(() => {
      if (url) {
        URL.revokeObjectURL(url);
        url = null;
      }
    }, 5000);
  } catch (error) {
    // Cleanup on error
    if (url) {
      URL.revokeObjectURL(url);
      url = null;
    }
    throw error;
  }
}
