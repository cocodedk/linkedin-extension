/**
 * Sanitisers for the connectAutomation and virk settings sections.
 * Split out of settings.js so each settings module stays small.
 */

import { DEFAULT_SETTINGS, DEFAULT_LIMITS } from './settings-defaults.js';
import { clampNumber, sanitiseBoolean, sanitiseString } from './settings-validators.js';

export function sanitiseConnectAutomation(merged) {
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
  };
}

export function sanitiseVirk(merged) {
  return {
    parallelTabs: clampNumber(merged.virk?.parallelTabs, DEFAULT_SETTINGS.virk.parallelTabs, {
      min: DEFAULT_LIMITS.batchSizeMin,
      max: DEFAULT_LIMITS.batchSizeMax
    }),
    tabWarmupDelayMs: clampNumber(
      merged.virk?.tabWarmupDelayMs,
      DEFAULT_SETTINGS.virk.tabWarmupDelayMs,
      { min: DEFAULT_LIMITS.delayMin, max: DEFAULT_LIMITS.delayMax }
    ),
    searchDelayMs: clampNumber(merged.virk?.searchDelayMs, DEFAULT_SETTINGS.virk.searchDelayMs, {
      min: DEFAULT_LIMITS.delayMin,
      max: DEFAULT_LIMITS.delayMax
    }),
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
  };
}
