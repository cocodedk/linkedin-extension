/**
 * Send a personalised connection request from a LinkedIn profile page.
 * Designed to be executed via chrome.scripting.executeScript.
 */

const ABORT_FLAG = '__linkedinConnectAbortRequested';

function isAbortRequested() {
  return Boolean(window[ABORT_FLAG]);
}

function ensureNotAborted() {
  if (isAbortRequested()) {
    const error = new Error('abort-requested');
    error.name = 'AbortError';
    throw error;
  }
}

function sleep(ms) {
  const duration = Math.max(0, ms);
  if (duration === 0) {
    ensureNotAborted();
    return Promise.resolve();
  }

  const step = Math.min(300, duration);
  const start = Date.now();

  return new Promise((resolve, reject) => {
    function tick() {
      if (isAbortRequested()) {
        reject(new Error('abort-requested'));
        return;
      }

      const elapsed = Date.now() - start;
      if (elapsed >= duration) {
        resolve();
        return;
      }

      setTimeout(tick, Math.min(step, duration - elapsed));
    }

    tick();
  });
}

const TOP_LEVEL_CONNECT_XPATH = '/html/body/div[7]/div[3]/div/div/div[2]/div/div/main/section[1]/div[2]/div[3]/div/button';
const MENU_TRIGGER_XPATH = '/html/body/div[7]/div[3]/div/div/div[2]/div/div/main/section[1]/div[2]/div[3]/div/div[2]/button';
const MENU_CONNECT_XPATH = '/html/body/div[7]/div[3]/div/div/div[2]/div/div/main/section[1]/div[2]/div[3]/div/div[2]/div/div/ul/li[3]/div/span';

function getProfileName() {
  const heading = document.querySelector('main h1, header h1');
  const alt = document.querySelector('img[alt][src*="profile-displayphoto"]');
  const text = heading?.textContent?.trim() || alt?.getAttribute('alt') || '';
  return text.replace(/\s+/g, ' ').trim();
}

function personaliseMessage(template) {
  if (typeof template !== 'string') return '';
  const cleanedTemplate = template.trim();
  if (!cleanedTemplate) return '';

  const fullName = getProfileName();
  const firstName = fullName.split(/\s+/)[0] || '';

  return cleanedTemplate
    .replace(/\{\{\s*name\s*\}\}/gi, fullName)
    .replace(/\{\{\s*first\s*name\s*\}\}/gi, firstName)
    .replace(/\{\{\s*firstname\s*\}\}/gi, firstName)
    .replace(/ {2,}/g, ' ')
    .replace(/\s+([,.!?])/g, '$1')
    .trim();
}

function addJitter(value, variance = 0.15) {
  const numeric = Number(value) || 0;
  const delta = Math.round(numeric * variance);
  const min = Math.max(0, numeric - delta);
  const max = numeric + delta;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getByXPath(xpath) {
  if (!xpath) return null;
  try {
    const result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );
    return result.singleNodeValue ?? null;
  } catch {
    return null;
  }
}

function ensureClickable(element) {
  if (!element) return null;
  return element.closest?.('button,[role="menuitem"],.artdeco-dropdown__item') || element;
}

function labelIncludesConnect(element) {
  if (!element) return false;
  const combined = [
    element.textContent,
    element.getAttribute?.('aria-label'),
    element.getAttribute?.('title')
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return combined.includes('connect');
}

async function triggerConnectFlow() {
  ensureNotAborted();
  const directButton = getByXPath(TOP_LEVEL_CONNECT_XPATH);

  if (directButton && labelIncludesConnect(directButton) && !directButton.matches('[disabled],[aria-disabled="true"]')) {
    directButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await sleep(addJitter(600, 0.4));
    directButton.click();
    console.log('[Connect Automation] Clicked direct connect button.');
    return { success: true };
  }

  const menuTrigger = getByXPath(MENU_TRIGGER_XPATH);
  if (!menuTrigger || menuTrigger.matches?.('[disabled],[aria-disabled="true"]')) {
    return { success: false, reason: 'menu-button-missing' };
  }

  ensureNotAborted();
  menuTrigger.scrollIntoView({ behavior: 'smooth', block: 'center' });
  await sleep(addJitter(400, 0.4));
  menuTrigger.click();
  console.log('[Connect Automation] Opened action menu.');

  await sleep(addJitter(1000, 0.2));

  const menuItem = ensureClickable(getByXPath(MENU_CONNECT_XPATH));
  if (!menuItem) {
    return { success: false, reason: 'menu-connect-missing' };
  }

  if (!labelIncludesConnect(menuItem)) {
    return { success: false, reason: 'menu-connect-unavailable' };
  }

  ensureNotAborted();
  menuItem.click();
  console.log('[Connect Automation] Selected connect option from menu.');

  await sleep(addJitter(500, 0.3));

  return { success: true };
}

async function typeMessage(element, message, minDelay, maxDelay) {
  if (!message) return;
  const safeMin = Math.max(20, Number(minDelay) || 60);
  const safeMax = Math.max(safeMin, Number(maxDelay) || safeMin + 80);
  const inputEventSupported = typeof InputEvent === 'function';

  for (const char of message) {
    if (isAbortRequested()) {
      throw new Error('abort-requested');
    }
    const key = char === '\n' ? 'Enter' : char;
    element.value += char;
    if (inputEventSupported) {
      element.dispatchEvent(new InputEvent('input', { bubbles: true, data: char }));
    } else {
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
    element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    element.dispatchEvent(new KeyboardEvent('keypress', { key, bubbles: true }));
    element.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));
    await sleep(Math.floor(Math.random() * (safeMax - safeMin + 1)) + safeMin);
  }

  element.dispatchEvent(new Event('change', { bubbles: true }));
}

export async function connectWithProfileScript(rawSettings = {}) {
  const logPrefix = '[Connect Automation]';
  const settings = {
    message: personaliseMessage(rawSettings.message || ''),
    initialDelayMs: Number(rawSettings.initialDelayMs) || 20000,
    confirmDelayMs: Number(rawSettings.confirmDelayMs) || 5000,
    messageDelayMs: Number(rawSettings.messageDelayMs) || 1000,
    sendDelayMs: Number(rawSettings.sendDelayMs) || 700,
    typingCharMinDelayMs: Number(rawSettings.typingCharMinDelayMs) || 65,
    typingCharMaxDelayMs: Number(rawSettings.typingCharMaxDelayMs) || 160
  };

  try {
    ensureNotAborted();
    if (!settings.message) {
      console.warn(`${logPrefix} No message provided. Aborting.`);
      return { success: false, reason: 'empty-message' };
    }

    console.log(`${logPrefix} Waiting before attempting to connect...`);
    await sleep(addJitter(settings.initialDelayMs));

    const triggerResult = await triggerConnectFlow();
    if (!triggerResult.success) {
      console.warn(`${logPrefix} Failed to trigger connect flow.`, triggerResult);
      return triggerResult;
    }

    await sleep(addJitter(settings.confirmDelayMs));
    ensureNotAborted();

    const addNoteButton = getByXPath('/html/body/div[4]/div/div/div[3]/button[1]');
    if (!addNoteButton) {
      console.warn(`${logPrefix} Add note button not found.`);
      return { success: false, reason: 'add-note-missing' };
    }

    ensureNotAborted();
    addNoteButton.click();
    console.log(`${logPrefix} Clicked add note.`);

    await sleep(addJitter(settings.messageDelayMs));
    ensureNotAborted();

    const textarea = getByXPath('/html/body/div[4]/div/div/div[2]/div[2]/div[1]/textarea');
    if (!textarea) {
      console.warn(`${logPrefix} Message textarea not found.`);
      return { success: false, reason: 'textarea-missing' };
    }

    textarea.focus();
    textarea.value = '';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    await typeMessage(
      textarea,
      settings.message,
      settings.typingCharMinDelayMs,
      settings.typingCharMaxDelayMs
    );

    await sleep(addJitter(settings.sendDelayMs));

    const sendButton = getByXPath('/html/body/div[4]/div/div/div[3]/button[3]');
    if (!sendButton) {
      console.warn(`${logPrefix} Send button not found.`);
      return { success: false, reason: 'send-button-missing' };
    }

    ensureNotAborted();
    sendButton.click();
    console.log(`${logPrefix} Clicked send.`);

    await sleep(addJitter(1200, 0.4));

    return { success: true };

  } catch (error) {
    if (error instanceof Error && error.message === 'abort-requested') {
      console.warn(`${logPrefix} Automation aborted by user request.`);
      return { success: false, reason: 'aborted' };
    }
    console.error(`${logPrefix} Failed to send connection request:`, error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
