import { run, get, all, lastInsertRowid } from '../config/database.js';

export const Review = {
  findById(id) {
    return get('SELECT * FROM reviews WHERE id = ?', [id]);
  },

  findByCandidate(candidateId) {
    return all('SELECT * FROM reviews WHERE candidate_id = ? ORDER BY reviewed_at DESC', [candidateId]);
  },

  findByReviewer(reviewerEmail) {
    return all('SELECT * FROM reviews WHERE reviewer_email = ? ORDER BY reviewed_at DESC', [reviewerEmail]);
  },

  findByCandidateAndReviewer(candidateId, reviewerEmail) {
    return get('SELECT * FROM reviews WHERE candidate_id = ? AND reviewer_email = ?', [candidateId, reviewerEmail]);
  },

  upsert(data) {
    const existing = this.findByCandidateAndReviewer(data.candidate_id, data.reviewer_email);

    if (existing) {
      run(
        `UPDATE reviews
         SET decision = ?, rating = ?, comments = ?, reviewer_name = ?, reviewed_at = datetime('now')
         WHERE id = ?`,
        [data.decision, data.rating || null, data.comments || null, data.reviewer_name, existing.id]
      );
      return this.findById(existing.id);
    }

    run(
      `INSERT INTO reviews (candidate_id, reviewer_email, reviewer_name, decision, rating, comments)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.candidate_id,
        data.reviewer_email,
        data.reviewer_name,
        data.decision,
        data.rating || null,
        data.comments || null
      ]
    );

    const id = lastInsertRowid();
    return this.findById(id);
  },

  getReviewedCandidateIds(reviewerEmail) {
    const results = all('SELECT DISTINCT candidate_id FROM reviews WHERE reviewer_email = ?', [reviewerEmail]);
    return results.map(r => r.candidate_id);
  },

  getReviewStats(candidateId) {
    const reviews = this.findByCandidate(candidateId);

    if (reviews.length === 0) {
      return {
        count: 0,
        decisions: {},
        averageRating: null,
        consensus: null
      };
    }

    const decisions = {};
    let totalRating = 0;
    let ratingCount = 0;

    for (const review of reviews) {
      if (review.decision) {
        decisions[review.decision] = (decisions[review.decision] || 0) + 1;
      }
      if (review.rating) {
        totalRating += review.rating;
        ratingCount++;
      }
    }

    // Calculate consensus
    let consensus = 'none';
    const totalDecisions = Object.values(decisions).reduce((a, b) => a + b, 0);

    if (totalDecisions >= 2) {
      const maxDecision = Math.max(...Object.values(decisions));
      const maxDecisionRatio = maxDecision / totalDecisions;

      if (maxDecisionRatio === 1) {
        consensus = 'unanimous';
      } else if (maxDecisionRatio >= 0.67) {
        consensus = 'strong';
      } else {
        consensus = 'mixed';
      }
    }

    return {
      count: reviews.length,
      decisions,
      averageRating: ratingCount > 0 ? totalRating / ratingCount : null,
      consensus
    };
  }
};

export default Review;
