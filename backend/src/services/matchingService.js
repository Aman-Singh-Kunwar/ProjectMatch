/**
 * Determine a student's eligible project tier (minor or major) based on program & current year.
 * @param {Object} user - User document
 * @param {Object} program - Program document
 * @returns {'minor' | 'major' | null}
 */
function getStudentProjectLevel(user, program) {
  if (!user || !program || typeof user.currentYear !== 'number') return null;
  if (user.currentYear === program.minorYear) return 'minor';
  if (user.currentYear === program.majorYear) return 'major';
  return null;
}

/**
 * Compute cosine similarity between two numerical vectors of identical dimension
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number} similarity score between -1 and 1
 */
function cosineSimilarity(a, b) {
  if (!a || !b || !Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    return 0;
  }
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

module.exports = {
  getStudentProjectLevel,
  cosineSimilarity,
};
