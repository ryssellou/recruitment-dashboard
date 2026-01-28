import Session from '../models/Session.js';

/**
 * Authentication middleware
 * Validates session token and attaches user to request
 */
export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const session = Session.findByToken(token);

  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  // Attach user info to request
  req.user = {
    email: session.reviewer_email,
    name: session.reviewer_name
  };

  next();
}

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't require it
 */
export function optionalAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (token) {
    const session = Session.findByToken(token);
    if (session) {
      req.user = {
        email: session.reviewer_email,
        name: session.reviewer_name
      };
    }
  }

  next();
}

export default { requireAuth, optionalAuth };
