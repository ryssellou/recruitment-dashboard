// Load environment variables FIRST
import { config } from 'dotenv';
config();

import express from 'express';
import cors from 'cors';
import { initDatabase, runMigrations } from './config/database.js';
import { requireAuth, optionalAuth } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import googleRoutes from './routes/google.js';
import candidatesRoutes from './routes/candidates.js';
import reviewsRoutes from './routes/reviews.js';
import analysisRoutes from './routes/analysis.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/google', googleRoutes);
app.use('/api/candidates', optionalAuth, candidatesRoutes);
app.use('/api/reviews', requireAuth, reviewsRoutes);
app.use('/api/analysis', requireAuth, analysisRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Initialize database and start server
async function start() {
  try {
    console.log('Google API Key configured:', !!process.env.GOOGLE_API_KEY);
    console.log('Spreadsheet ID configured:', !!process.env.GOOGLE_SPREADSHEET_ID);

    await initDatabase();
    runMigrations();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
