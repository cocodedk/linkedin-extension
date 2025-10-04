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
 * Handles both unfiltered (with filter labels) and filtered (direct results) pages
 */
export function getCountScript() {
  try {
    const url = window.location.href;
    const isFiltered = url.includes('enhedstype=virksomhed');

    if (isFiltered) {
      // On filtered page, count rows in results table
      const resultsTable = document.querySelector('[data-cy="soegeresultater-tabel"]');

      if (resultsTable) {
        const rows = resultsTable.querySelectorAll('.row');

        return {
          count: rows.length,
          labelText: 'FROM_TABLE',
          alreadyFiltered: true,
          allFilters: [],
          debugInfo: {
            isFiltered: true,
            tableFound: true,
            rowCount: rows.length,
            tableHTML: resultsTable.outerHTML,
            firstRowHTML: rows.length > 0 ? rows[0].outerHTML : null,
            url: window.location.href,
            documentTitle: document.title,
            readyState: document.readyState
          }
        };
      } else {
        const allDataCy = document.querySelectorAll('[data-cy]');
        return {
          count: 0,
          labelText: 'NO_TABLE',
          alreadyFiltered: false,
          allFilters: [],
          debugInfo: {
            isFiltered: true,
            tableFound: false,
            bodyHTML: document.body.innerHTML,
            allDataCy: Array.from(allDataCy).map(el => el.getAttribute('data-cy')),
            url: window.location.href,
            documentTitle: document.title,
            readyState: document.readyState
          }
        };
      }
    }

    // On unfiltered page, check for filter label
    const label = document.querySelector('label[data-cy="soegeresultater-enhedstype-filter-virksomhed"]');

    if (label) {
      const labelText = label.textContent.trim();
      const match = labelText.match(/\((\d+)\)/);

      if (match) {
        const count = parseInt(match[1], 10);
        return {
          count,
          labelText,
          alreadyFiltered: false,
          allFilters: [],
          debugInfo: {
            isFiltered: false,
            labelFound: true,
            labelHTML: label.outerHTML,
            url: window.location.href
          }
        };
      }
    }

    // Check if Vue.js app has rendered (no results scenario)
    const appDiv = document.querySelector('#app');
    const vueRendered = appDiv && appDiv.innerHTML.length > 1000;

    const allDataCy = document.querySelectorAll('[data-cy]');
    const hasSearchResults = Array.from(allDataCy).some(el =>
      el.getAttribute('data-cy')?.includes('soegeresultater')
    );

    return {
      count: 0,
      labelText: hasSearchResults ? 'NO_RESULTS' : 'LOADING',
      alreadyFiltered: false,
      allFilters: [],
      debugInfo: {
        isFiltered: false,
        labelFound: false,
        vueRendered,
        hasSearchResults,
        appDivLength: appDiv?.innerHTML?.length || 0,
        bodyHTML: document.body.innerHTML,
        allDataCy: Array.from(allDataCy).map(el => el.getAttribute('data-cy')),
        url: window.location.href,
        documentTitle: document.title,
        readyState: document.readyState
      }
    };

  } catch (error) {
    return {
      count: 0,
      labelText: 'ERROR',
      error: error.message,
      alreadyFiltered: false,
      allFilters: [],
      debugInfo: {
        errorMessage: error.message,
        errorStack: error.stack,
        url: window.location.href
      }
    };
  }
}

/**
 * Click virksomhed filter
 */
export function clickFilterScript() {
  try {
    const label = document.querySelector('label[data-cy="soegeresultater-enhedstype-filter-virksomhed"]');
    if (label) {
      console.log('[Virk Page] Clicking company filter');
      label.click();
    } else {
      console.error('[Virk Page] Filter label not found');
    }
  } catch (error) {
    console.error('[Virk Page] Error clicking filter:', error);
  }
}

/**
 * Navigate to company detail page (first result)
 */
export function navigateScript() {
  try {
    console.log('[Virk Page] Starting navigation...');

    // Find the first "Vis mere" link in the results table
    const resultsTable = document.querySelector('[data-cy="soegeresultater-tabel"]');
    console.log('[Virk Page] Results table found:', !!resultsTable);

    if (!resultsTable) {
      console.error('[Virk Page] No results table found');
      return;
    }

    // Get company name from the result row
    const firstRow = resultsTable.querySelector('.row');
    console.log('[Virk Page] First row found:', !!firstRow);

    if (!firstRow) {
      console.error('[Virk Page] No result rows found in table');
      return;
    }

    const companyNameEl = firstRow.querySelector('.bold.value');
    const companyName = companyNameEl?.textContent?.trim() || 'Unknown';

    console.log(`[Virk Page] Found company: "${companyName}"`);

    // Find the "Vis mere" link with data-cy="vis-mere"
    const viseMereContainer = firstRow.querySelector('[data-cy="vis-mere"]');
    console.log('[Virk Page] Vis mere container found:', !!viseMereContainer);

    if (!viseMereContainer) {
      console.error('[Virk Page] No vis-mere container found');
      return;
    }

    const link = viseMereContainer.querySelector('a.button.button-unstyled');
    console.log('[Virk Page] Link found:', !!link);

    if (!link) {
      console.error('[Virk Page] No link found in vis-mere container');
      return;
    }

    const href = link.getAttribute('href');
    console.log('[Virk Page] Link href:', href);

    if (href) {
      const fullUrl = href.startsWith('http') ? href : `https://datacvr.virk.dk${href}`;
      console.log(`[Virk Page] Navigating to: ${fullUrl}`);
      window.location.href = fullUrl;
    } else {
      console.error('[Virk Page] Link has no href attribute');
    }
  } catch (error) {
    console.error('[Virk Page] Error navigating:', error);
  }
}

/**
 * Extract company data from detail page
 */
export function extractDataScript() {
  try {
    const get = (cls) => document.querySelector(`.${cls}`)?.textContent?.trim() ?? null;

    // Get company name from page
    const companyNameEl = document.querySelector('h1');
    const companyName = companyNameEl?.textContent?.trim() || 'Unknown';
    console.log(`[Virk Page] Extracting data from company page: "${companyName}"`);

    const postalCodeCity = get('postnummerOgBy');
    const [postalCode, ...cityParts] = postalCodeCity?.split(' ') ?? [];

    const data = {
      cvrNumber: get('cvrnummer'),
      address: get('stamdata-bygningsnummer')?.replace(/\s+/g, ' '),
      postalCode: postalCode ?? null,
      city: cityParts.join(' ') || null,
      startDate: get('start-dato'),
      companyForm: document.querySelector('.col-6.col-lg-9.break-word')?.textContent?.trim(),
      status: get('virksomhed-status-label')
    };

    console.log(`[Virk Page] Extracted data from "${companyName}":`, data);
    return data;
  } catch (error) {
    console.error('[Virk Page] Error extracting data:', error);
    return {};
  }
}
