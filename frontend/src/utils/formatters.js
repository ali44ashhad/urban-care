/**
 * Utility functions for formatting data
 */

/**
 * Creates a URL-friendly slug from a string
 * Replaces spaces and special characters with hyphens
 * @param {string} text - The text to convert to a slug
 * @returns {string} - A URL-friendly slug
 */
export function createSlug(text) {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    // Replace spaces, ampersands, and other special characters with hyphens
    .replace(/[&\s]+/g, '-')
    // Replace any non-alphanumeric characters (except hyphens) with hyphens
    .replace(/[^a-z0-9-]+/g, '-')
    // Replace multiple consecutive hyphens with a single hyphen
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Normalizes a slug from URL parameters
 * Decodes URL-encoded characters and normalizes to a clean slug
 * @param {string} slug - The slug from URL parameters (may be URL-encoded)
 * @returns {string} - A normalized, clean slug
 */
export function normalizeSlug(slug) {
  if (!slug) return '';
  
  try {
    // Decode URL-encoded characters
    const decoded = decodeURIComponent(slug);
    // Create a clean slug from the decoded value
    return createSlug(decoded);
  } catch (e) {
    // If decoding fails, just create a slug from the original
    return createSlug(slug);
  }
}

/** Default warranty days when backend does not send or sends 0 */
export const DEFAULT_WARRANTY_DAYS = 14;

/**
 * Warranty days to display: backend value if > 0, else default 14
 * @param {object} service - service object with warrantyDurationDays
 * @returns {number}
 */
export function getWarrantyDisplayDays(service) {
  const days = service?.warrantyDurationDays;
  return (days != null && Number(days) > 0) ? Number(days) : DEFAULT_WARRANTY_DAYS;
}
