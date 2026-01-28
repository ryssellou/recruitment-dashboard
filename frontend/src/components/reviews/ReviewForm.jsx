import { useState, useEffect } from 'react';
import {
  CheckIcon,
  XMarkIcon,
  QuestionMarkCircleIcon,
  StarIcon
} from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { reviews as reviewsApi } from '../../services/api';

const decisions = [
  { value: 'ticked', label: 'Accept', icon: CheckIcon, color: 'green' },
  { value: 'crossed', label: 'Reject', icon: XMarkIcon, color: 'red' },
  { value: 'question', label: 'Maybe', icon: QuestionMarkCircleIcon, color: 'yellow' }
];

export default function ReviewForm({ candidateId, existingReview, onSaved }) {
  const [decision, setDecision] = useState(existingReview?.decision || '');
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comments, setComments] = useState(existingReview?.comments || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setDecision(existingReview.decision || '');
      setRating(existingReview.rating || 0);
      setComments(existingReview.comments || '');
    }
  }, [existingReview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!decision) {
      setError('Please select a decision');
      return;
    }

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      await reviewsApi.submit(candidateId, {
        decision,
        rating: rating || null,
        comments: comments || null
      });
      setSaved(true);
      onSaved?.();
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save review');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Decision Buttons */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Decision
        </label>
        <div className="flex space-x-2">
          {decisions.map(({ value, label, icon: Icon, color }) => (
            <button
              key={value}
              type="button"
              onClick={() => setDecision(value)}
              className={`flex-1 inline-flex items-center justify-center px-4 py-3 border-2 rounded-lg transition-colors ${
                decision === value
                  ? `border-${color}-500 bg-${color}-50 text-${color}-700`
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
              style={{
                borderColor: decision === value ? (color === 'green' ? '#22c55e' : color === 'red' ? '#ef4444' : '#eab308') : undefined,
                backgroundColor: decision === value ? (color === 'green' ? '#f0fdf4' : color === 'red' ? '#fef2f2' : '#fefce8') : undefined,
                color: decision === value ? (color === 'green' ? '#15803d' : color === 'red' ? '#b91c1c' : '#a16207') : undefined
              }}
            >
              <Icon className="h-5 w-5 mr-2" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Star Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating (optional)
        </label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star === rating ? 0 : star)}
              className="p-1 focus:outline-none"
            >
              {star <= rating ? (
                <StarIcon className="h-8 w-8 text-yellow-400" />
              ) : (
                <StarOutline className="h-8 w-8 text-gray-300 hover:text-yellow-400" />
              )}
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-gray-500 self-center">{rating}/5</span>
          )}
        </div>
      </div>

      {/* Comments */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Comments (optional)
        </label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={3}
          placeholder="Add notes about this candidate..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded text-sm">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={saving || !decision}
        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
          saved
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-indigo-600 hover:bg-indigo-700'
        } disabled:opacity-50`}
      >
        {saving ? 'Saving...' : saved ? 'Saved!' : existingReview ? 'Update Review' : 'Submit Review'}
      </button>
    </form>
  );
}
