export const PROFILE_URL_PATTERN = /linkedin\.com\/in\//i;
export const AUTO_CONNECT_STATE_KEY = 'isAutoConnectRunning';
export const AUTO_CONNECT_MODE_KEY = 'autoConnectMode';
export const ABORT_FLAG_KEY = '__linkedinConnectAbortRequested';

export function normaliseConnectSettings(raw) {
  if (!raw) return null;
  const {
    message = '',
    initialDelayMs,
    confirmDelayMs,
    messageDelayMs,
    sendDelayMs,
    typingCharMinDelayMs,
    typingCharMaxDelayMs
  } = raw;

  return {
    message: (message || '').trim(),
    initialDelayMs: Number(initialDelayMs) || 0,
    confirmDelayMs: Number(confirmDelayMs) || 0,
    messageDelayMs: Number(messageDelayMs) || 0,
    sendDelayMs: Number(sendDelayMs) || 0,
    typingCharMinDelayMs: Number(typingCharMinDelayMs) || 0,
    typingCharMaxDelayMs: Number(typingCharMaxDelayMs) || 0
  };
}

export function describeConnectFailure(result) {
  if (!result) return 'Connect flow did not report a result.';

  switch (result.reason) {
    case 'empty-message':
      return 'Connection message is empty.';
    case 'connect-button-missing':
      return 'Connect button not available on this profile.';
    case 'connect-button-unavailable':
      return 'This profile cannot be contacted via the Connect button.';
    case 'add-note-missing':
      return 'LinkedIn did not show the “Add note” button.';
    case 'textarea-missing':
      return 'Message textbox not found.';
    case 'send-button-missing':
      return 'Send button not found.';
    case 'menu-button-missing':
      return 'The action menu was not available on this profile.';
    case 'menu-connect-missing':
      return 'Could not find the Connect option inside the action menu.';
    case 'menu-connect-unavailable':
      return 'The menu did not contain a Connect option.';
    case 'aborted':
      return 'Auto connect was cancelled by request.';
    default:
      return result.error || 'Unknown issue prevented sending the connection.';
  }
}
