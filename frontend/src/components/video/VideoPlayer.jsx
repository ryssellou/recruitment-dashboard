import { PlayIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

export default function VideoPlayer({ videoInfo }) {
  if (!videoInfo) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
        <PlayIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
        <p>No video available</p>
      </div>
    );
  }

  if (videoInfo.embedUrl) {
    return (
      <div className="space-y-2">
        <div className="relative pb-[56.25%] rounded-lg overflow-hidden bg-black">
          <iframe
            src={videoInfo.embedUrl}
            className="absolute top-0 left-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Candidate Video"
          />
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 capitalize">{videoInfo.platform.replace('_', ' ')}</span>
          <a
            href={videoInfo.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            Open in new tab
            <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
          </a>
        </div>
      </div>
    );
  }

  // Unknown platform - just show link
  return (
    <div className="bg-gray-100 rounded-lg p-6 text-center">
      <PlayIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
      <p className="text-gray-600 mb-3">Video link available</p>
      <a
        href={videoInfo.originalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
      >
        Open Video
        <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-2" />
      </a>
    </div>
  );
}
