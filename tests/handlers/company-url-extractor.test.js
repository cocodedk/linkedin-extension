/**
 * Tests for chrome/popup/handlers/company-url-extractor.js
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { extractCompanyUrlScript } from '../../chrome/popup/handlers/company-url-extractor.js';

// Mock DOM
const mockDocument = {
  querySelectorAll: vi.fn(),
  evaluate: vi.fn()
};

global.document = mockDocument;

// Mock XPathResult
global.XPathResult = {
  FIRST_ORDERED_NODE_TYPE: 9
};

describe('company-url-extractor', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockDocument.querySelectorAll.mockReturnValue([]);
    mockDocument.evaluate.mockReturnValue({ singleNodeValue: null });
  });

  describe('extractCompanyUrlScript', () => {
    it('should extract company URL from profile page links', () => {
      const mockLink = {
        getAttribute: vi.fn().mockReturnValue('https://www.linkedin.com/company/acme-corp'),
        href: 'https://www.linkedin.com/company/acme-corp'
      };

      mockDocument.querySelectorAll.mockReturnValue([mockLink]);

      const result = extractCompanyUrlScript();

      expect(result).toBe('https://www.linkedin.com/company/acme-corp');
      expect(mockDocument.querySelectorAll).toHaveBeenCalledWith('a[href*="/company/"]');
    });

    it('should handle relative URLs and make them absolute', () => {
      const mockLink = {
        getAttribute: vi.fn().mockReturnValue('/company/acme-corp'),
        href: '/company/acme-corp'
      };

      mockDocument.querySelectorAll.mockReturnValue([mockLink]);

      const result = extractCompanyUrlScript();

      expect(result).toBe('https://www.linkedin.com/company/acme-corp');
    });

    it('should try experience section links as fallback', () => {
      // First call returns empty array, second call returns the link
      mockDocument.querySelectorAll.mockReturnValueOnce([]).mockReturnValueOnce([
        {
          getAttribute: vi.fn().mockReturnValue('https://www.linkedin.com/company/tech-inc'),
          href: 'https://www.linkedin.com/company/tech-inc'
        }
      ]);

      const result = extractCompanyUrlScript();

      expect(result).toBe('https://www.linkedin.com/company/tech-inc');
      expect(mockDocument.querySelectorAll).toHaveBeenCalledTimes(2);
    });

    it('should try XPath as final fallback', () => {
      mockDocument.querySelectorAll.mockReturnValue([]);

      const mockElement = {
        getAttribute: vi.fn().mockReturnValue('https://www.linkedin.com/company/xpath-company'),
        href: 'https://www.linkedin.com/company/xpath-company'
      };

      mockDocument.evaluate.mockReturnValue({ singleNodeValue: mockElement });

      const result = extractCompanyUrlScript();

      expect(result).toBe('https://www.linkedin.com/company/xpath-company');
      expect(mockDocument.evaluate).toHaveBeenCalled();
    });

    it('should return empty string when no company links found', () => {
      mockDocument.querySelectorAll.mockReturnValue([]);
      mockDocument.evaluate.mockReturnValue({ singleNodeValue: null });

      const result = extractCompanyUrlScript();

      expect(result).toBe('');
    });

    it('should handle errors gracefully', () => {
      mockDocument.querySelectorAll.mockImplementation(() => {
        throw new Error('DOM Error');
      });

      const result = extractCompanyUrlScript();

      expect(result).toBe('');
    });

    it('should handle links without href attribute', () => {
      const mockLink = {
        getAttribute: vi.fn().mockReturnValue(null),
        href: undefined
      };

      mockDocument.querySelectorAll.mockReturnValue([mockLink]);

      const result = extractCompanyUrlScript();

      expect(result).toBe('');
    });
  });
});
