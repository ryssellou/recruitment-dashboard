import { getDriveClient } from '../config/google.js';

/**
 * Get file metadata from Google Drive
 */
export async function getFileMetadata(fileId) {
  const drive = getDriveClient();

  if (!drive) {
    throw new Error('Google Drive client not configured');
  }

  const response = await drive.files.get({
    fileId: fileId,
    fields: 'id, name, mimeType, size, webViewLink, webContentLink'
  });

  return response.data;
}

/**
 * Download file content from Google Drive
 */
export async function downloadFile(fileId) {
  const drive = getDriveClient();

  if (!drive) {
    throw new Error('Google Drive client not configured');
  }

  // First get the file metadata to determine type
  const metadata = await getFileMetadata(fileId);

  // For Google Docs/Sheets/Slides, export as PDF
  const googleDocTypes = [
    'application/vnd.google-apps.document',
    'application/vnd.google-apps.spreadsheet',
    'application/vnd.google-apps.presentation'
  ];

  if (googleDocTypes.includes(metadata.mimeType)) {
    const response = await drive.files.export(
      { fileId: fileId, mimeType: 'application/pdf' },
      { responseType: 'arraybuffer' }
    );
    return {
      data: Buffer.from(response.data),
      mimeType: 'application/pdf',
      name: metadata.name + '.pdf'
    };
  }

  // For regular files, download directly
  const response = await drive.files.get(
    { fileId: fileId, alt: 'media' },
    { responseType: 'arraybuffer' }
  );

  return {
    data: Buffer.from(response.data),
    mimeType: metadata.mimeType,
    name: metadata.name
  };
}

/**
 * Generate a download URL for direct browser download
 */
export function getDownloadUrl(fileId) {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/**
 * Generate a preview URL for browser viewing
 */
export function getPreviewUrl(fileId) {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export default { getFileMetadata, downloadFile, getDownloadUrl, getPreviewUrl };
