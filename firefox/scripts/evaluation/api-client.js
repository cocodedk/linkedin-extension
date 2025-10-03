/**
 * OpenAI API client
 */

import { OPENAI_URL, DEFAULT_MODEL, SYSTEM_PROMPT, USER_PROMPT_TEMPLATE } from './constants.js';
import { extractJson, prepareLeadPayload } from './json-parser.js';

export async function requestCompletion({ apiKey, lead }) {
  const payloadLead = prepareLeadPayload(lead);
  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: USER_PROMPT_TEMPLATE(payloadLead)
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const text = payload?.choices?.[0]?.message?.content ?? '';
  const parsed = extractJson(text);

  if (parsed) {
    return {
      ...lead,
      aiScore: parsed.aiScore ?? parsed.score ?? null,
      aiReasons: parsed.aiReasons ?? parsed.reasons ?? '',
      aiFitSummary: parsed.aiFitSummary ?? parsed.fitSummary ?? parsed.aiFit ?? ''
    };
  }

  return {
    ...lead,
    aiScore: null,
    aiReasons: text || 'Unable to parse AI response as JSON.',
    aiFitSummary: 'No FITS summary available.'
  };
}

