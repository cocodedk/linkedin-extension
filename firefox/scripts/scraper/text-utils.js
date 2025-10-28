/**
 * Text normalization utilities
 */

export function normaliseText(node) {
  if (!node) return '';

  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent?.replace(/\s+/g, ' ')?.trim() ?? '';
  }

  if (!(node instanceof Element)) {
    return String(node?.textContent ?? '').replace(/\s+/g, ' ').trim();
  }

  const clone = node.cloneNode(true);
  clone.querySelectorAll('.visually-hidden, script, style').forEach((h) => h.remove());
  const text = clone.textContent?.replace(/\s+/g, ' ')?.trim() ?? '';
  return text.replace(/\bStatus is offline\b/gi, '').trim();
}
