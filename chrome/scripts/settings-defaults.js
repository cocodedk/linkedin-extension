/**
 * Default settings values and the limits used to clamp/validate them.
 * Split out of settings.js so each settings module stays small.
 */

export const DEFAULT_SETTINGS = {
  deepScan: {
    profileLoadDelayMs: 4000,
    batchSize: 2,
    batchDelayMs: 3000
  },
  deepScanAll: {
    maxPages: 100,
    pageDelayMs: 2500
  },
  connectAutomation: {
    enabled: false,
    message: '',
    initialDelayMs: 20000,
    confirmDelayMs: 5000,
    messageDelayMs: 1000,
    sendDelayMs: 700,
    typingCharMinDelayMs: 65,
    typingCharMaxDelayMs: 160
  },
  virk: {
    parallelTabs: 1,
    tabWarmupDelayMs: 10000,
    searchDelayMs: 1500,
    navigationDelayMs: 1500,
    pageLoadDelayMs: 6000
  }
};

export const DEFAULT_LIMITS = {
  delayMin: 0,
  delayMax: 120000, // 2 minutes hard cap for safety
  batchSizeMin: 1,
  batchSizeMax: 10,
  pagesMin: 1,
  pagesMax: 500,
  typingDelayMin: 20,
  typingDelayMax: 500,
  messageMaxLength: 500
};
