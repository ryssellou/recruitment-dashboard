import CandidateCard from './CandidateCard';

export default function CandidateList({ candidates, loading, error, onSelect }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">No candidates found.</p>
        <p className="text-sm text-gray-400 mt-1">
          Try adjusting your filters or sync from Google Sheets.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {candidates.map(candidate => (
        <CandidateCard
          key={candidate.id}
          candidate={candidate}
          onClick={() => onSelect(candidate)}
        />
      ))}
    </div>
  );
}
