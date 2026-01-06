/**
 * Chrome tabs API mock
 */

import { vi } from 'vitest';

export const mockTabs = {
  query: vi.fn((queryInfo) => {
    const defaultTab = {
      id: 1,
      url: 'https://www.linkedin.com/search/results/people/',
      active: true,
      currentWindow: true
    };
    return Promise.resolve([defaultTab]);
  }),
  create: vi.fn((createProperties) => {
    return Promise.resolve({ id: 2, ...createProperties });
  }),
  update: vi.fn((tabId, updateProperties) => {
    return Promise.resolve({ id: tabId, ...updateProperties });
  }),
  remove: vi.fn((tabId) => {
    return Promise.resolve();
  }),
  reload: vi.fn((tabId) => {
    return Promise.resolve();
  }),
  onRemoved: {
    addListener: vi.fn()
  }
};
