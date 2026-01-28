// Load environment variables FIRST
import { config } from 'dotenv';
config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase, runMigrations } from './config/database.js';
import { requireAuth, optionalAuth } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import googleRoutes from './routes/google.js';
import candidatesRoutes from './routes/candidates.js';
import reviewsRoutes from './routes/reviews.js';
import analysisRoutes from './routes/analysis.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Error handling for API routes
app.use('/api', (err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Serve static files from frontend build (production)
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Initialize database and start server
async function start() {
  try {
    console.log('Google API Key configured:', !!process.env.GOOGLE_API_KEY);
    console.log('Spreadsheet ID configured:', !!process.env.GOOGLE_SPREADSHEET_ID);

    await initDatabase();
    runMigrations();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at /api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
