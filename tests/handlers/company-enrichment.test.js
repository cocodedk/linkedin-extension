/**
 * Tests for chrome/popup/handlers/company-enrichment.js
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { enrichWithCompanyData } from '../../chrome/popup/handlers/company-enrichment.js';
import { mockTabs, mockScripting } from '../setup/chrome-mocks.js';

// Mock the extractor scripts
vi.mock('../../chrome/popup/handlers/scan-deep-scripts.js', () => ({
  extractCompanyUrlScript: vi.fn(),
  extractCompanyDataScript: vi.fn()
}));

import {
  extractCompanyUrlScript,
  extractCompanyDataScript
} from '../../chrome/popup/handlers/scan-deep-scripts.js';

// Mock DOM for extractor scripts
const mockDocument = {
  querySelectorAll: vi.fn(),
  evaluate: vi.fn()
};

global.document = mockDocument;
global.XPathResult = {
  FIRST_ORDERED_NODE_TYPE: 9
};

describe('company-enrichment', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock DOM for extractor scripts
    mockDocument.querySelectorAll.mockReturnValue([
      {
        getAttribute: vi.fn().mockReturnValue('https://www.linkedin.com/company/acme-corp'),
        href: 'https://www.linkedin.com/company/acme-corp'
      }
    ]);

    mockDocument.evaluate.mockReturnValue({ singleNodeValue: null });

    // Default mock implementations
    extractCompanyUrlScript.mockReturnValue('https://www.linkedin.com/company/acme-corp');
    extractCompanyDataScript.mockReturnValue({
      companySize: '2-10 employees',
      companyIndustry: 'Software Development',
      companyTechStack: 'React, Node.js'
    });

    mockTabs.create.mockResolvedValue({ id: 123 });
    mockTabs.update.mockResolvedValue({ id: 123 });
    mockTabs.remove.mockResolvedValue();

    mockScripting.executeScript.mockImplementation((details) => {
      const { func } = details;
      if (func === extractCompanyUrlScript) {
        return Promise.resolve([{ result: extractCompanyUrlScript() }]);
      }
      if (func === extractCompanyDataScript) {
        return Promise.resolve([{ result: extractCompanyDataScript() }]);
      }
      return Promise.resolve([{ result: null }]);
    });
  });

  describe('enrichWithCompanyData', () => {
    it('should skip enrichment when no company URL found', async () => {
      extractCompanyUrlScript.mockReturnValue('');

      const result = await enrichWithCompanyData(456, '');

      expect(result).toEqual({
        companySize: '',
        companyIndustry: '',
        companyTechStack: ''
      });

      expect(mockTabs.create).not.toHaveBeenCalled();
    });
  });
});
