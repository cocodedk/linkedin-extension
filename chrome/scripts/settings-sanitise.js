/**
 * Composes the full sanitised settings object from the per-section
 * sanitisers. Split out of settings.js so each settings module stays small.
 */

import { DEFAULT_SETTINGS, DEFAULT_LIMITS } from './settings-defaults.js';
import { deepMerge, clampNumber } from './settings-validators.js';
import { sanitiseConnectAutomation, sanitiseVirk } from './settings-sanitise-connect.js';

function sanitiseDeepScan(merged) {
  return {
    profileLoadDelayMs: clampNumber(
      merged.deepScan?.profileLoadDelayMs,
      DEFAULT_SETTINGS.deepScan.profileLoadDelayMs,
      { min: DEFAULT_LIMITS.delayMin, max: DEFAULT_LIMITS.delayMax }
    ),
    batchSize: clampNumber(merged.deepScan?.batchSize, DEFAULT_SETTINGS.deepScan.batchSize, {
      min: DEFAULT_LIMITS.batchSizeMin,
      max: DEFAULT_LIMITS.batchSizeMax
    }),
    batchDelayMs: clampNumber(
      merged.deepScan?.batchDelayMs,
      DEFAULT_SETTINGS.deepScan.batchDelayMs,
      { min: DEFAULT_LIMITS.delayMin, max: DEFAULT_LIMITS.delayMax }
    )
  };
}

function sanitiseDeepScanAll(merged) {
  return {
    maxPages: clampNumber(merged.deepScanAll?.maxPages, DEFAULT_SETTINGS.deepScanAll.maxPages, {
      min: DEFAULT_LIMITS.pagesMin,
      max: DEFAULT_LIMITS.pagesMax
    }),
    pageDelayMs: clampNumber(
      merged.deepScanAll?.pageDelayMs,
      DEFAULT_SETTINGS.deepScanAll.pageDelayMs,
      { min: DEFAULT_LIMITS.delayMin, max: DEFAULT_LIMITS.delayMax }
    )
  };
}

export function sanitise(settings) {
  const merged = deepMerge(DEFAULT_SETTINGS, settings ?? {});

  return {
    deepScan: sanitiseDeepScan(merged),
    deepScanAll: sanitiseDeepScanAll(merged),
    connectAutomation: sanitiseConnectAutomation(merged),
    virk: sanitiseVirk(merged)
  };
}
