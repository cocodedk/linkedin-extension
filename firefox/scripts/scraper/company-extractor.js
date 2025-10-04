/**
 * Company name extraction logic
 */

import { normaliseText } from './text-utils.js';

export function extractCompany({ card, companySummary, headline }) {
  // Try list item first (most reliable)
  const listItem = card.querySelector('.entity-result__summary-list li');
  if (listItem) {
    const text = normaliseText(listItem);
    if (text) return text.replace(/[•|,;].*$/, '').trim();
  }

  // Try pattern matching from summary or headline
  const sources = [companySummary, headline].filter(Boolean);
  for (const text of sources) {
    const atMatch = text.match(/\bat\s+([^•|,;:#]+)\b/i);
    if (atMatch?.[1]) return atMatch[1].trim();
    
    const atSymbol = text.match(/@\s*([^•|,;:#]+)\b/);
    if (atSymbol?.[1]) return atSymbol[1].trim();
  }
  
  return '';
}
