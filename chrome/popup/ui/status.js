/**
 * Status message display
 */

const statusEl = document.getElementById('status');

export function setStatus(message, type = 'info') {
  statusEl.textContent = message;
  statusEl.dataset.type = type;
}
