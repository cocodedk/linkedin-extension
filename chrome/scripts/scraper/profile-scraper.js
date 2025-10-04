/**
 * Fallback scraper for individual profile pages
 */

import { normaliseText } from './text-utils.js';

export function scrapeProfilePage() {
  const profileUrl = location?.href || '';
  const name = normaliseText(document.querySelector('main h1, h1'));
  const headline = normaliseText(document.querySelector('[class*="text-body-medium"]'));
  const locationText = normaliseText(document.querySelector('[class*="text-body-small"]'));

  return {
    name,
    headline,
    company: '',
    location: locationText,
    contact: profileUrl,
    contactLinks: profileUrl ? [{ href: profileUrl, label: 'LinkedIn', type: 'linkedin' }] : [],
    profileUrl
  };
}
