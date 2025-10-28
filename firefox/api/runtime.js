/**
 * Firefox runtime API wrapper
 */

const browserApi = globalThis.browser ?? globalThis.chrome;
export const runtime = browserApi.runtime;
