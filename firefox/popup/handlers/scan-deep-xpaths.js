/**
 * XPath constants for LinkedIn deep scanning
 * NOTE: These must be inlined in functions for executeScript injection
 */

export const SEARCH_RESULTS_XPATHS = {
  list: '/html/body/div[7]/div[3]/div[2]/div/div[1]/main/div/div/div/div/ul',
  name: '/div/div/div/div[2]/div[1]/div[1]/div/span[1]/span/a/span/span[1]',
  link: '/div/div/div/div[2]/div[1]/div[1]/div/span[1]/span/a'
};

export const PROFILE_XPATHS = {
  company: '/html/body/div[7]/div[3]/div/div/div[2]/div/div/main/section[1]/div[2]/div[2]/ul/li[1]/button/span/div'
};

