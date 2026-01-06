/**
 * Toast notification with inline styles (CSS-independent)
 */

export function showToast(message, type = 'info') {
  // Remove existing toast if any
  const existing = document.getElementById('settings-toast');
  if (existing) existing.remove();

  // Create toast element
  const toast = document.createElement('div');
  toast.id = 'settings-toast';
  toast.textContent = message;

  // Colors based on type
  const colors = {
    success: { bg: '#10b981', text: '#ffffff' },
    error: { bg: '#ef4444', text: '#ffffff' },
    info: { bg: '#3b82f6', text: '#ffffff' }
  };
  const color = colors[type] || colors.info;

  // Apply inline styles
  Object.assign(toast.style, {
    position: 'fixed',
    top: '24px',
    left: '24px',
    padding: '16px 24px',
    backgroundColor: color.bg,
    color: color.text,
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
    zIndex: '10000',
    opacity: '0',
    transform: 'translateY(-20px)',
    transition: 'opacity 0.3s, transform 0.3s',
    minWidth: '200px',
    textAlign: 'center'
  });

  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  // Auto-remove after delay
  const duration = type === 'error' ? 5000 : 3000;
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
