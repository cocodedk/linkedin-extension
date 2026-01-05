/**
 * Tests for chrome/popup/handlers/scan-handlers.js
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  handleScan,
  handleScanNext,
  handleViewLeads,
  handleClearLeads
} from '../../chrome/popup/handlers/scan-handlers.js';
import { mockTabs, mockScripting, storageData } from '../setup/chrome-mocks.js';
import { createMockLead } from '../setup/test-utils.js';

// Mock UI functions
const mockSetStatus = vi.fn();
const mockRenderLeads = vi.fn();

vi.mock('../../chrome/popup/ui.js', () => ({
  setStatus: (...args) => mockSetStatus(...args),
  renderLeads: (...args) => mockRenderLeads(...args)
}));

// Mock chrome-utils
const mockScrapeActiveTab = vi.fn();
const mockClickNextButton = vi.fn();

vi.mock('../../chrome/popup/chrome-utils.js', () => ({
  scrapeActiveTab: (...args) => mockScrapeActiveTab(...args),
  clickNextButton: (...args) => mockClickNextButton(...args)
}));

describe('scan-handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageData.clear();
    mockTabs.query.mockResolvedValue([
      {
        id: 1,
        url: 'https://www.linkedin.com/search/results/people/',
        active: true,
        currentWindow: true
      }
    ]);
  });

  describe('handleScan', () => {
    it('should scan and save leads successfully', async () => {
      const mockLeads = [
        createMockLead(),
        createMockLead({ name: 'Jane Doe', profileUrl: 'https://www.linkedin.com/in/janedoe' })
      ];
      mockScrapeActiveTab.mockResolvedValue({ leads: mockLeads });

      await handleScan();

      expect(mockSetStatus).toHaveBeenCalledWith('Scanning current page...');
      expect(mockScrapeActiveTab).toHaveBeenCalled();
      expect(mockRenderLeads).toHaveBeenCalled();
      expect(mockSetStatus).toHaveBeenCalledWith(
        expect.stringContaining('Captured 2 lead(s)'),
        'success'
      );
    });

    it('should show warning when not on LinkedIn search page', async () => {
      mockTabs.query.mockResolvedValue([
        {
          id: 1,
          url: 'https://www.google.com',
          active: true,
          currentWindow: true
        }
      ]);

      await handleScan();

      expect(mockSetStatus).toHaveBeenCalledWith(
        'Please navigate to LinkedIn search results first.',
        'warning'
      );
      expect(mockScrapeActiveTab).not.toHaveBeenCalled();
    });

    it('should show warning when no leads found', async () => {
      mockScrapeActiveTab.mockResolvedValue({ leads: [] });

      await handleScan();

      expect(mockSetStatus).toHaveBeenCalledWith('No leads found on this page.', 'warning');
      expect(mockRenderLeads).not.toHaveBeenCalled();
    });

    it('should handle scan errors', async () => {
      const error = new Error('Scan failed');
      mockScrapeActiveTab.mockRejectedValue(error);

      await handleScan();

      expect(mockSetStatus).toHaveBeenCalledWith('Scan failed: Scan failed', 'error');
    });

    it('should handle null scan result', async () => {
      mockScrapeActiveTab.mockResolvedValue(null);

      await handleScan();

      expect(mockSetStatus).toHaveBeenCalledWith('No leads found on this page.', 'warning');
    });
  });

  describe('handleScanNext', () => {
    it('should click next and scan', async () => {
      const mockLeads = [createMockLead()];
      mockClickNextButton.mockResolvedValue();
      mockScrapeActiveTab.mockResolvedValue({ leads: mockLeads });

      await handleScanNext();

      expect(mockSetStatus).toHaveBeenCalledWith('Clicking Next button...');
      expect(mockClickNextButton).toHaveBeenCalled();
      expect(mockSetStatus).toHaveBeenCalledWith('Waiting for page to load...');
      expect(mockScrapeActiveTab).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const error = new Error('Click failed');
      mockClickNextButton.mockRejectedValue(error);

      await handleScanNext();

      expect(mockSetStatus).toHaveBeenCalledWith('Scan Next failed: Click failed', 'error');
    });
  });

  describe('handleViewLeads', () => {
    it('should load and render leads', async () => {
      const mockLeads = [
        createMockLead(),
        createMockLead({ name: 'Jane Doe', profileUrl: 'https://www.linkedin.com/in/janedoe' })
      ];
      storageData.set('leads', mockLeads);

      await handleViewLeads();

      expect(mockRenderLeads).toHaveBeenCalledWith(mockLeads);
      expect(mockSetStatus).toHaveBeenCalledWith('Loaded 2 lead(s).');
    });

    it('should handle empty leads', async () => {
      await handleViewLeads();

      expect(mockRenderLeads).toHaveBeenCalledWith([]);
      expect(mockSetStatus).toHaveBeenCalledWith('Loaded 0 lead(s).');
    });
  });

  describe('handleClearLeads', () => {
    it('should clear leads and update UI', async () => {
      storageData.set('leads', [createMockLead()]);

      await handleClearLeads();

      const leads = storageData.get('leads');
      expect(leads).toEqual([]);
      expect(mockRenderLeads).toHaveBeenCalledWith([]);
      expect(mockSetStatus).toHaveBeenCalledWith('Cleared stored leads.', 'success');
    });
  });
});
