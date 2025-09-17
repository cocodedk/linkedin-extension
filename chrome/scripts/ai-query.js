const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4o-mini';

const SYSTEM_PROMPT = [
  'You are an assistant that crafts LinkedIn boolean search queries to find prospects for FITS, an AI-assisted GRC automation platform.',
  'Highlight roles or organisations likely to benefit from governance, risk, and compliance automation when the description implies it.',
  'Keep security and compliance personas front of mind: prioritise terms related to IT security, cybersecurity, cyber security, AI security, compliance, NIS2, ISO 27001, CISOs, and CSOs whenever they strengthen the match.',
  'Return ONLY JSON with two fields: "query" (LinkedIn-ready boolean search string) and "summary" (<=80 characters summarising the target).',
  'Keep the query under 200 characters, use uppercase boolean operators, and include role/title, industry, or geography only when provided.',
  'Do not add explanations or markdown.'
].join(' ');

function parseResponseText(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error('AI response was not valid JSON.');
  }
}

export async function generateAiSearchQuery({ apiKey, icpDescription }) {
  if (!apiKey) {
    throw new Error('OpenAI API key is required.');
  }

  if (!icpDescription) {
    throw new Error('ICP description is required.');
  }

  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Create a LinkedIn boolean search query for this description. Respond ONLY in JSON.\nDescription: ${icpDescription}`
        }
      ],
      temperature: 0.2
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const text = payload?.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error('OpenAI response was empty.');
  }

  const parsed = parseResponseText(text);
  if (!parsed?.query) {
    throw new Error('AI response missing query field.');
  }

  return {
    query: String(parsed.query).trim(),
    summary: typeof parsed.summary === 'string' ? parsed.summary.trim() : ''
  };
}
