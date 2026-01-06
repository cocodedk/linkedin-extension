/**
 * Tests for chrome/popup/handlers/scan-deep-processor.js
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { processProfile } from '../../chrome/popup/handlers/scan-deep-processor.js';
import { mockTabs, mockScripting } from '../setup/chrome-mocks.js';

// Mock the enrichment module and scripts
vi.mock('../../chrome/popup/handlers/company-enrichment.js', () => ({
  enrichWithCompanyData: vi.fn()
}));

vi.mock('../../chrome/popup/handlers/scan-deep-scripts.js', () => ({
  extractCompanyScript: vi.fn(),
  extractProfileDataScript: vi.fn()
}));

import { enrichWithCompanyData } from '../../chrome/popup/handlers/company-enrichment.js';
import {
  extractCompanyScript,
  extractProfileDataScript
} from '../../chrome/popup/handlers/scan-deep-scripts.js';

describe('scan-deep-processor', () => {
  const mockSetStatus = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    extractCompanyScript.mockReturnValue('Acme Corp');
    extractProfileDataScript.mockReturnValue({
      headline: 'Software Engineer',
      location: 'Copenhagen, Denmark'
    });

    enrichWithCompanyData.mockResolvedValue({
      companySize: '2-10 employees',
      companyIndustry: 'Software Development',
      companyTechStack: 'React, Node.js'
    });

    mockTabs.create.mockResolvedValue({ id: 123 });
    mockTabs.remove.mockResolvedValue();

    mockScripting.executeScript.mockImplementation((details) => {
      const { func } = details;
      if (func === extractCompanyScript) {
        const result = extractCompanyScript();
        return Promise.resolve([{ result: result }]);
      }
      if (func === extractProfileDataScript) {
        const result = extractProfileDataScript();
        return Promise.resolve([{ result: result }]);
      }
      return Promise.resolve([{ result: null }]);
    });
  });

  describe('processProfile', () => {
    const mockProfile = {
      name: 'John Doe',
      profileUrl: 'https://www.linkedin.com/in/johndoe'
    };

    it('should successfully process a profile with company enrichment', async () => {
      const result = await processProfile(mockProfile, 0, 1, mockSetStatus);

      expect(result).toEqual({
        name: 'John Doe',
        headline: 'Software Engineer',
        company: 'Acme Corp',
        companySize: '2-10 employees',
        companyIndustry: 'Software Development',
        companyTechStack: 'React, Node.js',
        location: 'Copenhagen, Denmark',
        contact: 'https://www.linkedin.com/in/johndoe',
        contactLinks: [
          { href: 'https://www.linkedin.com/in/johndoe', label: 'LinkedIn', type: 'linkedin' }
        ],
        profileUrl: 'https://www.linkedin.com/in/johndoe'
      });

      expect(mockSetStatus).toHaveBeenCalledWith('Processing 1/1: John Doe...');
      expect(mockTabs.create).toHaveBeenCalledWith({
        url: 'https://www.linkedin.com/in/johndoe',
        active: false
      });
      expect(mockTabs.remove).toHaveBeenCalledWith(123);
      expect(enrichWithCompanyData).toHaveBeenCalledWith(123, '');
    });

    it('should handle company enrichment failures gracefully', async () => {
      enrichWithCompanyData.mockResolvedValue({
        companySize: '',
        companyIndustry: '',
        companyTechStack: ''
      });

      const result = await processProfile(mockProfile, 0, 1, mockSetStatus);

      expect(result.companySize).toBe('');
      expect(result.companyIndustry).toBe('');
      expect(result.companyTechStack).toBe('');
    });

    it('should handle script execution errors', async () => {
      mockScripting.executeScript.mockRejectedValue(new Error('Script execution failed'));

      const result = await processProfile(mockProfile, 0, 1, mockSetStatus);

      expect(result).toEqual({
        name: 'John Doe',
        company: '',
        companySize: '',
        companyIndustry: '',
        companyTechStack: '',
        profileUrl: 'https://www.linkedin.com/in/johndoe',
        contact: 'https://www.linkedin.com/in/johndoe',
        contactLinks: [
          { href: 'https://www.linkedin.com/in/johndoe', label: 'LinkedIn', type: 'linkedin' }
        ],
        headline: '',
        location: ''
      });
    });

    it('should handle tab creation errors', async () => {
      mockTabs.create.mockRejectedValue(new Error('Tab creation failed'));

      const result = await processProfile(mockProfile, 0, 1, mockSetStatus);

      expect(result.company).toBe('');
      expect(result.companySize).toBe('');
      expect(result.companyIndustry).toBe('');
      expect(result.companyTechStack).toBe('');
      expect(result.headline).toBe('');
      expect(result.location).toBe('');
    });

    it('should clean up tabs even on errors', async () => {
      mockTabs.create.mockResolvedValue({ id: 123 });
      enrichWithCompanyData.mockRejectedValue(new Error('Enrichment failed'));

      await processProfile(mockProfile, 0, 1, mockSetStatus);

      expect(mockTabs.remove).toHaveBeenCalledWith(123);
    });

    it('should handle tab removal errors gracefully', async () => {
      mockTabs.remove.mockRejectedValue(new Error('Tab removal failed'));

      // Should not throw
      await expect(processProfile(mockProfile, 0, 1, mockSetStatus)).resolves.toBeDefined();
    });

    it('should handle missing profile data', async () => {
      extractProfileDataScript.mockReturnValue({});
      enrichWithCompanyData.mockResolvedValue({
        companySize: '',
        companyIndustry: '',
        companyTechStack: ''
      });

      const result = await processProfile(mockProfile, 0, 1, mockSetStatus);

      expect(result.headline).toBe('');
      expect(result.location).toBe('');
      expect(result.companySize).toBe('');
      expect(result.companyIndustry).toBe('');
      expect(result.companyTechStack).toBe('');
    });

    it('should handle missing company data', async () => {
      extractCompanyScript.mockReturnValue('');
      enrichWithCompanyData.mockResolvedValue({
        companySize: '',
        companyIndustry: '',
        companyTechStack: ''
      });

      const result = await processProfile(mockProfile, 0, 1, mockSetStatus);

      expect(result.company).toBe('');
      expect(result.companySize).toBe('');
      expect(result.companyIndustry).toBe('');
      expect(result.companyTechStack).toBe('');
    });

    it('should pass correct index and total to status callback', async () => {
      await processProfile(mockProfile, 2, 5, mockSetStatus);

      expect(mockSetStatus).toHaveBeenCalledWith('Processing 3/5: John Doe...');
    });

    it('should include all required contact link information', async () => {
      const result = await processProfile(mockProfile, 0, 1, mockSetStatus);

      expect(result.contactLinks).toEqual([
        {
          href: 'https://www.linkedin.com/in/johndoe',
          label: 'LinkedIn',
          type: 'linkedin'
        }
      ]);
    });

    it('should maintain profile URL in multiple fields', async () => {
      const result = await processProfile(mockProfile, 0, 1, mockSetStatus);

      expect(result.contact).toBe('https://www.linkedin.com/in/johndoe');
      expect(result.profileUrl).toBe('https://www.linkedin.com/in/johndoe');
      expect(result.contactLinks[0].href).toBe('https://www.linkedin.com/in/johndoe');
    });
  });
});
