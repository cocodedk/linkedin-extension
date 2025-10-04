/**
 * DOM selectors for virk.dk (datacvr.virk.dk)
 * Centralized selector constants for easy maintenance
 */

export const SELECTORS = {
  // Search form elements
  searchInput: 'input#forside-soegefelt-id',
  searchButton: 'button[data-cy="forside-soegefelt-btn"]',

  // Results page elements
  virksomhedFilter: 'label[data-cy="soegeresultater-enhedstype-filter-virksomhed"]',
  detailLink: 'a[href*="/enhed/virksomhed/"]',
  resultRow: '.soegeresultaterTabel .row',

  // Detail page elements
  cvrNumber: '.cvrnummer',
  address: '.stamdata-bygningsnummer',
  postalCodeCity: '.postnummerOgBy',
  startDate: '.start-dato',
  companyForm: '.col-6.col-lg-9.break-word',
  status: '.virksomhed-status-label',
  reklamebeskyttelse: '.ja-label0'
};

/**
 * Timing constants for virk.dk operations
 */
export const TIMING = {
  searchDelay: 2000,      // Wait after search submission
  navigationDelay: 1000,  // Wait after clicking filter/link
  pageLoadDelay: 2000     // Wait for page load after navigation
};
