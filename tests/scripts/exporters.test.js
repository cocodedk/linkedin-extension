/**
 * Tests for chrome/scripts/exporters.js
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { toCsv, toJson, triggerDownload } from '../../chrome/scripts/exporters.js';
import { mockDownloads } from '../setup/chrome-mocks.js';
import { createMockLead } from '../setup/test-utils.js';

describe('exporters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('toCsv', () => {
    it('should convert leads to CSV format', () => {
      const leads = [
        createMockLead({ name: 'John Doe', company: 'Acme Corp' }),
        createMockLead({ name: 'Jane Smith', company: 'Tech Inc' })
      ];

      const csv = toCsv(leads);
      expect(csv).toContain('name,headline,company');
      expect(csv).toContain('John Doe');
      expect(csv).toContain('Jane Smith');
      expect(csv).toContain('Acme Corp');
    });

    it('should handle empty array', () => {
      const csv = toCsv([]);
      expect(csv).toBe(
        'name,headline,company,contact,location,profileUrl,aiScore,aiReasons,aiFitSummary,virkCvrNumber,virkAddress,virkPostalCode,virkCity,virkStartDate,virkCompanyForm,virkStatus,virkEnriched,virkEnrichmentDate'
      );
    });

    it('should escape quotes in values', () => {
      const leads = [{ name: 'John "Johnny" Doe', company: 'Acme Corp' }];
      const csv = toCsv(leads);
      expect(csv).toContain('"John ""Johnny"" Doe"');
    });

    it('should handle null and undefined values', () => {
      const leads = [{ name: 'John Doe', company: null, headline: undefined }];
      const csv = toCsv(leads);
      expect(csv).toContain('"John Doe"');
      expect(csv).toContain('""');
    });

    it('should handle special characters', () => {
      const leads = [{ name: 'John, Doe', company: 'Acme\nCorp' }];
      const csv = toCsv(leads);
      expect(csv).toContain('"John, Doe"');
      expect(csv).toContain('"Acme\nCorp"');
    });

    it('should include all header fields', () => {
      const csv = toCsv([]);
      const headers = csv.split(',');
      expect(headers).toContain('name');
      expect(headers).toContain('virkEnriched');
      expect(headers).toContain('virkEnrichmentDate');
    });
  });

  describe('toJson', () => {
    it('should convert leads to JSON format', () => {
      const leads = [createMockLead(), createMockLead({ name: 'Jane Doe' })];
      const json = toJson(leads);
      const parsed = JSON.parse(json);

      expect(parsed).toHaveLength(2);
      expect(parsed[0].name).toBe('John Doe');
      expect(parsed[1].name).toBe('Jane Doe');
    });

    it('should format JSON with 2-space indentation', () => {
      const leads = [createMockLead()];
      const json = toJson(leads);
      expect(json).toContain('  ');
      expect(json.split('\n').length).toBeGreaterThan(1);
    });

    it('should handle empty array', () => {
      const json = toJson([]);
      expect(json).toBe('[]');
    });

    it('should handle null input', () => {
      const json = toJson(null);
      expect(json).toBe('[]');
    });

    it('should handle non-array input', () => {
      const json = toJson({ name: 'John' });
      expect(json).toBe('[]');
    });
  });

  describe('triggerDownload', () => {
    it('should trigger Chrome download', async () => {
      const options = {
        filename: 'test.csv',
        mimeType: 'text/csv',
        content: 'test,content'
      };

      await triggerDownload(options);

      expect(mockDownloads.download).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: 'test.csv',
          saveAs: true
        })
      );
    });

    it('should create blob with correct mime type', async () => {
      const content = 'test content';
      const mimeType = 'application/json';

      await triggerDownload({
        filename: 'test.json',
        mimeType,
        content
      });

      expect(mockDownloads.download).toHaveBeenCalled();
      const callArgs = mockDownloads.download.mock.calls[0][0];
      expect(callArgs.url).toBeTruthy();
    });

    it('should handle different file types', async () => {
      await triggerDownload({
        filename: 'leads.csv',
        mimeType: 'text/csv',
        content: 'csv,data'
      });

      await triggerDownload({
        filename: 'leads.json',
        mimeType: 'application/json',
        content: '{"data": "json"}'
      });

      expect(mockDownloads.download).toHaveBeenCalledTimes(2);
    });
  });
});
