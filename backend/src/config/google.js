import { google } from 'googleapis';

export function getApiKey() {
  return process.env.GOOGLE_API_KEY;
}

export function getSpreadsheetId() {
  return process.env.GOOGLE_SPREADSHEET_ID;
}

export function isGoogleConfigured() {
  return Boolean(getApiKey() && getSpreadsheetId());
}

export function getSheetsClient() {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('GOOGLE_API_KEY not configured');
    return null;
  }
  return google.sheets({ version: 'v4', auth: apiKey });
}

export function getDriveClient() {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('GOOGLE_API_KEY not configured');
    return null;
  }
  return google.drive({ version: 'v3', auth: apiKey });
}

// Helper to extract file ID from Google Drive URLs
export function extractDriveFileId(url) {
  if (!url) return null;

  // Format: https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (openMatch) return openMatch[1];

  // Format: https://drive.google.com/file/d/FILE_ID/view
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];

  return null;
}
