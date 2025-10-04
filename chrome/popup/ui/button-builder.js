/**
 * Reusable button component builder
 * Creates consistent buttons with icons across popup and full-page views
 */

import { BUTTON_CONFIGS } from './button-configs.js';

/**
 * Create a button element with icon and label
 * @param {string} configKey - Key from BUTTON_CONFIGS
 * @param {Object} options - Options for customization
 * @param {boolean} options.iconOnly - Show only icon (for compact mode)
 * @param {string} options.className - Additional CSS class
 * @returns {HTMLButtonElement} Button element
 */
export function createButton(configKey, options = {}) {
  const config = BUTTON_CONFIGS[configKey];
  if (!config) {
    throw new Error(`Unknown button config: ${configKey}`);
  }

  const button = document.createElement('button');
  button.id = config.id;
  button.title = config.title;
  button.setAttribute('aria-label', config.title);

  if (options.className) {
    button.className = options.className;
  }

  if (options.iconOnly) {
    button.textContent = config.icon;
    button.classList.add('icon-btn');
  } else {
    button.textContent = `${config.icon} ${config.label}`;
  }

  return button;
}
