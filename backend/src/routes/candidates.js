import { Router } from 'express';
import Candidate from '../models/Candidate.js';
import Review from '../models/Review.js';
import { fetchCandidatesFromSheets } from '../services/googleSheets.js';
import { getDownloadUrl, getPreviewUrl } from '../services/googleDrive.js';
import parseVideoUrl from '../utils/videoParser.js';
import { calculateConsensus, calculateAverageRating } from '../utils/consensus.js';

const router = Router();

/**
 * GET /api/candidates
 * List all candidates with optional filters
 */
router.get('/', (req, res) => {
  try {
    const { role, cv_analysis_status, search, reviewed_by_me } = req.query;

    let candidates = Candidate.findAll({
      role: role || undefined,
      cv_analysis_status: cv_analysis_status || undefined,
      search: search || undefined
    });

    // Enrich with review stats and video info
    candidates = candidates.map(candidate => {
      const reviews = Review.findByCandidate(candidate.id);
      const consensus = calculateConsensus(reviews);
      const averageRating = calculateAverageRating(reviews);
      const videoInfo = parseVideoUrl(candidate.video_link);

      // Check if current user has reviewed
      const currentUserEmail = req.user?.email;
      const myReview = currentUserEmail
        ? reviews.find(r => r.reviewer_email === currentUserEmail)
        : null;

      return {
        ...candidate,
        reviewCount: reviews.length,
        consensus,
        averageRating,
        videoInfo,
        myReview: myReview ? {
          decision: myReview.decision,
          rating: myReview.rating
        } : null
      };
    });

    // Filter by reviewed status if requested
    if (reviewed_by_me === 'true') {
      candidates = candidates.filter(c => c.myReview !== null);
    } else if (reviewed_by_me === 'false') {
      candidates = candidates.filter(c => c.myReview === null);
    }

    res.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

/**
 * GET /api/candidates/roles
 * Get distinct roles for filtering
 */
router.get('/roles', (req, res) => {
  try {
    const roles = Candidate.getRoles();
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

/**
 * GET /api/candidates/:id
 * Get single candidate with full details
 */
router.get('/:id', (req, res) => {
  try {
    const candidate = Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Get reviews
    const reviews = Review.findByCandidate(candidate.id);
    const consensus = calculateConsensus(reviews);
    const averageRating = calculateAverageRating(reviews);

    // Parse video URL
    const videoInfo = parseVideoUrl(candidate.video_link);

    // Generate CV URLs if available
    let cvUrls = null;
    if (candidate.cv_file_id) {
      cvUrls = {
        download: getDownloadUrl(candidate.cv_file_id),
        preview: getPreviewUrl(candidate.cv_file_id)
      };
    }

    res.json({
      ...candidate,
      reviews,
      consensus,
      averageRating,
      videoInfo,
      cvUrls
    });
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
});

/**
 * POST /api/candidates/sync
 * Sync candidates from Google Sheets
 */
router.post('/sync', async (req, res) => {
  try {
    const result = await fetchCandidatesFromSheets();
    res.json({
      success: true,
      message: `Synced ${result.total} candidates (${result.added} added, ${result.updated} updated)`
    });
  } catch (error) {
    console.error('Error syncing candidates:', error);
    res.status(500).json({ error: `Sync failed: ${error.message}` });
  }
});

export default router;
