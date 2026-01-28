import { Router } from 'express';
import Review from '../models/Review.js';
import Candidate from '../models/Candidate.js';

const router = Router();

/**
 * POST /api/reviews
 * Submit or update a review
 */
router.post('/', (req, res) => {
  try {
    const { candidate_id, decision, rating, comments } = req.body;

    // Validate required fields
    if (!candidate_id) {
      return res.status(400).json({ error: 'candidate_id is required' });
    }

    if (!decision || !['ticked', 'crossed', 'question'].includes(decision)) {
      return res.status(400).json({ error: 'Invalid decision. Must be ticked, crossed, or question' });
    }

    if (rating !== undefined && rating !== null) {
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
      }
    }

    // Verify candidate exists
    const candidate = Candidate.findById(candidate_id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Get user from auth middleware
    const { email, name } = req.user;

    // Create or update review
    const review = Review.upsert({
      candidate_id,
      reviewer_email: email,
      reviewer_name: name,
      decision,
      rating: rating || null,
      comments: comments || null
    });

    res.json(review);
  } catch (error) {
    console.error('Error saving review:', error);
    res.status(500).json({ error: 'Failed to save review' });
  }
});

/**
 * GET /api/reviews/candidate/:candidateId
 * Get all reviews for a candidate
 */
router.get('/candidate/:candidateId', (req, res) => {
  try {
    const reviews = Review.findByCandidate(req.params.candidateId);
    const stats = Review.getReviewStats(req.params.candidateId);

    res.json({
      reviews,
      stats
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

/**
 * GET /api/reviews/my
 * Get current user's reviews
 */
router.get('/my', (req, res) => {
  try {
    const reviews = Review.findByReviewer(req.user.email);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

export default router;
