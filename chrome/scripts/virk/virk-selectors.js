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
  detailLink: 'a.button.button-unstyled[aria-label*="Vis mere"]',
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
 * Optimized based on actual timing measurements
 */
export const TIMING = {
  searchDelay: 1500,      // Wait after search submission (page loads quickly)
  navigationDelay: 1500,  // Wait after clicking filter (results render quickly)
  pageLoadDelay: 6000     // Wait for detail page to load (critical for data extraction)
};
