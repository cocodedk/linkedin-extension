/**
 * Settings management helpers with sane defaults and validation.
 * Allows tweaking timeouts and concurrency to avoid Linkedin limits.
 *
 * The defaults, validators and per-section sanitisers live in sibling
 * settings-*.js modules (see settings-defaults.js, settings-validators.js,
 * settings-sanitise.js, settings-sanitise-connect.js) so each file stays
 * under the repo's line limit. This file is the public API surface that
 * the rest of the extension imports from.
 */

import { DEFAULT_SETTINGS } from './settings-defaults.js';
import { deepMerge } from './settings-validators.js';
import { sanitise } from './settings-sanitise.js';

const SETTINGS_KEY = 'extensionSettings';

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
