/**
 * Test utility functions
 */

/**
 * Creates a mock lead object
 */
export function createMockLead(overrides = {}) {
  return {
    name: 'John Doe',
    headline: 'Software Engineer',
    profileUrl: 'https://www.linkedin.com/in/johndoe',
    location: 'Copenhagen, Denmark',
    ...overrides
  };
}

/**
 * Creates multiple mock leads
 */
export function createMockLeads(count, baseOverrides = {}) {
  return Array.from({ length: count }, (_, i) =>
    createMockLead({
      name: `Person ${i + 1}`,
      profileUrl: `https://www.linkedin.com/in/person${i + 1}`,
      ...baseOverrides
    })
  );
}

/**
 * Waits for a specified number of milliseconds
 */
export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
