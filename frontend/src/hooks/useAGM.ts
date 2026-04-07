import { useState, useCallback } from 'react';
import apiClient from '../services/apiClient';

export interface AGM {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  status: 'draft' | 'scheduled' | 'completed';
  created_by: string;
  created_at: string;
  updated_at: string;
  invitation_count?: number;
  rsvp_summary?: {
    pending: number;
    attending: number;
    not_attending: number;
    maybe: number;
  };
}

interface ListResponse {
  agms: AGM[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

/**
 * useAGM Hook
 * Manages AGM operations (list, create, update, delete, get detail)
 */
export const useAGM = () => {
  const [agms, setAGMs] = useState<AGM[]>([]);
  const [currentAGM, setCurrentAGM] = useState<AGM | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 1,
  });

  /**
   * Fetch AGMs for current user
   */
  const fetchAGMs = useCallback(
    async (filters = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: filters.page || '1',
          limit: filters.limit || '20',
          ...(filters.status && { status: filters.status }),
          ...(filters.date_from && { date_from: filters.date_from }),
          ...(filters.date_to && { date_to: filters.date_to }),
        });

        const response = await apiClient.get<ListResponse>(
          `/agms?${params.toString()}`
        );

        setAGMs(response.data.agms);
        setPagination(response.data.pagination);
      } catch (err: any) {
        const message =
          err.response?.data?.error?.message || 'Failed to fetch AGMs';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Get specific AGM details
   */
  const getAGM = useCallback(async (agmId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<{ agm: AGM }>(`/agms/${agmId}`);
      setCurrentAGM(response.data.agm);
      return response.data.agm;
    } catch (err: any) {
      const message =
        err.response?.data?.error?.message || 'Failed to fetch AGM';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create new AGM
   */
  const createAGM = useCallback(
    async (name: string, date: string, time: string, location: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient.post<{ agm: AGM }>('/agms', {
          name,
          date,
          time,
          location,
        });

        const newAGM = response.data.agm;
        setAGMs((prev) => [newAGM, ...prev]);
        return newAGM;
      } catch (err: any) {
        const message =
          err.response?.data?.error?.message || 'Failed to create AGM';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Update AGM
   */
  const updateAGM = useCallback(
    async (agmId: string, updates: Partial<AGM>) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient.patch<{ agm: AGM }>(
          `/agms/${agmId}`,
          updates
        );

        const updatedAGM = response.data.agm;
        setAGMs((prev) =>
          prev.map((agm) => (agm.id === agmId ? updatedAGM : agm))
        );
        if (currentAGM?.id === agmId) {
          setCurrentAGM(updatedAGM);
        }
        return updatedAGM;
      } catch (err: any) {
        const message =
          err.response?.data?.error?.message || 'Failed to update AGM';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [currentAGM]
  );

  /**
   * Delete AGM
   */
  const deleteAGM = useCallback(async (agmId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.delete(`/agms/${agmId}`);

      setAGMs((prev) => prev.filter((agm) => agm.id !== agmId));
      if (currentAGM?.id === agmId) {
        setCurrentAGM(null);
      }
      return true;
    } catch (err: any) {
      const message =
        err.response?.data?.error?.message || 'Failed to delete AGM';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentAGM]);

  return {
    agms,
    currentAGM,
    isLoading,
    error,
    pagination,
    fetchAGMs,
    getAGM,
    createAGM,
    updateAGM,
    deleteAGM,
  };
};

export default useAGM;
