/**
 * Calculate consensus level from reviews
 */
export function calculateConsensus(reviews) {
  if (!reviews || reviews.length === 0) {
    return {
      level: 'none',
      label: 'No Reviews',
      color: 'gray'
    };
  }

  const decisions = reviews
    .filter(r => r.decision)
    .map(r => r.decision);

  if (decisions.length === 0) {
    return {
      level: 'none',
      label: 'No Decisions',
      color: 'gray'
    };
  }

  if (decisions.length === 1) {
    return {
      level: 'single',
      label: '1 Review',
      color: 'blue'
    };
  }

  // Count each decision type
  const counts = {
    ticked: 0,
    crossed: 0,
    question: 0
  };

  for (const decision of decisions) {
    counts[decision]++;
  }

  const total = decisions.length;
  const maxCount = Math.max(...Object.values(counts));
  const maxDecision = Object.entries(counts).find(([, count]) => count === maxCount)[0];
  const ratio = maxCount / total;

  if (ratio === 1) {
    return {
      level: 'unanimous',
      label: 'Unanimous',
      color: maxDecision === 'ticked' ? 'green' : maxDecision === 'crossed' ? 'red' : 'yellow',
      majorityDecision: maxDecision
    };
  }

  if (ratio >= 0.67) {
    return {
      level: 'strong',
      label: 'Strong Consensus',
      color: maxDecision === 'ticked' ? 'green' : maxDecision === 'crossed' ? 'red' : 'yellow',
      majorityDecision: maxDecision
    };
  }

  return {
    level: 'mixed',
    label: 'Mixed',
    color: 'orange',
    majorityDecision: null
  };
}

/**
 * Calculate average rating from reviews
 */
export function calculateAverageRating(reviews) {
  const ratings = reviews.filter(r => r.rating).map(r => r.rating);
  if (ratings.length === 0) return null;
  return ratings.reduce((a, b) => a + b, 0) / ratings.length;
}

export default { calculateConsensus, calculateAverageRating };
