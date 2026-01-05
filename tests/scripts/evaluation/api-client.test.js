/**
 * Tests for chrome/scripts/evaluation/api-client.js
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { requestCompletion } from '../../../chrome/scripts/evaluation/api-client.js';
import { createMockLead } from '../../setup/test-utils.js';

describe('api-client', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  it('should make API request with correct payload', async () => {
    const lead = createMockLead();
    const apiKey = 'sk-test123';

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: '{"aiScore": 85, "aiReasons": "Good fit"}'
            }
          }
        ]
      })
    });

    await requestCompletion({ apiKey, lead });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('api.openai.com'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        })
      })
    );
  });

  it('should return enriched lead with parsed JSON', async () => {
    const lead = createMockLead();
    const apiKey = 'sk-test123';

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: '{"aiScore": 90, "aiReasons": "Excellent", "aiFitSummary": "Perfect match"}'
            }
          }
        ]
      })
    });

    const result = await requestCompletion({ apiKey, lead });

    expect(result).toMatchObject({
      ...lead,
      aiScore: 90,
      aiReasons: 'Excellent',
      aiFitSummary: 'Perfect match'
    });
  });

  it('should handle alternative field names', async () => {
    const lead = createMockLead();
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: '{"score": 85, "reasons": "Good", "fitSummary": "Match"}'
            }
          }
        ]
      })
    });

    const result = await requestCompletion({ apiKey: 'sk-test', lead });

    expect(result.aiScore).toBe(85);
    expect(result.aiReasons).toBe('Good');
    expect(result.aiFitSummary).toBe('Match');
  });

  it('should handle aiFit field name', async () => {
    const lead = createMockLead();
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: '{"aiScore": 80, "aiFit": "Good match"}'
            }
          }
        ]
      })
    });

    const result = await requestCompletion({ apiKey: 'sk-test', lead });
    expect(result.aiFitSummary).toBe('Good match');
  });

  it('should handle API error responses', async () => {
    const lead = createMockLead();
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401
    });

    await expect(requestCompletion({ apiKey: 'sk-invalid', lead })).rejects.toThrow(
      'OpenAI request failed with status 401'
    );
  });

  it('should handle unparseable JSON response', async () => {
    const lead = createMockLead();
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: 'Not valid JSON'
            }
          }
        ]
      })
    });

    const result = await requestCompletion({ apiKey: 'sk-test', lead });

    expect(result.aiScore).toBeNull();
    expect(result.aiReasons).toBe('Not valid JSON');
    expect(result.aiFitSummary).toBe('No FITS summary available.');
  });

  it('should handle empty response content', async () => {
    const lead = createMockLead();
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: ''
            }
          }
        ]
      })
    });

    const result = await requestCompletion({ apiKey: 'sk-test', lead });

    expect(result.aiScore).toBeNull();
    expect(result.aiReasons).toBe('Unable to parse AI response as JSON.');
  });

  it('should handle missing choices in response', async () => {
    const lead = createMockLead();
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    });

    const result = await requestCompletion({ apiKey: 'sk-test', lead });

    expect(result.aiScore).toBeNull();
    expect(result.aiReasons).toBe('Unable to parse AI response as JSON.');
  });

  it('should remove isOnline and online from lead payload', async () => {
    const lead = { ...createMockLead(), isOnline: true, online: false };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: '{"aiScore": 85}'
            }
          }
        ]
      })
    });

    await requestCompletion({ apiKey: 'sk-test', lead });

    const requestBody = JSON.parse(global.fetch.mock.calls[0][1].body);
    const userMessage = requestBody.messages.find((m) => m.role === 'user');
    const payloadLead = JSON.parse(userMessage.content.match(/\{[\s\S]*\}/)[0]);

    expect(payloadLead.isOnline).toBeUndefined();
    expect(payloadLead.online).toBeUndefined();
  });
});
