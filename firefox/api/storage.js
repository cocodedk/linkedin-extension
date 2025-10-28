/**
 * Firefox storage API wrapper
 */

const browserApi = globalThis.browser ?? globalThis.chrome;
export const storage = browserApi.storage;
