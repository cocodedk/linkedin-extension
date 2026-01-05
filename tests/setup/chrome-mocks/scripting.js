/**
 * Chrome scripting API mock
 */

import { vi } from 'vitest';

export const mockScripting = {
  executeScript: vi.fn((details) => {
    const { func, args = [] } = details;
    try {
      const result = func(...args);
      return Promise.resolve([{ result }]);
    } catch (error) {
      return Promise.resolve([{ result: { success: false, error: error.message } }]);
    }
  })
};
