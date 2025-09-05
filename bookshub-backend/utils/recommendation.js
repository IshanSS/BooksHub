const { levenshteinDistance } = require("./levenshtein");

// Normalize value to 0–1
const normalize = (val, max) => (max === 0 ? 0 : 1 - val / max);

// Jaccard similarity for tags
const jaccardSimilarity = (setA = [], setB = []) => {
  if (!setA.length && !setB.length) return 0;
  const intersection = setA.filter((tag) => setB.includes(tag)).length;
  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
};

// Hybrid similarity score
function calculateSimilarity(bookA, bookB) {
  let score = 0;

  // 1. Title similarity
  const maxLen = Math.max(bookA.bookName.length, bookB.bookName.length);
  const levDistance = levenshteinDistance(bookA.bookName, bookB.bookName);
  const titleScore = normalize(levDistance, maxLen); // 0–1
  score += titleScore * 0.4; // weight 40%

  // 2. Subject match
  const subjectScore = bookA.subject === bookB.subject ? 1 : 0;
  score += subjectScore * 0.2; // weight 20%

  // 3. Tags overlap
  const tagsScore = jaccardSimilarity(bookA.tags || [], bookB.tags || []);
  score += tagsScore * 0.25; // weight 25%

  // 4. Author match
  const authorScore = bookA.author === bookB.author ? 1 : 0;
  score += authorScore * 0.15; // weight 15%

  return score; // 0–1
}

module.exports = { calculateSimilarity };
