/**
 * Cross-browser API compatibility layer
 */

export const browserApi = globalThis.browser ?? globalThis.chrome;
