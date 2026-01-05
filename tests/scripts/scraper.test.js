/**
 * Tests for scraper utilities
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import { normaliseText } from '../../chrome/scripts/scraper/text-utils.js';

describe('text-utils', () => {
  describe('normaliseText', () => {
    it('should return empty string for null input', () => {
      expect(normaliseText(null)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(normaliseText(undefined)).toBe('');
    });

    it('should normalize text node content', () => {
      const textNode = document.createTextNode('  Hello   World  ');
      expect(normaliseText(textNode)).toBe('Hello World');
    });

    it('should normalize element text content', () => {
      const element = document.createElement('div');
      element.textContent = '  Test   Content  ';
      expect(normaliseText(element)).toBe('Test Content');
    });

    it('should remove visually-hidden elements', () => {
      const container = document.createElement('div');
      container.innerHTML = '<span>Visible</span><span class="visually-hidden">Hidden</span>';
      const result = normaliseText(container);
      expect(result).toBe('Visible');
      expect(result).not.toContain('Hidden');
    });

    it('should remove script and style elements', () => {
      const container = document.createElement('div');
      container.innerHTML =
        '<span>Content</span><script>alert("test")</script><style>.hidden { display: none; }</style>';
      const result = normaliseText(container);
      expect(result).toBe('Content');
      expect(result).not.toContain('alert');
      expect(result).not.toContain('display: none');
    });

    it('should remove "Status is offline" text', () => {
      const element = document.createElement('div');
      element.textContent = 'John Doe Status is offline';
      expect(normaliseText(element)).toBe('John Doe');
    });

    it('should handle multiple whitespace', () => {
      const element = document.createElement('div');
      element.textContent = 'Line  1\n\nLine    2\t\tLine 3';
      const result = normaliseText(element);
      expect(result).toBe('Line 1 Line 2 Line 3');
    });

    it('should handle empty element', () => {
      const element = document.createElement('div');
      expect(normaliseText(element)).toBe('');
    });

    it('should handle non-element objects', () => {
      const obj = { textContent: 'Test' };
      expect(normaliseText(obj)).toBe('Test');
    });
  });
});
