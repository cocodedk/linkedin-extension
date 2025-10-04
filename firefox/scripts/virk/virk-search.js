/**
 * Virk.dk search and navigation functions
 * Handles search form submission and page navigation
 */

import { SELECTORS, TIMING } from './virk-selectors.js';

/**
 * Search for a company on virk.dk
 * @param {string} companyName - Company name to search
 * @returns {Promise<Object>} Result object with success status
 */
export async function searchCompany(companyName) {
  const input = document.querySelector(SELECTORS.searchInput);
  const button = document.querySelector(SELECTORS.searchButton);

  if (!input || !button) {
    return { success: false, error: 'Search elements not found' };
  }

  input.value = companyName;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  button.click();

  return { success: true };
}

/**
 * Click the virksomheder filter on results page
 * @returns {Promise<Object>} Result object with success status
 */
export async function filterToCompanies() {
  const filter = document.querySelector(SELECTORS.virksomhedFilter);

  if (!filter) {
    return { success: false, error: 'Virksomhed filter not found' };
  }

  filter.click();
  return { success: true };
}

/**
 * Navigate to company detail page
 * @param {string} url - URL to navigate to
 * @returns {Promise<Object>} Result object with success status
 */
export async function navigateToDetail(url) {
  if (!url) {
    return { success: false, error: 'No URL provided' };
  }

  window.location.href = url;
  return { success: true };
}

/**
 * Sleep utility for delays
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
