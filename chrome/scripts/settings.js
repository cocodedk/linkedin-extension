/**
 * Settings management helpers with sane defaults and validation.
 * Allows tweaking timeouts and concurrency to avoid Linkedin limits.
 */

const SETTINGS_KEY = 'extensionSettings';

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

const DEFAULT_LIMITS = {
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

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function deepMerge(base, override) {
  if (!isPlainObject(base)) return override;
  if (!isPlainObject(override)) return base;

  const result = {};
  const keys = new Set([...Object.keys(base), ...Object.keys(override)]);

  for (const key of keys) {
    const baseValue = base[key];
    const overrideValue = override[key];

    if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
      result[key] = deepMerge(baseValue, overrideValue);
    } else if (overrideValue !== undefined) {
      result[key] = overrideValue;
    } else {
      result[key] = baseValue;
    }
  }

  return result;
}

function clampNumber(value, fallback, { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER } = {}) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  const rounded = Math.round(numeric);
  return Math.min(max, Math.max(min, rounded));
}

function sanitiseBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalised = value.trim().toLowerCase();
    if (normalised === 'true') return true;
    if (normalised === 'false') return false;
  }
  return fallback;
}

function sanitiseString(value, fallback = '', { maxLength = 255 } = {}) {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.length > maxLength) {
    return trimmed.slice(0, maxLength);
  }
  return trimmed;
}

function sanitise(settings) {
  const merged = deepMerge(DEFAULT_SETTINGS, settings ?? {});

  const typingCharMinDelayMs = clampNumber(
    merged.connectAutomation?.typingCharMinDelayMs,
    DEFAULT_SETTINGS.connectAutomation.typingCharMinDelayMs,
    { min: DEFAULT_LIMITS.typingDelayMin, max: DEFAULT_LIMITS.typingDelayMax }
  );

  const typingCharMaxDelayMs = clampNumber(
    merged.connectAutomation?.typingCharMaxDelayMs,
    DEFAULT_SETTINGS.connectAutomation.typingCharMaxDelayMs,
    { min: typingCharMinDelayMs, max: DEFAULT_LIMITS.typingDelayMax }
  );

  return {
    deepScan: {
      profileLoadDelayMs: clampNumber(
        merged.deepScan?.profileLoadDelayMs,
        DEFAULT_SETTINGS.deepScan.profileLoadDelayMs,
        { min: DEFAULT_LIMITS.delayMin, max: DEFAULT_LIMITS.delayMax }
      ),
      batchSize: clampNumber(
        merged.deepScan?.batchSize,
        DEFAULT_SETTINGS.deepScan.batchSize,
        { min: DEFAULT_LIMITS.batchSizeMin, max: DEFAULT_LIMITS.batchSizeMax }
      ),
      batchDelayMs: clampNumber(
        merged.deepScan?.batchDelayMs,
        DEFAULT_SETTINGS.deepScan.batchDelayMs,
        { min: DEFAULT_LIMITS.delayMin, max: DEFAULT_LIMITS.delayMax }
      )
    },
    deepScanAll: {
      maxPages: clampNumber(
        merged.deepScanAll?.maxPages,
        DEFAULT_SETTINGS.deepScanAll.maxPages,
        { min: DEFAULT_LIMITS.pagesMin, max: DEFAULT_LIMITS.pagesMax }
      ),
      pageDelayMs: clampNumber(
        merged.deepScanAll?.pageDelayMs,
        DEFAULT_SETTINGS.deepScanAll.pageDelayMs,
        { min: DEFAULT_LIMITS.delayMin, max: DEFAULT_LIMITS.delayMax }
      )
    },
    connectAutomation: {
      enabled: sanitiseBoolean(
        merged.connectAutomation?.enabled,
        DEFAULT_SETTINGS.connectAutomation.enabled
      ),
      message: sanitiseString(
        merged.connectAutomation?.message,
        DEFAULT_SETTINGS.connectAutomation.message,
        { maxLength: DEFAULT_LIMITS.messageMaxLength }
      ),
      initialDelayMs: clampNumber(
        merged.connectAutomation?.initialDelayMs,
        DEFAULT_SETTINGS.connectAutomation.initialDelayMs,
        { min: DEFAULT_LIMITS.delayMin, max: DEFAULT_LIMITS.delayMax }
      ),
      confirmDelayMs: clampNumber(
        merged.connectAutomation?.confirmDelayMs,
        DEFAULT_SETTINGS.connectAutomation.confirmDelayMs,
        { min: DEFAULT_LIMITS.delayMin, max: DEFAULT_LIMITS.delayMax }
      ),
      messageDelayMs: clampNumber(
        merged.connectAutomation?.messageDelayMs,
        DEFAULT_SETTINGS.connectAutomation.messageDelayMs,
        { min: DEFAULT_LIMITS.delayMin, max: DEFAULT_LIMITS.delayMax }
      ),
      sendDelayMs: clampNumber(
        merged.connectAutomation?.sendDelayMs,
        DEFAULT_SETTINGS.connectAutomation.sendDelayMs,
        { min: DEFAULT_LIMITS.delayMin, max: DEFAULT_LIMITS.delayMax }
      ),
      typingCharMinDelayMs,
      typingCharMaxDelayMs
    },
    virk: {
      parallelTabs: clampNumber(
        merged.virk?.parallelTabs,
        DEFAULT_SETTINGS.virk.parallelTabs,
        { min: DEFAULT_LIMITS.batchSizeMin, max: DEFAULT_LIMITS.batchSizeMax }
      ),
      tabWarmupDelayMs: clampNumber(
        merged.virk?.tabWarmupDelayMs,
        DEFAULT_SETTINGS.virk.tabWarmupDelayMs,
        { min: DEFAULT_LIMITS.delayMin, max: DEFAULT_LIMITS.delayMax }
      ),
      searchDelayMs: clampNumber(
        merged.virk?.searchDelayMs,
        DEFAULT_SETTINGS.virk.searchDelayMs,
        { min: DEFAULT_LIMITS.delayMin, max: DEFAULT_LIMITS.delayMax }
      ),
      navigationDelayMs: clampNumber(
        merged.virk?.navigationDelayMs,
        DEFAULT_SETTINGS.virk.navigationDelayMs,
        { min: DEFAULT_LIMITS.delayMin, max: DEFAULT_LIMITS.delayMax }
      ),
      pageLoadDelayMs: clampNumber(
        merged.virk?.pageLoadDelayMs,
        DEFAULT_SETTINGS.virk.pageLoadDelayMs,
        { min: DEFAULT_LIMITS.delayMin, max: DEFAULT_LIMITS.delayMax }
      )
    }
  };
}

export async function getSettings() {
  const stored = await chrome.storage.local.get(SETTINGS_KEY);
  return sanitise(stored[SETTINGS_KEY]);
}

export async function saveSettings(partialSettings) {
  const current = await getSettings();
  const merged = deepMerge(current, partialSettings);
  const sanitised = sanitise(merged);
  await chrome.storage.local.set({ [SETTINGS_KEY]: sanitised });
  return sanitised;
}

export async function resetSettings() {
  const sanitised = sanitise(DEFAULT_SETTINGS);
  await chrome.storage.local.set({ [SETTINGS_KEY]: sanitised });
  return sanitised;
}
