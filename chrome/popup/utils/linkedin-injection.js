/**
 * LinkedIn query injection logic
 */

export function injectLinkedInQuery({ value }) {
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
    'input.search-global-typeahead__input',
    'input[data-view-name="search-global-typeahead-input"]',
    'input[role="combobox"][aria-label="Search"]'
  ]);

  if (!(input instanceof HTMLInputElement)) {
    return { success: false, message: 'Unable to locate LinkedIn search box.' };
  }

  setInputValue(input);
  return { success: true };
}
