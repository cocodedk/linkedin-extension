/**
 * Chrome API mocks for testing - main orchestrator
 */

import { beforeEach, vi } from 'vitest';
import { mockStorage, storageData } from './chrome-mocks/storage.js';
import { mockTabs } from './chrome-mocks/tabs.js';
import { mockRuntime } from './chrome-mocks/runtime.js';
import { mockScripting } from './chrome-mocks/scripting.js';
import { mockDownloads, mockNotifications, mockAction } from './chrome-mocks/other.js';

global.chrome = {
  storage: mockStorage,
  tabs: mockTabs,
  runtime: mockRuntime,
  scripting: mockScripting,
  downloads: mockDownloads,
  notifications: mockNotifications,
  action: mockAction
};

beforeEach(() => {
  storageData.clear();
  vi.clearAllMocks();

  mockTabs.query.mockResolvedValue([
    {
      id: 1,
      url: 'https://www.linkedin.com/search/results/people/',
      active: true,
      currentWindow: true
    }
  ]);

  mockRuntime.sendMessage.mockResolvedValue({ success: true });
  mockScripting.executeScript.mockImplementation((details) => {
    const { func, args = [] } = details;
    try {
      const result = func(...args);
      return Promise.resolve([{ result }]);
    } catch (error) {
      return Promise.resolve([{ result: { success: false, error: error.message } }]);
    }
  });
});

export {
  mockStorage,
  mockTabs,
  mockRuntime,
  mockScripting,
  mockDownloads,
  mockNotifications,
  mockAction,
  storageData
};
