/**
 * Tests for chrome/popup/handlers/company-data-extractor.js
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { extractCompanyDataScript } from '../../chrome/popup/handlers/company-data-extractor.js';

// Mock DOM
const mockDocument = {
  evaluate: vi.fn()
};

global.document = mockDocument;

// Mock XPathResult
global.XPathResult = {
  FIRST_ORDERED_NODE_TYPE: 9
};

describe('company-data-extractor', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations - return elements with text content
    mockDocument.evaluate.mockImplementation((xpath) => {
      const mockElements = {
        'company-size': { textContent: '2-10 employees' },
        industry: { textContent: 'Software Development' },
        'tech-stack': { textContent: 'React, Node.js, Python' }
      };

      const xpathMap = {
        '/html/body/div[5]/div[3]/div/div[2]/div/div[2]/main/div[2]/div/div/div/div[1]/section/dl/dd[3]':
          'company-size',
        '/html/body/div[5]/div[3]/div/div[2]/div/div[2]/main/div[2]/div/div/div/div[1]/section/dl/dd[2]':
          'industry',
        '/html/body/div[5]/div[3]/div/div[2]/div/div[2]/main/div[2]/div/div/div/div[1]/section/dl/dd[5]':
          'tech-stack'
      };

      const elementKey = xpathMap[xpath];
      return {
        singleNodeValue: elementKey ? mockElements[elementKey] : null
      };
    });
  });

  describe('extractCompanyDataScript', () => {
    it('should extract all company data fields successfully', () => {
      const result = extractCompanyDataScript();

      expect(result).toEqual({
        companySize: '2-10 employees',
        companyIndustry: 'Software Development',
        companyTechStack: 'React, Node.js, Python'
      });
    });

    it('should handle missing company size', () => {
      mockDocument.evaluate.mockImplementation((xpath) => {
        // Company size selectors should all fail
        if (xpath.includes('Company size') || xpath.includes('Size') || xpath.includes('dd[3]')) {
          return { singleNodeValue: null };
        }
        // Industry and tech stack selectors should work
        if (xpath.includes('Industry') || xpath.includes('dd[2]')) {
          return { singleNodeValue: { textContent: 'Software Development' } };
        }
        if (xpath.includes('Technologies') || xpath.includes('Tech') || xpath.includes('dd[5]')) {
          return { singleNodeValue: { textContent: 'React, Node.js' } };
        }
        return { singleNodeValue: null };
      });

      const result = extractCompanyDataScript();

      expect(result).toEqual({
        companySize: '',
        companyIndustry: 'Software Development',
        companyTechStack: 'React, Node.js'
      });
    });

    it('should handle missing industry', () => {
      mockDocument.evaluate.mockImplementation((xpath) => {
        // Industry selectors should all fail
        if (xpath.includes('Industry') || xpath.includes('dd[2]')) {
          return { singleNodeValue: null };
        }
        // Company size and tech stack selectors should work
        if (xpath.includes('Company size') || xpath.includes('Size') || xpath.includes('dd[3]')) {
          return { singleNodeValue: { textContent: '2-10 employees' } };
        }
        if (xpath.includes('Technologies') || xpath.includes('Tech') || xpath.includes('dd[5]')) {
          return { singleNodeValue: { textContent: 'React, Node.js' } };
        }
        return { singleNodeValue: null };
      });

      const result = extractCompanyDataScript();

      expect(result).toEqual({
        companySize: '2-10 employees',
        companyIndustry: '',
        companyTechStack: 'React, Node.js'
      });
    });

    it('should handle missing tech stack', () => {
      mockDocument.evaluate.mockImplementation((xpath) => {
        // Tech stack selectors should all fail
        if (xpath.includes('Technologies') || xpath.includes('Tech') || xpath.includes('dd[5]')) {
          return { singleNodeValue: null };
        }
        // Company size and industry selectors should work
        if (xpath.includes('Company size') || xpath.includes('Size') || xpath.includes('dd[3]')) {
          return { singleNodeValue: { textContent: '2-10 employees' } };
        }
        if (xpath.includes('Industry') || xpath.includes('dd[2]')) {
          return { singleNodeValue: { textContent: 'Software Development' } };
        }
        return { singleNodeValue: null };
      });

      const result = extractCompanyDataScript();

      expect(result).toEqual({
        companySize: '2-10 employees',
        companyIndustry: 'Software Development',
        companyTechStack: ''
      });
    });

    it('should handle elements without textContent', () => {
      mockDocument.evaluate.mockReturnValue({
        singleNodeValue: { textContent: null }
      });

      const result = extractCompanyDataScript();

      expect(result).toEqual({
        companySize: '',
        companyIndustry: '',
        companyTechStack: ''
      });
    });

    it('should handle all fields missing', () => {
      mockDocument.evaluate.mockReturnValue({ singleNodeValue: null });

      const result = extractCompanyDataScript();

      expect(result).toEqual({
        companySize: '',
        companyIndustry: '',
        companyTechStack: ''
      });
    });

    it('should handle errors gracefully', () => {
      mockDocument.evaluate.mockImplementation(() => {
        throw new Error('XPath Error');
      });

      const result = extractCompanyDataScript();

      expect(result).toEqual({
        companySize: '',
        companyIndustry: '',
        companyTechStack: ''
      });
    });

    it('should trim whitespace from extracted text', () => {
      mockDocument.evaluate.mockImplementation((xpath) => {
        const mockElements = {
          'company-size': { textContent: '  2-10 employees  ' },
          industry: { textContent: '\tSoftware Development\n' },
          'tech-stack': { textContent: ' React, Node.js, Python ' }
        };

        const xpathMap = {
          '/html/body/div[5]/div[3]/div/div[2]/div/div[2]/main/div[2]/div/div/div/div[1]/section/dl/dd[3]':
            'company-size',
          '/html/body/div[5]/div[3]/div/div[2]/div/div[2]/main/div[2]/div/div/div/div[1]/section/dl/dd[2]':
            'industry',
          '/html/body/div[5]/div[3]/div/div[2]/div/div[2]/main/div[2]/div/div/div/div[1]/section/dl/dd[5]':
            'tech-stack'
        };

        const elementKey = xpathMap[xpath];
        return {
          singleNodeValue: elementKey ? mockElements[elementKey] : null
        };
      });

      const result = extractCompanyDataScript();

      expect(result).toEqual({
        companySize: '2-10 employees',
        companyIndustry: 'Software Development',
        companyTechStack: 'React, Node.js, Python'
      });
    });
  });
});
