/**
 * Utility function to validate status enum values
 * @param {string} status - The status to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validateStatus(status) {
  const validStatuses = ['pending', 'approved', 'rejected', 'scheduled'];
  return validStatuses.includes(status);
}

module.exports = { validateStatus };
