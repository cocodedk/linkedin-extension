/**
 * File System Access API export functionality
 */

export async function saveWithFileSystemAPI(content, filename) {
  if (!content) {
    throw new Error('No content to save');
  }

  // Feature detection - File System Access API requires Chrome 86+
  if (!window.showSaveFilePicker) {
    throw new Error('File System Access API not supported in this browser');
  }

  try {
    const fileHandle = await window.showSaveFilePicker({
      suggestedName: filename,
      types: [
        {
          description: filename.endsWith('.csv') ? 'CSV files' : 'JSON files',
          accept: {
            [filename.endsWith('.csv') ? 'text/csv' : 'application/json']: [
              filename.endsWith('.csv') ? '.csv' : '.json'
            ]
          }
        }
      ]
    });

    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();

    return { success: true, message: `${filename} saved successfully` };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Save cancelled by user');
    }
    throw new Error(`Failed to save file: ${error.message}`);
  }
}
