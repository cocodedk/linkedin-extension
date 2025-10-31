/**
 * Firefox downloads API wrapper
 */

const browserApi = globalThis.browser ?? globalThis.chrome;
export const downloads = browserApi.downloads;
