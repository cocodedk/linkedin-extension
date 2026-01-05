/**
 * JSON export functionality
 */

export function toJson(leads) {
  // Validate input - return empty array for invalid inputs
  if (!Array.isArray(leads)) {
    return '[]';
  }
  return JSON.stringify(leads, null, 2);
}
