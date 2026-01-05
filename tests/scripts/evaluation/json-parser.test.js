/**
 * Tests for chrome/scripts/evaluation/json-parser.js
 */

import { describe, it, expect } from 'vitest';
import { extractJson, prepareLeadPayload } from '../../../chrome/scripts/evaluation/json-parser.js';

describe('json-parser', () => {
  describe('extractJson', () => {
    it('should extract JSON from plain text', () => {
      const text = '{"aiScore": 85, "aiReasons": "Good fit"}';
      const result = extractJson(text);
      expect(result).toEqual({ aiScore: 85, aiReasons: 'Good fit' });
    });

    it('should extract JSON from code block', () => {
      const text = '```json\n{"aiScore": 90}\n```';
      const result = extractJson(text);
      expect(result).toEqual({ aiScore: 90 });
    });

    it('should extract JSON from code block without json tag', () => {
      const text = '```\n{"aiScore": 75}\n```';
      const result = extractJson(text);
      expect(result).toEqual({ aiScore: 75 });
    });

    it('should extract JSON with surrounding text', () => {
      const text = 'Here is the result: {"aiScore": 80} End of text';
      const result = extractJson(text);
      expect(result).toEqual({ aiScore: 80 });
    });

    it('should return null for empty string', () => {
      expect(extractJson('')).toBeNull();
      expect(extractJson(null)).toBeNull();
      expect(extractJson(undefined)).toBeNull();
    });

    it('should return null for text without JSON', () => {
      expect(extractJson('No JSON here')).toBeNull();
      expect(extractJson('Just some text')).toBeNull();
    });

    it('should return null for invalid JSON', () => {
      expect(extractJson('{"invalid": json}')).toBeNull();
      expect(extractJson('{not valid json}')).toBeNull();
    });

    it('should handle nested JSON objects', () => {
      const text = '{"aiScore": 85, "details": {"reason": "Good"}}';
      const result = extractJson(text);
      expect(result).toEqual({ aiScore: 85, details: { reason: 'Good' } });
    });

    it('should handle JSON arrays', () => {
      const text = '{"reasons": ["Reason 1", "Reason 2"]}';
      const result = extractJson(text);
      expect(result).toEqual({ reasons: ['Reason 1', 'Reason 2'] });
    });

    it('should return null for text with multiple separate JSON objects', () => {
      const text = '{"first": 1} and {"second": 2}';
      const result = extractJson(text);
      expect(result).toBeNull();
    });
  });

  describe('prepareLeadPayload', () => {
    it('should remove isOnline and online fields', () => {
      const lead = {
        name: 'John Doe',
        isOnline: true,
        online: false,
        company: 'Acme'
      };
      const result = prepareLeadPayload(lead);
      expect(result).toEqual({
        name: 'John Doe',
        company: 'Acme'
      });
      expect(result.isOnline).toBeUndefined();
      expect(result.online).toBeUndefined();
    });

    it('should keep all other fields', () => {
      const lead = {
        name: 'John Doe',
        company: 'Acme',
        location: 'Copenhagen',
        profileUrl: 'https://linkedin.com/in/johndoe'
      };
      const result = prepareLeadPayload(lead);
      expect(result).toEqual(lead);
    });

    it('should handle null input', () => {
      expect(prepareLeadPayload(null)).toEqual({});
    });

    it('should handle undefined input', () => {
      expect(prepareLeadPayload(undefined)).toEqual({});
    });

    it('should handle non-object input', () => {
      expect(prepareLeadPayload('string')).toEqual({});
      expect(prepareLeadPayload(123)).toEqual({});
    });

    it('should handle empty object', () => {
      expect(prepareLeadPayload({})).toEqual({});
    });

    it('should handle lead with only isOnline/online', () => {
      const lead = { isOnline: true, online: false };
      const result = prepareLeadPayload(lead);
      expect(result).toEqual({});
    });
  });
});
