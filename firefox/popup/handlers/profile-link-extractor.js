/**
 * Extract profile links from search results
 * Self-contained for executeScript injection
 */

export function getProfileLinksScript() {
  // XPaths must be inlined - executeScript can't access external constants
  const XPATHS = {
    list: '/html/body/div[7]/div[3]/div[2]/div/div[1]/main/div/div/div/div/ul',
    name: '/div/div/div/div[2]/div[1]/div[1]/div/span[1]/span/a/span/span[1]',
    link: '/div/div/div/div[2]/div[1]/div[1]/div/span[1]/span/a'
  };

  console.log('[Deep Scan] Starting profile extraction...');
  const profiles = [];

  const listItems = document.evaluate(
    `${XPATHS.list}/li`, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null
  );

  console.log(`[Deep Scan] Found ${listItems.snapshotLength} list items`);

  for (let i = 0; i < listItems.snapshotLength; i++) {
    const index = i + 1;
    try {
      const nameNode = document.evaluate(
        `${XPATHS.list}/li[${index}]${XPATHS.name}`,
        document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
      ).singleNodeValue;

      const linkNode = document.evaluate(
        `${XPATHS.list}/li[${index}]${XPATHS.link}`,
        document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
      ).singleNodeValue;

      if (nameNode && linkNode) {
        const name = nameNode.textContent.trim();
        const url = linkNode.href;
        if (name && url && url.includes('/in/')) {
          profiles.push({ name, profileUrl: url });
          console.log(`[Deep Scan] Added profile ${i + 1}: ${name}`);
        }
      } else {
        console.warn(`[Deep Scan] Missing data at index ${index}:`, { 
          nameNode: !!nameNode, 
          linkNode: !!linkNode 
        });
      }
    } catch (error) {
      console.error(`[Deep Scan] Error at ${index}:`, error);
    }
  }

  console.log(`[Deep Scan] Extracted ${profiles.length} profiles`);
  return profiles;
}

