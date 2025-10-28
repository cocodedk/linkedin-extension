/**
 * Firefox tabs API wrapper
 */

const browserApi = globalThis.browser ?? globalThis.chrome;
export const tabs = browserApi.tabs;
