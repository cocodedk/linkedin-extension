const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4o-mini';

const SYSTEM_PROMPT = [
  'You are an assistant evaluating prospects for FITS, an AI-assisted GRC automation platform.',
  'Score higher when the lead references security and compliance personas such as CISOs, CSOs, IT security, cybersecurity, cyber security, AI security, compliance officers, ISO 27001, or NIS2 readiness.',
  'Respond with JSON containing aiScore (0-100), aiReasons (summary of why the score was chosen), and aiFitSummary (1-2 sentences describing how FITS could help this lead).'
].join(' ');

function extractJson(text) {
  if (!text) {
    return null;
  }

  let candidate = text.trim();
  if (candidate.startsWith('```')) {
    candidate = candidate.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  }

  const firstBrace = candidate.indexOf('{');
  const lastBrace = candidate.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  const jsonSnippet = candidate.slice(firstBrace, lastBrace + 1);
  try {
    return JSON.parse(jsonSnippet);
  } catch (error) {
    console.warn('[LinkedIn Extension] Unable to parse AI JSON payload', { text, error: error.message });
    return null;
  }
}

function prepareLeadPayload(lead) {
  if (!lead || typeof lead !== 'object') {
    return {};
  }
  const { isOnline, online, ...rest } = lead;
  return rest;
}

async function requestCompletion({ apiKey, lead }) {
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
          content: `Evaluate how well FITS (a GRC automation platform) fits this lead, paying special attention to security and compliance focus areas (CISO, CSO, IT security, cybersecurity, cyber security, AI security, compliance, ISO 27001, NIS2). Respond ONLY in JSON.\nLead: ${JSON.stringify(payloadLead)}`
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
