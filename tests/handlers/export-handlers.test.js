/**
 * Tests for chrome/popup/handlers/export-handlers.js
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleExportCsv, handleExportJson } from '../../chrome/popup/handlers/export-handlers.js';
import { mockDownloads, storageData } from '../setup/chrome-mocks.js';
import { createMockLead } from '../setup/test-utils.js';

const mockSetStatus = vi.fn();

vi.mock('../../chrome/popup/ui.js', () => ({
  setStatus: (...args) => mockSetStatus(...args)
}));

describe('export-handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageData.clear();
  });

  describe('handleExportCsv', () => {
    it('should export leads as CSV', async () => {
      const leads = [createMockLead(), createMockLead({ name: 'Jane Doe' })];
      storageData.set('leads', leads);

      await handleExportCsv();

      expect(mockSetStatus).toHaveBeenCalledWith('CSV export triggered.', 'success');
      expect(mockDownloads.download).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: 'linkedin-leads.csv',
          saveAs: true
        })
      );
    });

    it('should show warning when no leads', async () => {
      await handleExportCsv();

      expect(mockSetStatus).toHaveBeenCalledWith('No leads to export.', 'warning');
      expect(mockDownloads.download).not.toHaveBeenCalled();
    });

    it('should include CSV content in download', async () => {
      const leads = [createMockLead({ name: 'John Doe', company: 'Acme' })];
      storageData.set('leads', leads);

      await handleExportCsv();

      expect(mockDownloads.download).toHaveBeenCalled();
      const callArgs = mockDownloads.download.mock.calls[0][0];
      expect(callArgs.url).toBeTruthy();
    });
  });

  describe('handleExportJson', () => {
    it('should export leads as JSON', async () => {
      const leads = [createMockLead(), createMockLead({ name: 'Jane Doe' })];
      storageData.set('leads', leads);

      await handleExportJson();

      expect(mockSetStatus).toHaveBeenCalledWith('JSON export triggered.', 'success');
      expect(mockDownloads.download).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: 'linkedin-leads.json',
          saveAs: true
        })
      );
    });

    it('should show warning when no leads', async () => {
      await handleExportJson();

      expect(mockSetStatus).toHaveBeenCalledWith('No leads to export.', 'warning');
      expect(mockDownloads.download).not.toHaveBeenCalled();
    });

    it('should include JSON content in download', async () => {
      const leads = [createMockLead({ name: 'John Doe' })];
      storageData.set('leads', leads);

      await handleExportJson();

      expect(mockDownloads.download).toHaveBeenCalled();
      const callArgs = mockDownloads.download.mock.calls[0][0];
      expect(callArgs.url).toBeTruthy();
    });
  });
});
