/**
 * Clipboard export functionality
 */

export async function copyToClipboard(content, filename) {
  if (!content) {
    throw new Error('No content to copy');
  }

  if (!navigator.clipboard || !navigator.clipboard.writeText) {
    throw new Error('Clipboard API not available');
  }

  try {
    await navigator.clipboard.writeText(content);
    return { success: true, message: `${filename} copied to clipboard!` };
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      throw new Error('Clipboard permission denied. Please allow clipboard access.');
    }
    throw new Error(`Failed to copy to clipboard: ${error.message}`);
  }
}
