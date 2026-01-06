/**
 * Tests for chrome/popup/handlers/scan-handlers.js
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  handleGoToNextPage,
  handleViewLeads,
  handleClearLeads
} from '../../chrome/popup/handlers/scan-handlers.js';
import { mockTabs, storageData } from '../setup/chrome-mocks.js';
import { createMockLead } from '../setup/test-utils.js';

// Mock UI functions
const mockSetStatus = vi.fn();
const mockRenderLeads = vi.fn();

vi.mock('../../chrome/popup/ui.js', () => ({
  setStatus: (...args) => mockSetStatus(...args),
  renderLeads: (...args) => mockRenderLeads(...args)
}));

// Mock chrome-utils
const mockClickLinkedInNextPageButton = vi.fn();

vi.mock('../../chrome/popup/chrome-utils.js', () => ({
  clickLinkedInNextPageButton: (...args) => mockClickLinkedInNextPageButton(...args)
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

  describe('handleGoToNextPage', () => {
    it('should navigate to next page successfully', async () => {
      mockClickLinkedInNextPageButton.mockResolvedValue();

      await handleGoToNextPage();

      expect(mockSetStatus).toHaveBeenCalledWith('Going to next page...');
      expect(mockClickLinkedInNextPageButton).toHaveBeenCalled();
      expect(mockSetStatus).toHaveBeenCalledWith('Navigated to next page.', 'success');
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

      await handleGoToNextPage();

      expect(mockSetStatus).toHaveBeenCalledWith(
        'Please navigate to LinkedIn search results first.',
        'warning'
      );
      expect(mockClickLinkedInNextPageButton).not.toHaveBeenCalled();
    });

    it('should handle navigation errors', async () => {
      const error = new Error('Navigation failed');
      mockClickLinkedInNextPageButton.mockRejectedValue(error);

      await handleGoToNextPage();

      expect(mockSetStatus).toHaveBeenCalledWith('Go to Next Page failed: Navigation failed', 'error');
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
