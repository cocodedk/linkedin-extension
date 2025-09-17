const LEADS_KEY = 'leads';
const API_KEY = 'openaiApiKey';
const LAST_AI_QUERY_KEY = 'lastAiQuery';

export async function getLeads() {
  const { [LEADS_KEY]: leads = [] } = await chrome.storage.local.get(LEADS_KEY);
  return leads;
}

export async function saveLeads(newLeads) {
  if (!Array.isArray(newLeads) || newLeads.length === 0) {
    return getLeads();
  }

  const leads = await getLeads();
  const map = new Map(leads.map((lead) => [lead.profileUrl, lead]));

  newLeads.forEach((lead) => {
    if (!lead.profileUrl) {
      return;
    }
    const existing = map.get(lead.profileUrl) ?? {};
    map.set(lead.profileUrl, { ...existing, ...lead });
  });

  const deduped = Array.from(map.values());
  await chrome.storage.local.set({ [LEADS_KEY]: deduped });
  return deduped;
}

export async function clearLeads() {
  await chrome.storage.local.set({ [LEADS_KEY]: [] });
}

export async function getApiKey() {
  const { [API_KEY]: apiKey = '' } = await chrome.storage.local.get(API_KEY);
  return apiKey;
}

export async function setApiKey(apiKey) {
  await chrome.storage.local.set({ [API_KEY]: apiKey });
}

export async function setLastAiQuery(entry) {
  await chrome.storage.local.set({ [LAST_AI_QUERY_KEY]: entry });
}

export async function getLastAiQuery() {
  const { [LAST_AI_QUERY_KEY]: entry = null } = await chrome.storage.local.get(LAST_AI_QUERY_KEY);
  return entry;
}
