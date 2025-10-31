/**
 * Lead evaluation handler
 */

import { getLeads, saveLeads, getApiKey } from '../../scripts/storage.js';
import { evaluateLeads } from '../../scripts/evaluation.js';
import { setStatus, renderLeads } from '../ui.js';

export async function handleEvaluate(evaluateBtn, apiKeyInput) {
  const leads = await getLeads();
  if (!leads.length) {
    setStatus('No leads available for evaluation.', 'warning');
    return;
  }

  const apiKey = (await getApiKey()).trim();
  if (!apiKey) {
    setStatus('Add your OpenAI API key first.', 'warning');
    if (apiKeyInput) apiKeyInput.focus();
    return;
  }

  evaluateBtn.disabled = true;
  evaluateBtn.classList.add('evaluating');
  setStatus('Evaluating leads with OpenAI...');

  try {
    const evaluated = await evaluateLeads({
      leads,
      apiKey,
      onProgress: ({ lead, index, total }) => {
        const count = typeof index === 'number' && typeof total === 'number' 
          ? `${index + 1}/${total}` 
          : '';
        const label = lead.name || lead.profileUrl || 'lead';
        setStatus(`Scored ${label}${count ? ` (${count})` : ''}`);
      }
    });

    await saveLeads(evaluated);
    renderLeads(evaluated);
    setStatus('Evaluation complete.', 'success');
  } catch (error) {
    console.error(error);
    setStatus(`Evaluation failed: ${error.message}`, 'error');
  } finally {
    evaluateBtn.disabled = false;
    evaluateBtn.classList.remove('evaluating');
  }
}
