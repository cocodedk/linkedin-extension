/**
 * Test data fixtures - main export file
 */

export {
  minimalLead,
  fullLead,
  leadWithVirkData,
  leadWithSpecialCharacters,
  leadWithNullValues,
  leadWithAIData,
  leadWithAllFields
} from './lead-fixtures.js';

export {
  generateLeads,
  getSmallDataset,
  getMediumDataset,
  getLargeDataset
} from './dataset-generators.js';
