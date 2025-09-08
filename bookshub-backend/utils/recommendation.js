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

  // 1. Title similarity (levenshtein)
  const maxLen = Math.max(bookA.bookName.length, bookB.bookName.length);
  const levDistance = levenshteinDistance(bookA.bookName, bookB.bookName);
  const titleScore = normalize(levDistance, maxLen); // 0–1
  score += titleScore * 0.18; // weight 18%

  // 2. Subject match (exact)
  const subjectScore = bookA.subject === bookB.subject ? 1 : 0;
  score += subjectScore * 0.15; // weight 15%

  // 3. Tags overlap (jaccard)
  const tagsScore = jaccardSimilarity(bookA.tags || [], bookB.tags || []);
  score += tagsScore * 0.13; // weight 13%

  // 4. Author match (exact)
  const authorScore = bookA.author === bookB.author ? 1 : 0;
  score += authorScore * 0.1; // weight 10%

  // 5. Edition match (exact)
  const editionScore = bookA.edition === bookB.edition ? 1 : 0;
  score += editionScore * 0.07; // weight 7%

  // 6. Branch match (exact)
  const branchScore = bookA.branch === bookB.branch ? 1 : 0;
  score += branchScore * 0.07; // weight 7%

  // 7. Condition match (exact)
  const conditionScore = bookA.condition === bookB.condition ? 1 : 0;
  score += conditionScore * 0.05; // weight 5%

  // 8. Price similarity (closer is better)
  const maxPrice = Math.max(bookA.price, bookB.price, 1);
  const priceDiff = Math.abs(bookA.price - bookB.price);
  const priceScore = 1 - priceDiff / maxPrice; // 1 if same price, 0 if very different
  score += priceScore * 0.1; // weight 10%

  // 9. Average rating similarity (closer is better)
  const ratingA =
    typeof bookA.averageRating === "number" ? bookA.averageRating : 0;
  const ratingB =
    typeof bookB.averageRating === "number" ? bookB.averageRating : 0;
  const ratingDiff = Math.abs(ratingA - ratingB);
  const ratingScore = 1 - ratingDiff / 5; // ratings are 0-5
  score += ratingScore * 0.05; // weight 5%

  // 10. Number of pages similarity (closer is better)
  const pagesA = typeof bookA.noOfPages === "number" ? bookA.noOfPages : 0;
  const pagesB = typeof bookB.noOfPages === "number" ? bookB.noOfPages : 0;
  const maxPages = Math.max(pagesA, pagesB, 1);
  const pagesDiff = Math.abs(pagesA - pagesB);
  const pagesScore = 1 - pagesDiff / maxPages;
  score += pagesScore * 0.05; // weight 5%

  // Clamp score to 0–1
  score = Math.max(0, Math.min(1, score));
  return score;
}

module.exports = { calculateSimilarity };
