/**
 * Lead data fixtures
 */

export const minimalLead = {
  name: 'John Doe',
  headline: 'Software Engineer',
  company: 'Acme Corp',
  profileUrl: 'https://www.linkedin.com/in/johndoe'
};

export const fullLead = {
  name: 'Jane Smith',
  headline: 'Senior Product Manager',
  company: 'Tech Inc',
  contact: 'jane@tech.com',
  location: 'San Francisco, CA',
  profileUrl: 'https://www.linkedin.com/in/janesmith',
  aiScore: 85,
  aiReasons: 'Strong technical background, relevant experience',
  aiFitSummary: 'Excellent fit for technical product role'
};

export const leadWithVirkData = {
  name: 'Lars Andersen',
  headline: 'CEO',
  company: 'Danish Company A/S',
  profileUrl: 'https://www.linkedin.com/in/larsandersen',
  virkCvrNumber: '12345678',
  virkAddress: 'Hovedgaden 123',
  virkPostalCode: '2100',
  virkCity: 'København',
  virkStartDate: '2020-01-15',
  virkCompanyForm: 'Anpartsselskab',
  virkStatus: 'Aktiv',
  virkEnriched: true,
  virkEnrichmentDate: '2024-01-01T10:00:00Z'
};

export const leadWithSpecialCharacters = {
  name: 'John "Johnny" O\'Brien',
  headline: 'Engineer, Developer',
  company: 'Company, Inc.',
  location: 'New York\nNY',
  profileUrl: 'https://www.linkedin.com/in/johnobrien'
};

export const leadWithNullValues = {
  name: 'Test User',
  headline: null,
  company: undefined,
  location: '',
  profileUrl: 'https://www.linkedin.com/in/testuser'
};

export const leadWithAIData = {
  name: 'AI Test User',
  headline: 'Data Scientist',
  company: 'AI Corp',
  profileUrl: 'https://www.linkedin.com/in/aitestuser',
  aiScore: 92,
  aiReasons: 'Strong AI/ML background, relevant certifications',
  aiFitSummary: 'Perfect fit for AI research position'
};

export const leadWithAllFields = {
  name: 'Complete User',
  headline: 'Full Stack Developer',
  company: 'Complete Corp',
  contact: 'user@complete.com',
  location: 'Remote',
  profileUrl: 'https://www.linkedin.com/in/completeuser',
  aiScore: 88,
  aiReasons: 'Full stack experience, modern tech stack',
  aiFitSummary: 'Great fit for full stack role',
  virkCvrNumber: '87654321',
  virkAddress: 'Testvej 456',
  virkPostalCode: '2200',
  virkCity: 'Aarhus',
  virkStartDate: '2019-05-20',
  virkCompanyForm: 'Aktieselskab',
  virkStatus: 'Aktiv',
  virkEnriched: true,
  virkEnrichmentDate: '2024-02-01T14:30:00Z'
};
