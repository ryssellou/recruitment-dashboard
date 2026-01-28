import {
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
  StarIcon
} from '@heroicons/react/24/solid';

const decisionDisplay = {
  ticked: { icon: CheckCircleIcon, label: 'Accept', colorClass: 'text-green-500' },
  crossed: { icon: XCircleIcon, label: 'Reject', colorClass: 'text-red-500' },
  question: { icon: QuestionMarkCircleIcon, label: 'Maybe', colorClass: 'text-yellow-500' }
};

const consensusColors = {
  unanimous: 'bg-green-100 text-green-800 border-green-200',
  strong: 'bg-blue-100 text-blue-800 border-blue-200',
  mixed: 'bg-orange-100 text-orange-800 border-orange-200',
  none: 'bg-gray-100 text-gray-600 border-gray-200',
  single: 'bg-gray-100 text-gray-600 border-gray-200'
};

export default function ReviewDisplay({ reviews, consensus, currentUserEmail }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        No reviews yet. Be the first to review this candidate.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Consensus Badge */}
      {consensus && (
        <div className={`p-3 rounded-lg border ${consensusColors[consensus.level]}`}>
          <div className="flex items-center justify-between">
            <span className="font-medium">{consensus.label}</span>
            <span className="text-sm">
              {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Individual Reviews */}
      <div className="space-y-3">
        {reviews.map((review) => {
          const { icon: Icon, label, colorClass } = decisionDisplay[review.decision] || {};
          const isCurrentUser = review.reviewer_email === currentUserEmail;

          return (
            <div
              key={review.id}
              className={`border rounded-lg p-3 ${isCurrentUser ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`font-medium ${isCurrentUser ? 'text-indigo-700' : 'text-gray-900'}`}>
                    {review.reviewer_name}
                  </span>
                  {isCurrentUser && (
                    <span className="text-xs text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded">
                      You
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {review.rating && (
                    <div className="flex items-center">
                      <StarIcon className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-gray-600 ml-0.5">{review.rating}</span>
                    </div>
                  )}
                  {Icon && (
                    <div className="flex items-center">
                      <Icon className={`h-5 w-5 ${colorClass}`} />
                      <span className="text-sm text-gray-600 ml-1">{label}</span>
                    </div>
                  )}
                </div>
              </div>

              {review.comments && (
                <p className="mt-2 text-sm text-gray-600">{review.comments}</p>
              )}

              <p className="mt-2 text-xs text-gray-400">
                {new Date(review.reviewed_at).toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
