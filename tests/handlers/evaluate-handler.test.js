/**
 * Tests for chrome/popup/handlers/evaluate-handler.js
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleEvaluate } from '../../chrome/popup/handlers/evaluate-handler.js';
import { storageData } from '../setup/chrome-mocks.js';
import { createMockLead } from '../setup/test-utils.js';

const mockSetStatus = vi.fn();
const mockRenderLeads = vi.fn();
const mockEvaluateLeads = vi.fn();

vi.mock('../../chrome/popup/ui.js', () => ({
  setStatus: (...args) => mockSetStatus(...args),
  renderLeads: (...args) => mockRenderLeads(...args)
}));

vi.mock('../../chrome/scripts/evaluation.js', () => ({
  evaluateLeads: (...args) => mockEvaluateLeads(...args)
}));

describe('evaluate-handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageData.clear();
  });

  it('should evaluate leads successfully', async () => {
    const leads = [createMockLead(), createMockLead({ name: 'Jane Doe' })];
    storageData.set('leads', leads);
    storageData.set('openaiApiKey', 'sk-test123');

    const evaluatedLeads = [
      { ...leads[0], aiScore: 85 },
      { ...leads[1], aiScore: 90 }
    ];
    mockEvaluateLeads.mockResolvedValue(evaluatedLeads);

    const evaluateBtn = { disabled: false, classList: { add: vi.fn(), remove: vi.fn() } };
    await handleEvaluate(evaluateBtn);

    expect(evaluateBtn.disabled).toBe(false);
    expect(mockSetStatus).toHaveBeenCalledWith('Evaluation complete.', 'success');
    expect(mockRenderLeads).toHaveBeenCalledWith(evaluatedLeads);
  });

  it('should show warning when no leads', async () => {
    storageData.set('openaiApiKey', 'sk-test123');
    const evaluateBtn = { disabled: false, classList: { add: vi.fn(), remove: vi.fn() } };

    await handleEvaluate(evaluateBtn);

    expect(mockSetStatus).toHaveBeenCalledWith('No leads available for evaluation.', 'warning');
    expect(mockEvaluateLeads).not.toHaveBeenCalled();
  });

  it('should show warning when no API key', async () => {
    const leads = [createMockLead()];
    storageData.set('leads', leads);
    const evaluateBtn = { disabled: false, classList: { add: vi.fn(), remove: vi.fn() } };
    const apiKeyInput = { focus: vi.fn() };

    await handleEvaluate(evaluateBtn, apiKeyInput);

    expect(mockSetStatus).toHaveBeenCalledWith('Add your OpenAI API key first.', 'warning');
    expect(apiKeyInput.focus).toHaveBeenCalled();
    expect(mockEvaluateLeads).not.toHaveBeenCalled();
  });

  it('should handle empty API key', async () => {
    const leads = [createMockLead()];
    storageData.set('leads', leads);
    storageData.set('openaiApiKey', '   ');
    const evaluateBtn = { disabled: false, classList: { add: vi.fn(), remove: vi.fn() } };

    await handleEvaluate(evaluateBtn);

    expect(mockSetStatus).toHaveBeenCalledWith('Add your OpenAI API key first.', 'warning');
  });

  it('should disable button during evaluation', async () => {
    const leads = [createMockLead()];
    storageData.set('leads', leads);
    storageData.set('openaiApiKey', 'sk-test123');
    const evaluateBtn = {
      disabled: false,
      classList: { add: vi.fn(), remove: vi.fn() }
    };

    mockEvaluateLeads.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 10)));

    const promise = handleEvaluate(evaluateBtn);

    await new Promise((resolve) => setTimeout(resolve, 5));
    expect(evaluateBtn.disabled).toBe(true);
    expect(evaluateBtn.classList.add).toHaveBeenCalledWith('evaluating');

    await promise;
    expect(evaluateBtn.disabled).toBe(false);
    expect(evaluateBtn.classList.remove).toHaveBeenCalledWith('evaluating');
  });

  it('should call evaluateLeads with correct parameters', async () => {
    const leads = [createMockLead()];
    storageData.set('leads', leads);
    storageData.set('openaiApiKey', 'sk-test123');
    const evaluateBtn = { disabled: false, classList: { add: vi.fn(), remove: vi.fn() } };

    mockEvaluateLeads.mockResolvedValue(leads);

    await handleEvaluate(evaluateBtn);

    expect(mockEvaluateLeads).toHaveBeenCalledWith({
      leads,
      apiKey: 'sk-test123',
      onProgress: expect.any(Function)
    });
  });

  it('should call onProgress callback', async () => {
    const leads = [createMockLead()];
    storageData.set('leads', leads);
    storageData.set('openaiApiKey', 'sk-test123');
    const evaluateBtn = { disabled: false, classList: { add: vi.fn(), remove: vi.fn() } };

    mockEvaluateLeads.mockImplementation(({ onProgress }) => {
      onProgress({ lead: leads[0], index: 0, total: 1 });
      return Promise.resolve(leads);
    });

    await handleEvaluate(evaluateBtn);

    expect(mockSetStatus).toHaveBeenCalledWith(expect.stringContaining('Scored'));
  });

  it('should handle evaluation errors', async () => {
    const leads = [createMockLead()];
    storageData.set('leads', leads);
    storageData.set('openaiApiKey', 'sk-test123');
    const evaluateBtn = { disabled: false, classList: { add: vi.fn(), remove: vi.fn() } };

    const error = new Error('API Error');
    mockEvaluateLeads.mockRejectedValue(error);

    await handleEvaluate(evaluateBtn);

    expect(mockSetStatus).toHaveBeenCalledWith('Evaluation failed: API Error', 'error');
    expect(evaluateBtn.disabled).toBe(false);
  });

  it('should save evaluated leads', async () => {
    const leads = [createMockLead()];
    storageData.set('leads', leads);
    storageData.set('openaiApiKey', 'sk-test123');
    const evaluateBtn = { disabled: false, classList: { add: vi.fn(), remove: vi.fn() } };

    const evaluatedLeads = [{ ...leads[0], aiScore: 85 }];
    mockEvaluateLeads.mockResolvedValue(evaluatedLeads);

    await handleEvaluate(evaluateBtn);

    const savedLeads = storageData.get('leads');
    expect(savedLeads).toEqual(evaluatedLeads);
  });
});
