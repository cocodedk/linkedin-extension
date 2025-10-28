/**
 * Firefox notifications API wrapper
 */

const browserApi = globalThis.browser ?? globalThis.chrome;
export const notifications = browserApi.notifications;
