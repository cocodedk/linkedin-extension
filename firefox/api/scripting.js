/**
 * Firefox scripting API wrapper
 */

const browserApi = globalThis.browser ?? globalThis.chrome;
export const scripting = browserApi.scripting;
