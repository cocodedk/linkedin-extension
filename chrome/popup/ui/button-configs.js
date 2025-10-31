/**
 * Button configuration constants
 * Defines consistent icons, labels, and titles for all buttons
 */

export const BUTTON_CONFIGS = {
  scan: {
    id: 'scan-btn',
    icon: '🔍',
    label: 'Scan Results',
    title: 'Scan current LinkedIn page for leads'
  },
  scanNext: {
    id: 'scan-next-btn',
    icon: '⏭️',
    label: 'Scan Next',
    title: 'Navigate to next page and scan'
  },
  deepScan: {
    id: 'deep-scan-btn',
    icon: '🕵️',
    label: 'Deep Scan',
    title: 'Visit each profile to capture detailed company data'
  },
  deepScanAll: {
    id: 'deep-scan-all-btn',
    icon: '🔄',
    label: 'Deep Scan ALL',
    title: 'Deep scan all pages (up to 100) automatically'
  },
  stopDeepScanAll: {
    id: 'stop-deep-scan-all-btn',
    icon: '⏹️',
    label: 'Stop Deep Scan',
    title: 'Stop the deep scan all operation'
  },
  view: {
    id: 'view-btn',
    icon: '👁️',
    label: 'View Leads',
    title: 'Refresh and view stored leads'
  },
  evaluate: {
    id: 'evaluate-btn',
    icon: '⚡',
    label: 'Evaluate with AI',
    title: 'Evaluate leads using OpenAI'
  },
  enrichVirk: {
    id: 'enrich-virk-btn',
    icon: '🇩🇰',
    label: 'Enrich with Virk',
    title: 'Enrich Danish companies with CVR data'
  },
  generateAiQuery: {
    id: 'generate-ai-query-btn',
    icon: '🤖',
    label: 'Generate AI Query',
    title: 'Generate LinkedIn search query with AI'
  },
  openTab: {
    id: 'open-tab-btn',
    icon: '🗂️',
    label: 'Open in Tab',
    title: 'Open leads in full-page tab view'
  },
  exportCsv: {
    id: 'export-csv-btn',
    icon: '📊',
    label: 'Export CSV',
    title: 'Export leads as CSV file'
  },
  exportJson: {
    id: 'export-json-btn',
    icon: '📄',
    label: 'Export JSON',
    title: 'Export leads as JSON file'
  },
  clearLeads: {
    id: 'clear-leads-btn',
    icon: '🗑️',
    label: 'Clear All',
    title: 'Clear all stored leads'
  },
  saveApiKey: {
    id: 'save-api-key-btn',
    icon: '💾',
    label: 'Save Key',
    title: 'Save OpenAI API key'
  }
};
