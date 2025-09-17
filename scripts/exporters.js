const HEADERS = ['name', 'headline', 'company', 'location', 'profileUrl', 'aiScore', 'aiReasons'];

export function toCsv(leads) {
  const safeLeads = Array.isArray(leads) ? leads : [];
  const headerRow = HEADERS.join(',');
  const rows = safeLeads.map((lead) =>
    HEADERS.map((key) => {
      const value = lead?.[key] ?? '';
      const escaped = String(value).replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(',')
  );
  return [headerRow, ...rows].join('\n');
}

export function toJson(leads) {
  const safeLeads = Array.isArray(leads) ? leads : [];
  return JSON.stringify(safeLeads, null, 2);
}

export async function triggerDownload({ filename, mimeType, content }) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  await chrome.downloads.download({
    url,
    filename,
    saveAs: true
  });

  // Release the object URL after a short delay to allow Chrome to resolve it.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
