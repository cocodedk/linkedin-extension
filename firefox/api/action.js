/**
 * Firefox action API wrapper (for badge)
 */

const browserApi = globalThis.browser ?? globalThis.chrome;
export const action = browserApi.action;
