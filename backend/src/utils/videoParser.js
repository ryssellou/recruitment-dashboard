/**
 * Detects video platform and extracts embed URL
 */
export function parseVideoUrl(url) {
  if (!url) return null;

  // YouTube
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (youtubeMatch) {
    return {
      platform: 'youtube',
      videoId: youtubeMatch[1],
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
      originalUrl: url
    };
  }

  // Loom
  const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  if (loomMatch) {
    return {
      platform: 'loom',
      videoId: loomMatch[1],
      embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`,
      originalUrl: url
    };
  }

  // Google Drive
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    return {
      platform: 'google_drive',
      videoId: driveMatch[1],
      embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
      originalUrl: url
    };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return {
      platform: 'vimeo',
      videoId: vimeoMatch[1],
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      originalUrl: url
    };
  }

  // Unknown platform - return as direct link
  return {
    platform: 'unknown',
    videoId: null,
    embedUrl: null,
    originalUrl: url
  };
}

export default parseVideoUrl;
