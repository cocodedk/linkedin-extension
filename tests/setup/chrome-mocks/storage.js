/**
 * Chrome storage API mock
 */

import { vi } from 'vitest';

export const storageData = new Map();

export const mockStorage = {
  local: {
    get: vi.fn((keys) => {
      if (typeof keys === 'string') {
        const value = storageData.get(keys);
        return Promise.resolve({ [keys]: value });
      }
      if (Array.isArray(keys)) {
        const result = {};
        keys.forEach((key) => {
          const value = storageData.get(key);
          result[key] = value;
        });
        return Promise.resolve(result);
      }
      const result = {};
      storageData.forEach((value, key) => {
        result[key] = value;
      });
      return Promise.resolve(result);
    }),
    set: vi.fn((items) => {
      Object.entries(items).forEach(([key, value]) => {
        storageData.set(key, value);
      });
      return Promise.resolve();
    }),
    remove: vi.fn((keys) => {
      if (typeof keys === 'string') {
        storageData.delete(keys);
      } else {
        keys.forEach((key) => storageData.delete(key));
      }
      return Promise.resolve();
    }),
    clear: vi.fn(() => {
      storageData.clear();
      return Promise.resolve();
    })
  }
};
