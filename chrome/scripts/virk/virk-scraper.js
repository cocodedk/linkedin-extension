/**
 * Virk.dk data extraction functions
 * Handles parsing company data from virk.dk pages
 */

import { SELECTORS } from './virk-selectors.js';

/**
 * Extract company data from virk.dk detail page
 * @returns {Object} Company data object
 */
export function extractCompanyData() {
  const getData = (selector) => {
    const el = document.querySelector(selector);
    return el?.textContent?.trim() ?? null;
  };

  const postalCodeCity = getData(SELECTORS.postalCodeCity);
  const [postalCode, ...cityParts] = postalCodeCity?.split(' ') ?? [];

  return {
    cvrNumber: getData(SELECTORS.cvrNumber),
    address: getData(SELECTORS.address)?.replace(/\s+/g, ' '),
    postalCode: postalCode ?? null,
    city: cityParts.join(' ') || null,
    startDate: getData(SELECTORS.startDate),
    companyForm: getData(SELECTORS.companyForm),
    status: getData(SELECTORS.status),
    reklamebeskyttelse: getData(SELECTORS.reklamebeskyttelse)?.includes('Ja') ?? false
  };
}

/**
 * Get count of virksomheder (companies) from results page
 * @returns {number} Number of companies found, or 0
 */
export function getCompanyCount() {
  const filterLabel = document.querySelector(SELECTORS.virksomhedFilter);
  if (!filterLabel) return 0;

  const match = filterLabel.textContent.match(/\((\d+)\)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Get the first company detail page link
 * @returns {string|null} URL to company detail page, or null
 */
export function getFirstCompanyLink() {
  const link = document.querySelector(SELECTORS.detailLink);
  if (!link) return null;

  const href = link.getAttribute('href');
  if (!href || !href.includes('/enhed/virksomhed/')) return null;

  // Convert relative URL to absolute if needed
  return href.startsWith('http') ? href : `https://datacvr.virk.dk${href}`;
}
