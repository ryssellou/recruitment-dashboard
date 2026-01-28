# Recruitment Video Review Dashboard

A collaborative web dashboard for recruitment screening where candidates submit via Google Forms, CVs are automatically analyzed using Claude API, and multiple reviewers independently evaluate candidates.

## Features

- **Google Sheets Integration**: Sync candidates from Google Forms responses
- **Video Embedding**: Auto-detect and embed YouTube, Loom, Google Drive, and Vimeo videos
- **CV Analysis**: AI-powered CV analysis using Claude API
- **Multi-Reviewer System**: Each reviewer (Jim, Sophie, Davina) can independently review
- **Consensus Tracking**: Shows agreement level (unanimous, strong, mixed)
- **Filtering**: Filter by role, review status, and consensus

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **APIs**: Google Sheets, Google Drive, Anthropic Claude

## Project Structure

```
recruitment-dashboard-automation/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express server
│   │   ├── config/               # Database & Google config
│   │   ├── routes/               # API endpoints
│   │   ├── services/             # Google & Claude services
│   │   ├── models/               # Database models
│   │   ├── middleware/           # Auth middleware
│   │   └── utils/                # Video parser, consensus calc
│   └── migrations/               # SQL migrations
├── frontend/
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── context/              # Auth & Filter context
│   │   ├── hooks/                # Custom hooks
│   │   ├── pages/                # Page components
│   │   └── services/             # API client
│   └── index.html
├── .env.example
└── README.md
```

## Setup

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `backend/.env` and fill in your values:

```bash
cp .env.example backend/.env
```

Required variables:
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Google service account email
- `GOOGLE_PRIVATE_KEY` - Google service account private key
- `GOOGLE_SPREADSHEET_ID` - ID of your Google Forms response spreadsheet
- `ANTHROPIC_API_KEY` - Your Anthropic API key

### 3. Google API Setup

1. Create a Google Cloud project
2. Enable Google Sheets API and Google Drive API
3. Create a service account and download credentials
4. Share your Google Spreadsheet with the service account email

### 4. Configure Google Sheets Column Mapping

Edit `backend/src/services/googleSheets.js` to match your Google Form columns:

```javascript
const COLUMN_MAP = {
  timestamp: 0,
  email: 1,
  name: 2,
  phone: 3,
  role: 4,
  video_link: 5,
  cv_file_link: 6,
  linkedin_url: 7
};
```

### 5. Start the Application

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

- Backend runs on: http://localhost:3001
- Frontend runs on: http://localhost:5173

## Usage

1. **Login**: Enter your name and email to sign in
2. **Sync**: Click "Sync from Sheets" to import candidates from Google Forms
3. **Review**: Click a candidate card to view details
4. **Video**: Watch the candidate's video in the embedded player
5. **CV Analysis**: Click "Analyze CV" to get AI-powered insights
6. **Submit Review**: Choose Accept/Reject/Maybe, add rating and comments
7. **Filter**: Use the sidebar to filter candidates

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/auth/login | Login with name + email |
| GET | /api/auth/me | Get current user |
| GET | /api/candidates | List candidates with filters |
| GET | /api/candidates/:id | Get candidate details |
| POST | /api/candidates/sync | Sync from Google Sheets |
| POST | /api/reviews | Submit/update review |
| GET | /api/reviews/candidate/:id | Get reviews for candidate |
| POST | /api/analysis/trigger/:id | Trigger CV analysis |

## Database Schema

- **candidates**: Synced from Google Sheets (name, email, role, video, CV)
- **reviews**: One per reviewer per candidate (decision, rating, comments)
- **sessions**: Authentication tokens

## License

MIT
