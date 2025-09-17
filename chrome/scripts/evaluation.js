const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4o-mini';

const SYSTEM_PROMPT = 'You are an assistant evaluating prospects for FITS, a GRC automation tool. Respond with JSON containing aiScore (0-100), aiReasons (summary of why the score was chosen), and aiFitSummary (1-2 sentences describing how FITS could help this lead).';

async function requestCompletion({ apiKey, lead }) {
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
          content: `Evaluate how well FITS (a GRC automation platform) fits this lead. Respond ONLY in JSON.\nLead: ${JSON.stringify(lead)}`
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const text = payload?.choices?.[0]?.message?.content ?? '';
  try {
    const parsed = JSON.parse(text);
    return {
      ...lead,
      aiScore: parsed.aiScore ?? parsed.score ?? null,
      aiReasons: parsed.aiReasons ?? parsed.reasons ?? text,
      aiFitSummary: parsed.aiFitSummary ?? parsed.fitSummary ?? parsed.aiFit ?? ''
    };
  } catch (error) {
    return {
      ...lead,
      aiScore: null,
      aiReasons: text || 'Unable to parse AI response as JSON.',
      aiFitSummary: 'No FITS summary available.'
    };
  }
}

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
    console.debug('[LinkedIn Extension] Evaluating lead', { identifier, index: index + 1, total });
    try {
      const evaluated = await requestCompletion({ apiKey, lead });
      results.push(evaluated);
      console.debug('[LinkedIn Extension] Evaluation success', { lead: identifier, aiScore: evaluated.aiScore });
      onProgress?.({ lead: evaluated, status: 'success', index, total });
    } catch (error) {
      const failedLead = {
        ...lead,
        aiScore: null,
        aiReasons: error.message,
        aiFitSummary: 'FITS summary unavailable due to evaluation error.'
      };
      results.push(failedLead);
      console.warn('[LinkedIn Extension] Evaluation failed', { lead: identifier, error: error.message });
      onProgress?.({ lead: failedLead, status: 'error', error, index, total });
    }
  }
  console.info('[LinkedIn Extension] Lead evaluation complete');
  return results;
}
