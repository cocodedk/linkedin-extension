/**
 * AI query generation handler
 */

import { getApiKey, setLastAiQuery, getLastAiQuery } from '../../scripts/storage.js';
import { generateAiSearchQuery } from '../../scripts/ai-query.js';
import { setStatus } from '../ui.js';
import { getActiveTabId, injectQueryIntoLinkedIn } from '../chrome-utils.js';

export async function handleGenerateAiQuery(generateAiQueryBtn, apiKeyInput) {
  const apiKey = (await getApiKey()).trim();
  if (!apiKey) {
    setStatus('Add your OpenAI API key first.', 'warning');
    apiKeyInput.focus();
    return;
  }

  const suggestion = await getLastAiQuery();
  const defaultPrompt = suggestion?.icpDescription ?? '';
  const icpDescription = window.prompt(
    'Describe who you want to find on LinkedIn:',
    defaultPrompt ?? ''
  );

  if (icpDescription === null) {
    setStatus('AI query cancelled.');
    return;
  }

  const trimmedDescription = icpDescription.trim();
  if (!trimmedDescription) {
    setStatus('Provide a brief description so AI can help.', 'warning');
    return;
  }

  generateAiQueryBtn.disabled = true;
  setStatus('Generating LinkedIn query with AI...');

  try {
    const { query, summary } = await generateAiSearchQuery({
      apiKey,
      icpDescription: trimmedDescription
    });

    const reviewed = window.prompt(
      'Review the AI query before inserting into LinkedIn:',
      query
    );

    if (reviewed === null) {
      setStatus('AI query insertion cancelled.');
      return;
    }

    const finalQuery = reviewed.trim();
    if (!finalQuery) {
      setStatus('AI query was cleared. Nothing inserted.', 'warning');
      return;
    }

    const tabId = await getActiveTabId();
    await injectQueryIntoLinkedIn({ tabId, query: finalQuery });
    await setLastAiQuery({
      icpDescription: trimmedDescription,
      query: finalQuery,
      summary,
      generatedAt: new Date().toISOString()
    });

    setStatus('AI query inserted. Press enter in LinkedIn to search.', 'success');
  } catch (error) {
    console.error(error);
    setStatus(`AI query failed: ${error.message}`, 'error');
  } finally {
    generateAiQueryBtn.disabled = false;
  }
}

