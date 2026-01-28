import {
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
  StarIcon,
  PlayIcon,
  DocumentIcon
} from '@heroicons/react/24/solid';

const decisionIcons = {
  ticked: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
  crossed: <XCircleIcon className="h-5 w-5 text-red-500" />,
  question: <QuestionMarkCircleIcon className="h-5 w-5 text-yellow-500" />
};

const consensusColors = {
  unanimous: 'bg-green-100 text-green-800',
  strong: 'bg-blue-100 text-blue-800',
  mixed: 'bg-orange-100 text-orange-800',
  none: 'bg-gray-100 text-gray-800',
  single: 'bg-gray-100 text-gray-800'
};

export default function CandidateCard({ candidate, onClick }) {
  const { name, email, role, reviewCount, consensus, averageRating, myReview, videoInfo, cv_file_id } = candidate;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500">{email}</p>
        </div>
        {myReview && (
          <div className="flex items-center">
            {decisionIcons[myReview.decision]}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          {role}
        </span>
        {consensus && (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${consensusColors[consensus.level]}`}>
            {consensus.label}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          {videoInfo?.embedUrl && (
            <span className="flex items-center">
              <PlayIcon className="h-4 w-4 mr-1" />
              Video
            </span>
          )}
          {cv_file_id && (
            <span className="flex items-center">
              <DocumentIcon className="h-4 w-4 mr-1" />
              CV
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {averageRating !== null && (
            <span className="flex items-center">
              <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
              {averageRating.toFixed(1)}
            </span>
          )}
          <span>{reviewCount} review{reviewCount !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}
