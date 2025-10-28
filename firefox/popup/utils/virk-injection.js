/**
 * Virk DataCVR query injection logic
 */

export function injectVirkQuery({ value }) {
  const setInputValue = inputElement => {
    const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
    if (descriptor?.set) {
      descriptor.set.call(inputElement, value);
    } else {
      inputElement.value = value;
    }

    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    inputElement.dispatchEvent(new Event('change', { bubbles: true }));
    inputElement.focus();
  };

  const pickElement = selectorList => {
    for (const selector of selectorList) {
      const node = document.querySelector(selector);
      if (node instanceof HTMLElement) {
        return node;
      }
    }
    return null;
  };

  const input = pickElement([
    'input#searchstring',
    'input[name="search"]',
    'input[aria-label*="Søg"]',
    'input[placeholder*="Søg"]',
    'input[type="search"]'
  ]);

  if (!(input instanceof HTMLInputElement)) {
    return { success: false, message: 'Unable to locate DataCVR search box.' };
  }

  setInputValue(input);

  let triggered = false;

  const submitTargets = [
    'button[type="submit"]',
    'button[data-testid="search-button"]',
    'button[data-test="search-button"]',
    'button[aria-label*="Søg"]',
    'button[title*="Søg"]',
    'a[role="button"][aria-label*="Søg"]'
  ];

  const submitButton = pickElement(submitTargets);
  if (submitButton) {
    submitButton.click();
    triggered = true;
  }

  if (!triggered) {
    const form = input.closest('form');
    if (form instanceof HTMLFormElement) {
      const submitted = form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true })
      );
      if (submitted) {
        form.requestSubmit?.();
        triggered = true;
      }
    }
  }

  if (!triggered) {
    const eventInit = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true };
    input.dispatchEvent(new KeyboardEvent('keydown', eventInit));
    input.dispatchEvent(new KeyboardEvent('keypress', eventInit));
    input.dispatchEvent(new KeyboardEvent('keyup', eventInit));
  }

  return { success: true };
}
