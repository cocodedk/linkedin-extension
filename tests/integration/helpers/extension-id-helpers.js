/**
 * Helper functions for extension ID detection
 */

async function findExtensionInPages(context) {
  const pages = context.pages();
  console.log(
    'Available pages:',
    pages.map((p) => ({ url: p.url(), title: p.title() }))
  );
  for (const p of pages) {
    const url = p.url();
    if (url.startsWith('chrome-extension://')) {
      const matches = url.match(/chrome-extension:\/\/([a-z]{32})/);
      if (matches && matches[1]) {
        return matches[1];
      }
    }
  }
  return null;
}

async function waitForExtensionPage(context) {
  try {
    const extensionPage = await context.waitForEvent('page', {
      predicate: (p) => p.url().includes('chrome-extension://'),
      timeout: 10000
    });
    const url = extensionPage.url();
    const matches = url.match(/chrome-extension:\/\/([a-z]{32})/);
    if (matches && matches[1]) {
      return matches[1];
    }
  } catch (e) {
    // Timeout waiting for extension page
  }
  return null;
}

export { findExtensionInPages, waitForExtensionPage };
