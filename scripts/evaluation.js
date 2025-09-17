const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4o-mini';

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
          content: 'Return a JSON object with fields aiScore (0-100) and aiReasons summarising the fit.'
        },
        {
          role: 'user',
          content: `Score this lead:\n${JSON.stringify(lead)}`
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
      aiReasons: parsed.aiReasons ?? parsed.reasons ?? text
    };
  } catch (error) {
    return {
      ...lead,
      aiScore: null,
      aiReasons: text || 'Unable to parse AI response as JSON.'
    };
  }
}

export async function evaluateLeads({ leads, apiKey, signal, onProgress }) {
  if (!apiKey) {
    throw new Error('OpenAI API key is required.');
  }

  const results = [];
  for (const lead of leads) {
    if (signal?.aborted) {
      throw new Error('Evaluation cancelled.');
    }
    try {
      const evaluated = await requestCompletion({ apiKey, lead });
      results.push(evaluated);
      onProgress?.({ lead: evaluated, status: 'success' });
    } catch (error) {
      const failedLead = {
        ...lead,
        aiScore: null,
        aiReasons: error.message
      };
      results.push(failedLead);
      onProgress?.({ lead: failedLead, status: 'error', error });
    }
  }
  return results;
}
