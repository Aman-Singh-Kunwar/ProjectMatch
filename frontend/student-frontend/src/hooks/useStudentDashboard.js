import { useState, useEffect, useCallback } from 'react';

const getApiBaseUrl = () => {
  return typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL
    : 'http://localhost:5000/api';
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('projectmatch_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export function useMyTeam() {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyTeam = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${getApiBaseUrl()}/teams/mine`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch team: ${res.statusText}`);
      }
      const data = await res.json();
      setTeam(data); // data can be null if student has no team yet
    } catch (err) {
      console.error('Error in useMyTeam:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyTeam();
  }, [fetchMyTeam]);

  return { team, setTeam, loading, error, refetch: fetchMyTeam };
}

export function useRecommendedProjects() {
  const [recommendations, setRecommendations] = useState([]);
  const [eligibleLevel, setEligibleLevel] = useState(null);
  const [reason, setReason] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${getApiBaseUrl()}/projects/recommended`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch recommendations: ${res.statusText}`);
      }
      const data = await res.json();
      setRecommendations(data.recommendations || []);
      setEligibleLevel(data.eligibleLevel || null);
      setReason(data.reason || null);
    } catch (err) {
      console.error('Error in useRecommendedProjects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return { recommendations, eligibleLevel, reason, loading, error, refetch: fetchRecommendations };
}

export function useFacultyList() {
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFaculty() {
      setLoading(true);
      try {
        const res = await fetch(`${getApiBaseUrl()}/users/faculty`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          setFacultyList(data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchFaculty();
  }, []);

  return { facultyList, loading, error };
}

export function useCreateTeam() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (projectId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${getApiBaseUrl()}/teams`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to select project.');
      }
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  };

  return { execute, loading, error };
}

export function useAddTeamMember() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (teamId, email) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${getApiBaseUrl()}/teams/${teamId}/members`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add team member.');
      }
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  };

  return { execute, loading, error };
}

export function useSubmitTeam() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (teamId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${getApiBaseUrl()}/teams/${teamId}/submit`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit team.');
      }
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  };

  return { execute, loading, error };
}

export function useProposeIdea() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async ({ title, description, domainTags, requestedMentor }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${getApiBaseUrl()}/projects/propose`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, description, domainTags, requestedMentor }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to propose custom idea.');
      }
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  };

  return { execute, loading, error };
}
