import { useState, useMemo } from 'react';
import { useFilters } from '../context/FilterContext';
import { useCandidates } from '../hooks/useCandidates';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import CandidateList from '../components/candidates/CandidateList';
import CandidateDetail from '../components/candidates/CandidateDetail';

export default function Dashboard() {
  const { filters } = useFilters();
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);

  // Build API filters
  const apiFilters = useMemo(() => ({
    role: filters.role || undefined,
    search: filters.search || undefined,
    reviewed_by_me: filters.reviewedByMe
  }), [filters.role, filters.search, filters.reviewedByMe]);

  const { candidates, loading, error, refetch, sync } = useCandidates(apiFilters);

  // Filter by consensus on client side (since it's computed)
  const filteredCandidates = useMemo(() => {
    if (!filters.consensus) return candidates;
    return candidates.filter(c => c.consensus?.level === filters.consensus);
  }, [candidates, filters.consensus]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      await sync();
      setSyncMessage({ type: 'success', text: 'Sync completed successfully' });
    } catch (err) {
      setSyncMessage({ type: 'error', text: err.response?.data?.error || 'Sync failed' });
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  const handleCandidateSelect = (candidate) => {
    setSelectedCandidateId(candidate.id);
  };

  const handleDetailClose = () => {
    setSelectedCandidateId(null);
    refetch(); // Refresh list to show updated review status
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Sync Message */}
      {syncMessage && (
        <div className={`px-4 py-2 text-sm text-center ${
          syncMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {syncMessage.text}
        </div>
      )}

      <div className="flex">
        <Sidebar onSync={handleSync} syncing={syncing} />

        <main className="flex-1 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              Candidates
              <span className="ml-2 text-sm text-gray-500">
                ({filteredCandidates.length})
              </span>
            </h2>
          </div>

          <CandidateList
            candidates={filteredCandidates}
            loading={loading}
            error={error}
            onSelect={handleCandidateSelect}
          />
        </main>
      </div>

      <CandidateDetail
        candidateId={selectedCandidateId}
        isOpen={selectedCandidateId !== null}
        onClose={handleDetailClose}
      />
    </div>
  );
}
