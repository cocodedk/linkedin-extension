/**
 * Generic, domain-agnostic validation primitives used to sanitise settings.
 * Split out of settings.js so each settings module stays small.
 */

export function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

export function deepMerge(base, override) {
  if (!isPlainObject(base)) {
    return override;
  }
  if (!isPlainObject(override)) {
    return base;
  }

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

export function clampNumber(
  value,
  fallback,
  { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER } = {}
) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  const rounded = Math.round(numeric);
  return Math.min(max, Math.max(min, rounded));
}

export function sanitiseBoolean(value, fallback = false) {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalised = value.trim().toLowerCase();
    if (normalised === 'true') {
      return true;
    }
    if (normalised === 'false') {
      return false;
    }
  }
  return fallback;
}

export function sanitiseString(value, fallback = '', { maxLength = 255 } = {}) {
  if (typeof value !== 'string') {
    return fallback;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  if (trimmed.length > maxLength) {
    return trimmed.slice(0, maxLength);
  }
  return trimmed;
}
