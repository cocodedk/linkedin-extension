/**
 * Main popup controller - orchestrates UI and event handling
 */

import { setupEventListeners } from './popup/popup-events.js';
import { initializePopup } from './popup/popup-init.js';

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await initializePopup();
});
