/**
 * Settings handlers
 */

import { setApiKey } from '../../scripts/storage.js';
import { setStatus } from '../ui.js';

export async function handleSaveApiKey(apiKeyInput) {
  const apiKey = apiKeyInput.value.trim();
  await setApiKey(apiKey);
  setStatus(apiKey ? 'API key saved.' : 'API key cleared.', 'success');
}
