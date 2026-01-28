-- Candidates (synced from Google Sheets)
CREATE TABLE IF NOT EXISTS candidates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sheets_row_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    country TEXT,
    role TEXT NOT NULL,
    video_link TEXT,
    cv_file_id TEXT,
    linkedin_url TEXT,
    submitted_at DATETIME NOT NULL,
    cv_analysis JSON,
    cv_analysis_status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Reviews (one per reviewer per candidate)
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_id INTEGER NOT NULL,
    reviewer_email TEXT NOT NULL,
    reviewer_name TEXT NOT NULL,
    decision TEXT CHECK (decision IN ('ticked', 'crossed', 'question')),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    reviewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(candidate_id, reviewer_email),
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_token TEXT UNIQUE NOT NULL,
    reviewer_email TEXT NOT NULL,
    reviewer_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Settings (for storing OAuth tokens, etc.)
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_candidates_role ON candidates(role);
CREATE INDEX IF NOT EXISTS idx_candidates_cv_analysis_status ON candidates(cv_analysis_status);
CREATE INDEX IF NOT EXISTS idx_reviews_candidate_id ON reviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_email ON reviews(reviewer_email);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
