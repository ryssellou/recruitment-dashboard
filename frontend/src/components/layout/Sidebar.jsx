import { useFilters } from '../../context/FilterContext';
import { useRoles } from '../../hooks/useCandidates';
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function Sidebar({ onSync, syncing }) {
  const { filters, updateFilter, resetFilters } = useFilters();
  const { roles } = useRoles();

  return (
    <aside className="w-64 bg-white shadow-sm h-full p-4 space-y-6">
      {/* Sync Button */}
      <div>
        <button
          onClick={onSync}
          disabled={syncing}
          className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync from Sheets'}
        </button>
      </div>

      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <MagnifyingGlassIcon className="h-4 w-4 inline mr-1" />
          Search
        </label>
        <input
          type="text"
          placeholder="Name or email..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Role Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <FunnelIcon className="h-4 w-4 inline mr-1" />
          Role
        </label>
        <select
          value={filters.role}
          onChange={(e) => updateFilter('role', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">All roles</option>
          {roles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      {/* Review Status Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          My Reviews
        </label>
        <select
          value={filters.reviewedByMe === null ? '' : filters.reviewedByMe.toString()}
          onChange={(e) => updateFilter('reviewedByMe', e.target.value === '' ? null : e.target.value === 'true')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">All candidates</option>
          <option value="true">Reviewed</option>
          <option value="false">Not reviewed</option>
        </select>
      </div>

      {/* Consensus Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Consensus
        </label>
        <select
          value={filters.consensus}
          onChange={(e) => updateFilter('consensus', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">All</option>
          <option value="unanimous">Unanimous</option>
          <option value="strong">Strong consensus</option>
          <option value="mixed">Mixed</option>
          <option value="none">No reviews</option>
        </select>
      </div>

      {/* Reset Filters */}
      <div>
        <button
          onClick={resetFilters}
          className="w-full text-sm text-gray-500 hover:text-gray-700"
        >
          Reset all filters
        </button>
      </div>
    </aside>
  );
}
