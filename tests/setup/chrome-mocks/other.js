/**
 * Other Chrome API mocks (downloads, notifications, action)
 */

import { vi } from 'vitest';

export const mockDownloads = {
  download: vi.fn((options) => {
    return Promise.resolve(1);
  })
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
