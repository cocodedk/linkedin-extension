/**
 * Lead evaluation orchestrator
 */

import { requestCompletion } from './evaluation/api-client.js';

export async function evaluateLeads({ leads, apiKey, signal, onProgress }) {
  if (!apiKey) {
    throw new Error('OpenAI API key is required.');
  }

  const total = leads.length;
  console.info('[LinkedIn Extension] Starting lead evaluation', { count: total });

  const results = [];
  for (let index = 0; index < total; index += 1) {
    const lead = leads[index];

    if (signal?.aborted) {
      throw new Error('Evaluation cancelled.');
    }

    const identifier = lead.name || lead.profileUrl || 'unknown lead';
    console.debug('[LinkedIn Extension] Evaluating lead', {
      identifier,
      index: index + 1,
      total
    });

    try {
      const evaluated = await requestCompletion({ apiKey, lead });
      results.push(evaluated);
      onProgress?.({ lead: evaluated, status: 'success', index, total });
    } catch (error) {
      const failedLead = {
        ...lead,
        aiScore: null,
        aiReasons: error.message,
        aiFitSummary: 'FITS summary unavailable due to evaluation error.'
      };
      results.push(failedLead);
      console.warn('[LinkedIn Extension] Evaluation failed', {
        lead: identifier,
        error: error.message
      });
      onProgress?.({ lead: failedLead, status: 'error', error, index, total });
    }
  }

  console.info('[LinkedIn Extension] Lead evaluation complete');
  return results;
}
