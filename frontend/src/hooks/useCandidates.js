import { useState, useEffect, useCallback } from 'react';
import { candidates as candidatesApi } from '../services/api';

export function useCandidates(filters = {}) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await candidatesApi.list(filters);
      setCandidates(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const sync = async () => {
    try {
      setLoading(true);
      await candidatesApi.sync();
      await fetchCandidates();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to sync candidates');
      throw err;
    }
  };

  return { candidates, loading, error, refetch: fetchCandidates, sync };
}

export function useCandidate(id) {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCandidate = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await candidatesApi.get(id);
      setCandidate(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch candidate');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCandidate();
  }, [fetchCandidate]);

  return { candidate, loading, error, refetch: fetchCandidate };
}

export function useRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    candidatesApi.getRoles()
      .then(res => setRoles(res.data))
      .catch(() => setRoles([]))
      .finally(() => setLoading(false));
  }, []);

  return { roles, loading };
}

export default useCandidates;
