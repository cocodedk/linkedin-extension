/**
 * Tests for chrome/popup/handlers/virk-handler.js
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleEnrichWithVirk } from '../../chrome/popup/handlers/virk-handler.js';
import { storageData, mockRuntime } from '../setup/chrome-mocks.js';
import { createMockLead } from '../setup/test-utils.js';

const mockSetStatus = vi.fn();

vi.mock('../../chrome/popup/ui.js', () => ({
  setStatus: (...args) => mockSetStatus(...args)
}));

describe('virk-handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageData.clear();
    mockRuntime.sendMessage.mockImplementation((message, callback) => {
      if (callback) {
        callback({ success: true, result: { enriched: 2, total: 2 } });
      }
      return Promise.resolve({ success: true, result: { enriched: 2, total: 2 } });
    });
  });

  it('should trigger Virk enrichment', async () => {
    const leads = [
      createMockLead({ company: 'Acme Corp' }),
      createMockLead({ name: 'Jane Doe', company: 'Tech Inc' })
    ];
    storageData.set('leads', leads);

    await handleEnrichWithVirk();

    expect(mockSetStatus).toHaveBeenCalledWith('Starting Virk enrichment in background...');
    expect(mockRuntime.sendMessage).toHaveBeenCalledWith(
      { type: 'START_VIRK_ENRICHMENT' },
      expect.any(Function)
    );
  });

  it('should show warning when no leads', async () => {
    await handleEnrichWithVirk();

    expect(mockSetStatus).toHaveBeenCalledWith(
      'No leads to enrich. Scan LinkedIn first.',
      'warning'
    );
    expect(mockRuntime.sendMessage).not.toHaveBeenCalled();
  });

  it('should show warning when no leads with company names', async () => {
    const leads = [createMockLead({ company: null }), createMockLead({ company: '' })];
    storageData.set('leads', leads);

    await handleEnrichWithVirk();

    expect(mockSetStatus).toHaveBeenCalledWith('No leads with company names found.', 'warning');
    expect(mockRuntime.sendMessage).not.toHaveBeenCalled();
  });

  it('should filter leads with company names', async () => {
    const leads = [
      createMockLead({ company: 'Acme Corp' }),
      createMockLead({ company: null }),
      createMockLead({ company: 'Tech Inc' })
    ];
    storageData.set('leads', leads);

    await handleEnrichWithVirk();

    expect(mockRuntime.sendMessage).toHaveBeenCalled();
  });

  it('should handle successful enrichment response', async () => {
    const leads = [createMockLead({ company: 'Acme Corp' })];
    storageData.set('leads', leads);

    mockRuntime.sendMessage.mockImplementation((message, callback) => {
      if (callback) {
        callback({ success: true, result: { enriched: 1, total: 1 } });
      }
      return Promise.resolve({ success: true, result: { enriched: 1, total: 1 } });
    });

    await handleEnrichWithVirk();

    const calls = mockSetStatus.mock.calls;
    const successCall = calls.find((call) => call[0]?.includes('✅ Enrichment complete!'));
    expect(successCall).toBeTruthy();
  });

  it('should handle enrichment failure', async () => {
    const leads = [createMockLead({ company: 'Acme Corp' })];
    storageData.set('leads', leads);

    mockRuntime.sendMessage.mockImplementation((message, callback) => {
      if (callback) {
        callback({ success: false, error: 'Enrichment failed' });
      }
      return Promise.resolve({ success: false, error: 'Enrichment failed' });
    });

    await handleEnrichWithVirk();

    expect(mockSetStatus).toHaveBeenCalledWith(
      expect.stringContaining('❌ Enrichment failed'),
      'error'
    );
  });

  it('should handle sendMessage error', async () => {
    const leads = [createMockLead({ company: 'Acme Corp' })];
    storageData.set('leads', leads);

    mockRuntime.sendMessage.mockImplementation(() => {
      throw new Error('Message failed');
    });

    await handleEnrichWithVirk();

    expect(mockSetStatus).toHaveBeenCalledWith(
      'Failed to start enrichment: Message failed',
      'error'
    );
  });

  it('should show background status message', async () => {
    const leads = [createMockLead({ company: 'Acme Corp' })];
    storageData.set('leads', leads);

    await handleEnrichWithVirk();

    expect(mockSetStatus).toHaveBeenCalledWith(
      'Virk enrichment running in background... (check console for progress)'
    );
  });
});
