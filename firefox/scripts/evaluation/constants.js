/**
 * OpenAI evaluation constants
 */

export const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
export const DEFAULT_MODEL = 'gpt-4o-mini';

export const SYSTEM_PROMPT = [
  'You are an assistant evaluating prospects for FITS, an AI-assisted GRC automation platform.',
  'Score higher when the lead references security and compliance personas such as CISOs, CSOs, IT security, cybersecurity, cyber security, AI security, compliance officers, ISO 27001, or NIS2 readiness.',
  'Respond with JSON containing aiScore (0-100), aiReasons (summary of why the score was chosen), and aiFitSummary (1-2 sentences describing how FITS could help this lead).'
].join(' ');

export const USER_PROMPT_TEMPLATE = (lead) =>
  `Evaluate how well FITS (a GRC automation platform) fits this lead, paying special attention to security and compliance focus areas (CISO, CSO, IT security, cybersecurity, cyber security, AI security, compliance, ISO 27001, NIS2). Respond ONLY in JSON.\nLead: ${JSON.stringify(lead)}`;

