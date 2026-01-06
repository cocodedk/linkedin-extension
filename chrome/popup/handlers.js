/**
 * Event handlers - main export file
 */

export { handleGoToNextPage, handleViewLeads, handleClearLeads } from './handlers/scan-handlers.js';
export {
  handleExportCsv,
  handleExportJson,
  handleCopyCsv,
  handleCopyJson,
  handleOpenCsvInTab,
  handleOpenJsonInTab,
  handleSaveCsvWithFS,
  handleSaveJsonWithFS
} from './handlers/export-handlers.js';
export { handleSaveApiKey } from './handlers/settings-handlers.js';
export { handleEvaluate } from './handlers/evaluate-handler.js';
export { handleGenerateAiQuery } from './handlers/ai-query-handler.js';
export { handleDeepScanAll, handleStopDeepScanAll } from './handlers/scan-deep-all-handler.js';
export {
  handleConnectAutomation,
  handleConnectAutomationAll,
  handleStopConnectAutomation
} from './handlers/connect-automation-handler.js';
export { handleDeepScan } from './handlers/scan-deep-handler.js';
