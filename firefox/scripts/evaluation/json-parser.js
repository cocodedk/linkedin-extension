/**
 * JSON extraction and parsing utilities
 */

export function extractJson(text) {
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
    console.warn('[LinkedIn Extension] Unable to parse AI JSON payload', {
      text,
      error: error.message
    });
    return null;
  }
}

export function prepareLeadPayload(lead) {
  if (!lead || typeof lead !== 'object') {
    return {};
  }
  const { isOnline, online, ...rest } = lead;
  return rest;
}

