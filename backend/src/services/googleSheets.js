import { getSheetsClient, getSpreadsheetId, extractDriveFileId } from '../config/google.js';
import Candidate from '../models/Candidate.js';

// Column mapping - matches your Google Form columns
// Columns are 0-indexed (A=0, B=1, C=2, etc.)
const COLUMN_MAP = {
  timestamp: 0,      // Column A - Timestamp
  name: 1,           // Column B - Full Name
  email: 2,          // Column C - Email Address
  phone: 3,          // Column D - Phone Number
  country: 4,        // Column E - Country/Location
  role: 5,           // Column F - Role Applied For
  video_link: 6,     // Column G - Video Introduction Link
  cv_file_link: 7,   // Column H - Upload CV/Resume
  linkedin_url: 8    // Column I - LinkedIn Profile
};

/**
 * Fetch candidates from Google Sheets
 */
export async function fetchCandidatesFromSheets() {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  if (!sheets) {
    throw new Error('Google Sheets not configured. Set GOOGLE_API_KEY in .env');
  }

  if (!spreadsheetId) {
    throw new Error('GOOGLE_SPREADSHEET_ID not configured in .env');
  }

  // Fetch data from the sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: 'A:I', // Adjust range based on your columns (A to I for 9 columns)
  });

  const rows = response.data.values;
  if (!rows || rows.length <= 1) {
    return { added: 0, updated: 0, total: 0 };
  }

  // Skip header row
  const dataRows = rows.slice(1);

  let added = 0;
  let updated = 0;

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rowNumber = i + 2; // +2 because: 0-indexed + header row

    // Skip empty rows
    if (!row || row.length === 0) continue;

    // Create a unique ID based on timestamp + email
    const timestamp = row[COLUMN_MAP.timestamp] || '';
    const email = row[COLUMN_MAP.email] || '';
    const sheetsRowId = `row_${rowNumber}_${timestamp}_${email}`.replace(/[^a-zA-Z0-9_-]/g, '_');

    // Extract CV file ID from Google Drive link
    const cvFileLink = row[COLUMN_MAP.cv_file_link] || '';
    const cvFileId = extractDriveFileId(cvFileLink);

    const candidateData = {
      sheets_row_id: sheetsRowId,
      name: row[COLUMN_MAP.name] || 'Unknown',
      email: email || 'unknown@email.com',
      phone: row[COLUMN_MAP.phone] || null,
      country: row[COLUMN_MAP.country] || null,
      role: row[COLUMN_MAP.role] || 'Not specified',
      video_link: row[COLUMN_MAP.video_link] || null,
      cv_file_id: cvFileId,
      linkedin_url: row[COLUMN_MAP.linkedin_url] || null,
      submitted_at: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString()
    };

    const existing = Candidate.findBySheetsRowId(sheetsRowId);

    if (existing) {
      Candidate.update(existing.id, candidateData);
      updated++;
    } else {
      Candidate.create(candidateData);
      added++;
    }
  }

  return {
    added,
    updated,
    total: dataRows.length
  };
}

export default { fetchCandidatesFromSheets };
