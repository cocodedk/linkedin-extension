/**
 * New tab export functionality
 */

import { tabs } from '../../api/tabs.js';

export async function openInNewTab(content, filename, mimeType) {
  if (!content) {
    throw new Error('No content to display');
  }

  if (!chrome?.tabs?.create) {
    throw new Error('Tabs API not available');
  }

  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    await tabs.create({
      url,
      active: true
    });

    // Clean up blob URL after a delay to ensure tab loads
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);

    return { success: true, message: `${filename} opened in new tab` };
  } catch (error) {
    throw new Error(`Failed to open in new tab: ${error.message}`);
  }
}
