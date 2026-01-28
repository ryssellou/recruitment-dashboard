import { Router } from 'express';
import { isGoogleConfigured, getSpreadsheetId } from '../config/google.js';

const router = Router();

/**
 * GET /api/google/status
 * Check if Google is configured
 */
router.get('/status', (req, res) => {
  res.json({
    configured: isGoogleConfigured(),
    spreadsheetId: getSpreadsheetId() || null
  });
});

export default router;
