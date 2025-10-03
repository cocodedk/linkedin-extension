/**
 * Profile page scraping (fallback when no cards found)
 */

import { normaliseText } from './text-utils.js';
import { extractContactInfoFromProfileDoc } from './contact-extractor.js';

export function scrapeProfilePage() {
  const profileUrl = (typeof location !== 'undefined' && location.href) 
    ? location.href 
    : (document.location?.href || '');

  const name = normaliseText(document.querySelector('main h1, h1')) 
    || normaliseText(document.querySelector('img[alt]'));

  const headline = normaliseText(
    document.querySelector('[class*="text-body-medium"], [class*="pv-text-details__left-panel"] div')
  );

  const locationText = normaliseText(
    document.querySelector('[class*="text-body-small"], [class*="pv-text-details__left-panel"] [class*="t-black--light"]')
  );

  const { contacts, links } = extractContactInfoFromProfileDoc(document);
  const contact = contacts.join(' | ') || profileUrl;

  return {
    name,
    headline,
    company: '',
    location: locationText,
    contact,
    contactLinks: links.length 
      ? links 
      : (profileUrl ? [{ href: profileUrl, label: 'LinkedIn', type: 'linkedin' }] : []),
    profileUrl
  };
}

