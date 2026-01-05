/**
 * Tests for chrome/scripts/storage.js
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getLeads,
  saveLeads,
  clearLeads,
  getApiKey,
  setApiKey,
  getLastAiQuery,
  setLastAiQuery
} from '../../chrome/scripts/storage.js';
import { storageData } from '../setup/chrome-mocks.js';
import { createMockLead } from '../setup/test-utils.js';

describe('storage', () => {
  beforeEach(() => {
    storageData.clear();
  });

  describe('getLeads', () => {
    it('should return empty array when no leads stored', async () => {
      const leads = await getLeads();
      expect(leads).toEqual([]);
    });

    it('should return stored leads', async () => {
      const mockLeads = [
        createMockLead(),
        createMockLead({ name: 'Jane Doe', profileUrl: 'https://www.linkedin.com/in/janedoe' })
      ];
      storageData.set('leads', mockLeads);

      const leads = await getLeads();
      expect(leads).toEqual(mockLeads);
      expect(leads).toHaveLength(2);
    });
  });

  describe('saveLeads', () => {
    it('should save new leads', async () => {
      const newLeads = [createMockLead()];
      const saved = await saveLeads(newLeads);

      expect(saved).toHaveLength(1);
      expect(saved[0].name).toBe('John Doe');
      expect(saved[0].profileUrl).toBe('https://www.linkedin.com/in/johndoe');
    });

    it('should deduplicate leads by profileUrl', async () => {
      const lead1 = createMockLead({
        name: 'John Doe',
        profileUrl: 'https://www.linkedin.com/in/johndoe'
      });
      const lead2 = createMockLead({
        name: 'Jane Doe',
        profileUrl: 'https://www.linkedin.com/in/janedoe'
      });

      await saveLeads([lead1]);
      await saveLeads([lead2]);

      const allLeads = await getLeads();
      expect(allLeads).toHaveLength(2);
    });

    it('should merge existing lead data when profileUrl matches', async () => {
      const initialLead = createMockLead({ name: 'John Doe', headline: 'Engineer' });
      await saveLeads([initialLead]);

      const updatedLead = createMockLead({ headline: 'Senior Engineer', location: 'Copenhagen' });
      await saveLeads([updatedLead]);

      const leads = await getLeads();
      expect(leads).toHaveLength(1);
      expect(leads[0].name).toBe('John Doe');
      expect(leads[0].headline).toBe('Senior Engineer');
      expect(leads[0].location).toBe('Copenhagen');
    });

    it('should ignore leads without profileUrl', async () => {
      const leadWithoutUrl = { name: 'Invalid Lead' };
      await saveLeads([leadWithoutUrl]);

      const leads = await getLeads();
      expect(leads).toHaveLength(0);
    });

    it('should return existing leads when empty array provided', async () => {
      const existingLeads = [createMockLead()];
      await saveLeads(existingLeads);

      const result = await saveLeads([]);
      expect(result).toEqual(existingLeads);
    });

    it('should handle non-array input gracefully', async () => {
      const result = await saveLeads(null);
      const leads = await getLeads();
      expect(leads).toHaveLength(0);
    });
  });

  describe('clearLeads', () => {
    it('should clear all stored leads', async () => {
      await saveLeads([createMockLead()]);
      await clearLeads();

      const leads = await getLeads();
      expect(leads).toEqual([]);
    });
  });

  describe('API key management', () => {
    it('should get empty API key when not set', async () => {
      const apiKey = await getApiKey();
      expect(apiKey).toBe('');
    });

    it('should set and get API key', async () => {
      const testKey = 'sk-test123';
      await setApiKey(testKey);

      const apiKey = await getApiKey();
      expect(apiKey).toBe(testKey);
    });

    it('should update existing API key', async () => {
      await setApiKey('sk-old');
      await setApiKey('sk-new');

      const apiKey = await getApiKey();
      expect(apiKey).toBe('sk-new');
    });
  });

  describe('AI query management', () => {
    it('should get null when no AI query stored', async () => {
      const query = await getLastAiQuery();
      expect(query).toBeNull();
    });

    it('should set and get AI query', async () => {
      const queryEntry = { query: 'test query', timestamp: Date.now() };
      await setLastAiQuery(queryEntry);

      const retrieved = await getLastAiQuery();
      expect(retrieved).toEqual(queryEntry);
    });
  });
});
