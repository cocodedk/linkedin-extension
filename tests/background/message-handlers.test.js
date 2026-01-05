/**
 * Tests for chrome/background/message-handlers.js
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  handleDeepScanRequest,
  handleVirkEnrichmentRequest,
  handleStopDeepScanAllRequest,
  handleGetDeepScanAllStatus
} from '../../chrome/background/message-handlers.js';

vi.mock('../../chrome/background/connect-automation-worker.js', () => ({}));
import { mockNotifications, storageData } from '../setup/chrome-mocks.js';
import { createMockLead } from '../setup/test-utils.js';

const mockRunDeepScanInBackground = vi.fn();
const mockRunVirkEnrichmentInBackground = vi.fn();
const mockStopDeepScanAll = vi.fn();
const mockGetDeepScanAllStatus = vi.fn();
const mockSaveLeads = vi.fn();

vi.mock('../../chrome/scripts/storage.js', () => ({
  saveLeads: (...args) => mockSaveLeads(...args)
}));

vi.mock('../../chrome/background/deep-scan-worker.js', () => ({
  runDeepScanInBackground: (...args) => mockRunDeepScanInBackground(...args)
}));

vi.mock('../../chrome/background/virk-enrichment-worker.js', () => ({
  runVirkEnrichmentInBackground: (...args) => mockRunVirkEnrichmentInBackground(...args)
}));

vi.mock('../../chrome/background/deep-scan-all-worker.js', () => ({
  stopDeepScanAll: (...args) => mockStopDeepScanAll(...args),
  getDeepScanAllStatus: (...args) => mockGetDeepScanAllStatus(...args)
}));

describe('message-handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageData.clear();
  });

  describe('handleDeepScanRequest', () => {
    it('should handle successful deep scan', async () => {
      const leads = [createMockLead(), createMockLead({ name: 'Jane Doe' })];
      mockRunDeepScanInBackground.mockResolvedValue(leads);
      mockSaveLeads.mockResolvedValue(leads);

      const result = await handleDeepScanRequest(1);

      expect(mockRunDeepScanInBackground).toHaveBeenCalledWith(1);
      expect(mockSaveLeads).toHaveBeenCalledWith(leads);
      expect(result).toEqual(leads);
      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Deep Scan Complete',
          message: expect.stringContaining('Successfully extracted')
        })
      );
    });

    it('should handle deep scan errors', async () => {
      const error = new Error('Scan failed');
      mockRunDeepScanInBackground.mockRejectedValue(error);

      await expect(handleDeepScanRequest(1)).rejects.toThrow('Scan failed');

      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Deep Scan Failed',
          message: 'Scan failed'
        })
      );
    });
  });

  describe('handleVirkEnrichmentRequest', () => {
    it('should handle successful Virk enrichment', async () => {
      const result = { enriched: 5, total: 10 };
      mockRunVirkEnrichmentInBackground.mockResolvedValue(result);

      const response = await handleVirkEnrichmentRequest();

      expect(mockRunVirkEnrichmentInBackground).toHaveBeenCalled();
      expect(response).toEqual(result);
      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Virk Enrichment Complete',
          message: expect.stringContaining('✅ Enriched')
        })
      );
    });

    it('should handle Virk enrichment errors', async () => {
      const error = new Error('Enrichment failed');
      mockRunVirkEnrichmentInBackground.mockRejectedValue(error);

      await expect(handleVirkEnrichmentRequest()).rejects.toThrow('Enrichment failed');

      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Virk Enrichment Failed',
          message: 'Enrichment failed'
        })
      );
    });
  });

  describe('handleStopDeepScanAllRequest', () => {
    it('should stop deep scan all', async () => {
      const result = { totalLeads: 10 };
      mockStopDeepScanAll.mockResolvedValue(result);

      const response = await handleStopDeepScanAllRequest();

      expect(mockStopDeepScanAll).toHaveBeenCalled();
      expect(response).toEqual(result);
    });
  });

  describe('handleGetDeepScanAllStatus', () => {
    it('should get deep scan all status', async () => {
      const status = { isRunning: true, currentPage: 5 };
      mockGetDeepScanAllStatus.mockResolvedValue(status);

      const response = await handleGetDeepScanAllStatus();

      expect(mockGetDeepScanAllStatus).toHaveBeenCalled();
      expect(response).toEqual(status);
    });
  });
});
