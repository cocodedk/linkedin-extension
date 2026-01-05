/**
 * Delay utilities for extension testing
 */

const DELAY_MS = 4000; // 4 second delay between operations

/**
 * Delay helper - wait for specified milliseconds (default 4 seconds)
 */
export async function delay(ms = DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Perform action with delay
 */
export async function actionWithDelay(action, delayMs = DELAY_MS) {
  await action();
  await delay(delayMs);
}
