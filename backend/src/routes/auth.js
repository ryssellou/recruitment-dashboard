import { Router } from 'express';
import Session from '../models/Session.js';

const router = Router();

// Allowed reviewers (can be expanded or moved to config)
const ALLOWED_REVIEWERS = [
  { name: 'Jim', email: 'jim@company.com' },
  { name: 'Sophie', email: 'sophie@company.com' },
  { name: 'Davina', email: 'davina@company.com' }
];

/**
 * POST /api/auth/login
 * Login with name and email
 */
router.post('/login', (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Create session
  const session = Session.create(email.toLowerCase().trim(), name.trim());

  res.json({
    success: true,
    token: session.token,
    user: {
      name: session.reviewer_name,
      email: session.reviewer_email
    }
  });
});

/**
 * GET /api/auth/me
 * Get current user from session
 */
router.get('/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const session = Session.findByToken(token);

  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  res.json({
    name: session.reviewer_name,
    email: session.reviewer_email
  });
});

/**
 * POST /api/auth/logout
 * Logout and invalidate session
 */
router.post('/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (token) {
    Session.delete(token);
  }

  res.json({ success: true });
});

/**
 * GET /api/auth/reviewers
 * Get list of allowed reviewers (for UI display)
 */
router.get('/reviewers', (req, res) => {
  res.json(ALLOWED_REVIEWERS.map(r => r.name));
});

export default router;
