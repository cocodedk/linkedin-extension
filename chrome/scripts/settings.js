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
  pagesMax: 500
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

function sanitise(settings) {
  const merged = deepMerge(DEFAULT_SETTINGS, settings ?? {});

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
