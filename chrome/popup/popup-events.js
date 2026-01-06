/**
 * Event listeners setup for popup
 */

import { runtime } from '../api/runtime.js';
import { tabs as tabsApi } from '../api/tabs.js';
import {
  handleGoToNextPage,
  handleViewLeads,
  handleExportCsv,
  handleExportJson,
  handleCopyCsv,
  handleCopyJson,
  handleOpenCsvInTab,
  handleOpenJsonInTab,
  handleSaveCsvWithFS,
  handleSaveJsonWithFS,
  handleClearLeads,
  handleEvaluate,
  handleGenerateAiQuery,
  handleDeepScan,
  handleDeepScanAll,
  handleStopDeepScanAll,
  handleConnectAutomation,
  handleConnectAutomationAll,
  handleStopConnectAutomation
} from './handlers.js';
import { handleEnrichWithVirk } from './handlers/virk-handler.js';
import * as dom from './popup-dom.js';

export function setupEventListeners() {
  // Scan and automation buttons
  dom.deepScanBtn?.addEventListener('click', handleDeepScan);
  dom.goToNextPageBtn?.addEventListener('click', handleGoToNextPage);
  dom.deepScanAllBtn.addEventListener('click', handleDeepScanAll);
  dom.stopDeepScanAllBtn.addEventListener('click', handleStopDeepScanAll);

  // External service buttons
  dom.openVirkBtn.addEventListener('click', async () => {
    tabsApi.create({ url: 'https://datacvr.virk.dk/' });
  });

  // Connection automation buttons
  dom.autoConnectBtn?.addEventListener('click', () =>
    handleConnectAutomation(dom.autoConnectBtn, dom.autoConnectStopBtn)
  );
  dom.autoConnectAllBtn?.addEventListener('click', () =>
    handleConnectAutomationAll(dom.autoConnectAllBtn, dom.autoConnectStopBtn)
  );
  dom.autoConnectStopBtn?.addEventListener('click', () =>
    handleStopConnectAutomation(dom.autoConnectStopBtn)
  );

  // View and lead management buttons
  dom.viewBtn.addEventListener('click', handleViewLeads);
  dom.evaluateBtn.addEventListener('click', () => handleEvaluate(dom.evaluateBtn));
  dom.enrichVirkBtn.addEventListener('click', handleEnrichWithVirk);

  // Export buttons
  dom.exportCsvBtn.addEventListener('click', handleExportCsv);
  dom.exportJsonBtn.addEventListener('click', handleExportJson);
  dom.copyCsvBtn.addEventListener('click', handleCopyCsv);
  dom.copyJsonBtn.addEventListener('click', handleCopyJson);
  dom.openCsvTabBtn.addEventListener('click', handleOpenCsvInTab);
  dom.openJsonTabBtn.addEventListener('click', handleOpenJsonInTab);
  dom.saveCsvFsBtn.addEventListener('click', handleSaveCsvWithFS);
  dom.saveJsonFsBtn.addEventListener('click', handleSaveJsonWithFS);
  dom.clearLeadsBtn.addEventListener('click', handleClearLeads);
  dom.generateAiQueryBtn.addEventListener('click', () =>
    handleGenerateAiQuery(dom.generateAiQueryBtn)
  );

  // Navigation buttons
  dom.openTabBtn.addEventListener('click', async () => {
    const leadsUrl = runtime.getURL('leads.html');
    const tabList = await tabsApi.query({ url: leadsUrl });

    if (tabList.length > 0) {
      // Tab exists, focus it and reload
      await tabsApi.update(tabList[0].id, { active: true });
      await tabsApi.reload(tabList[0].id);
    } else {
      // No tab exists, create new one
      await tabsApi.create({ url: leadsUrl });
    }
  });

  dom.openSettingsBtn?.addEventListener('click', async () => {
    try {
      const settingsUrl = runtime.getURL('settings.html');
      await tabsApi.create({ url: settingsUrl });
      window.close();
    } catch (error) {
      console.error('Failed to open settings page:', error);
    }
  });
}
