/**
 * Chrome runtime API mock
 */

import { vi } from 'vitest';

const messageListeners = [];

export const mockRuntime = {
  sendMessage: vi.fn((message) => {
    return Promise.resolve({ success: true });
  }),
  onMessage: {
    addListener: vi.fn((callback) => {
      messageListeners.push(callback);
    }),
    removeListener: vi.fn((callback) => {
      const index = messageListeners.indexOf(callback);
      if (index > -1) {
        messageListeners.splice(index, 1);
      }
    })
  },
  getURL: vi.fn((path) => {
    return `chrome-extension://test-id/${path}`;
  })
};
