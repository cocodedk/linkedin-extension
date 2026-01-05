/**
 * Other Chrome API mocks (downloads, notifications, action)
 */

import { vi } from 'vitest';

const downloadListeners = [];

export const mockDownloads = {
  download: vi.fn((options) => {
    const downloadId = 1;
    // Simulate download state change after a short delay
    setTimeout(() => {
      downloadListeners.forEach((listener) => {
        listener({
          id: downloadId,
          state: { current: 'in_progress' }
        });
      });
    }, 10);
    return Promise.resolve(downloadId);
  }),
  onChanged: {
    addListener: vi.fn((listener) => {
      downloadListeners.push(listener);
    }),
    removeListener: vi.fn((listener) => {
      const index = downloadListeners.indexOf(listener);
      if (index > -1) {
        downloadListeners.splice(index, 1);
      }
    })
  },
  _reset: () => {
    downloadListeners.length = 0;
  }
};

export const mockNotifications = {
  create: vi.fn((options) => {
    return Promise.resolve('notification-id');
  })
};

export const mockAction = {
  setBadgeText: vi.fn(() => Promise.resolve()),
  setBadgeBackgroundColor: vi.fn(() => Promise.resolve())
};
