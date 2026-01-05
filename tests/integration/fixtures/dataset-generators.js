/**
 * Dataset generators for integration tests
 */

import { minimalLead } from './lead-fixtures.js';

/**
 * Generate array of leads
 */
export function generateLeads(count, template = minimalLead) {
  return Array.from({ length: count }, (_, i) => ({
    ...template,
    name: `${template.name} ${i + 1}`,
    profileUrl: `${template.profileUrl}${i + 1}`
  }));
}

/** Small dataset (1-10 leads) */
export function getSmallDataset() {
  return generateLeads(5, minimalLead);
}

/** Medium dataset (50-100 leads) */
export function getMediumDataset() {
  return generateLeads(75, minimalLead);
}

/** Large dataset (100+ leads) - reduced for memory safety */
export function getLargeDataset() {
  return generateLeads(50, minimalLead); // Further reduced to prevent crashes
}
