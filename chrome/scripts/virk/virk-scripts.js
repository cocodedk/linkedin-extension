/**
 * Virk.dk script execution helpers
 * Content scripts to run on virk.dk pages
 */

/**
 * Search for company on virk.dk
 */
export function searchScript(companyName) {
  const input = document.querySelector('input#forside-soegefelt-id');
  const button = document.querySelector('button[data-cy="forside-soegefelt-btn"]');
  if (input && button) {
    input.value = companyName;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    button.click();
  }
}

/**
 * Get company count from results page
 */
export function getCountScript() {
  const label = document.querySelector('label[data-cy="soegeresultater-enhedstype-filter-virksomhed"]');
  const match = label?.textContent?.match(/\((\d+)\)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Click virksomhed filter
 */
export function clickFilterScript() {
  const label = document.querySelector('label[data-cy="soegeresultater-enhedstype-filter-virksomhed"]');
  label?.click();
}

/**
 * Navigate to company detail page
 */
export function navigateScript() {
  const link = document.querySelector('a[href*="/enhed/virksomhed/"]');
  if (link) {
    const href = link.getAttribute('href');
    window.location.href = href.startsWith('http') ? href : `https://datacvr.virk.dk${href}`;
  }
}

/**
 * Extract company data from detail page
 */
export function extractDataScript() {
  const get = (cls) => document.querySelector(`.${cls}`)?.textContent?.trim() ?? null;
  const postalCodeCity = get('postnummerOgBy');
  const [postalCode, ...cityParts] = postalCodeCity?.split(' ') ?? [];

  return {
    cvrNumber: get('cvrnummer'),
    address: get('stamdata-bygningsnummer')?.replace(/\s+/g, ' '),
    postalCode: postalCode ?? null,
    city: cityParts.join(' ') || null,
    startDate: get('start-dato'),
    companyForm: document.querySelector('.col-6.col-lg-9.break-word')?.textContent?.trim(),
    status: get('virksomhed-status-label')
  };
}
