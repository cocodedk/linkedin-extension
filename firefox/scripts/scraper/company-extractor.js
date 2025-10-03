/**
 * Company name extraction logic
 */

import { COMPANY_LIST_ITEM_SELECTOR } from './selectors.js';
import { normaliseText } from './text-utils.js';

export function deriveCompanyImproved({ card, summaryText, headlineText }) {
  const listItems = Array.from(card.querySelectorAll(COMPANY_LIST_ITEM_SELECTOR));
  if (listItems.length > 0) {
    const text = normaliseText(listItems[0]);
    if (text) {
      return text.replace(/[•|,;].*$/, '').trim();
    }
  }

  const sources = [summaryText, headlineText].filter(Boolean);
  for (const text of sources) {
    const atMatch = text.match(/\bat\s+([^•|,;:#]+)\b/i);
    if (atMatch?.[1]) {
      return atMatch[1].trim();
    }

    const atSymbolMatch = text.match(/@\s*([^•|,;:#]+)\b/);
    if (atSymbolMatch?.[1]) {
      return atSymbolMatch[1].trim();
    }
  }

  return '';
}

export function extractCompanyWithFallbacks({ card, companySummary, headline }) {
  let company = deriveCompanyImproved({ 
    card, 
    summaryText: companySummary, 
    headlineText: headline 
  });

  if (!company || company === headline) {
    const candidates = [companySummary, headline].filter(Boolean);
    for (const text of candidates) {
      const mHos = text.match(/\bhos\s+([^•|,;:#]+)\b/i);
      if (mHos?.[1]) {
        company = mHos[1].trim();
        break;
      }

      const mAt = text.match(/\bat\s+([^•|,;:#]+)\b/i);
      if (mAt?.[1]) {
        company = mAt[1].trim();
        break;
      }

      const mAtSym = text.match(/@\s*([^•|,;:#]+)\b/);
      if (mAtSym?.[1]) {
        company = mAtSym[1].trim();
        break;
      }
    }

    if (company === headline) {
      company = '';
    }
  }

  return company;
}

