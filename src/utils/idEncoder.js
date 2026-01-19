/**
 * Utility functions for encoding/decoding IDs to/from base64
 * This helps hide sequential IDs and provides basic obfuscation
 */

/**
 * Encode an integer ID to base64 string
 * @param {number|string} id - The ID to encode
 * @returns {string} Base64 encoded ID
 */
export const encodeId = (id) => {
  if (!id) return '';
  // Convert to string, pad with zeros for consistent encoding
  const idStr = String(id);
  // Encode to base64
  return btoa(idStr);
};

/**
 * Decode a base64 string back to integer ID
 * @param {string} encodedId - The base64 encoded ID
 * @returns {number|null} Decoded ID or null if invalid
 */
export const decodeId = (encodedId) => {
  if (!encodedId) return null;
  try {
    // Decode from base64
    const decoded = atob(encodedId);
    // Convert to integer
    const id = parseInt(decoded, 10);
    // Validate it's a valid number
    if (isNaN(id)) return null;
    return id;
  } catch (error) {
    console.error('Error decoding ID:', error);
    return null;
  }
};

/**
 * Encode multiple IDs (for query params, etc.)
 * @param {Array<number|string>} ids - Array of IDs to encode
 * @returns {Array<string>} Array of encoded IDs
 */
export const encodeIds = (ids) => {
  return ids.map(id => encodeId(id));
};

/**
 * Decode multiple IDs
 * @param {Array<string>} encodedIds - Array of encoded IDs
 * @returns {Array<number>} Array of decoded IDs
 */
export const decodeIds = (encodedIds) => {
  return encodedIds.map(id => decodeId(id)).filter(id => id !== null);
};
