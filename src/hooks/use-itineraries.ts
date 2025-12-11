import { useState, useEffect, useCallback } from 'react';
import { ItineraryLean } from '@/models/itinerary/Itinerary';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://trawell-yuxn.vercel.app';

interface PaginationInfo {
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}

interface UseItinerariesReturn {
  itineraries: ItineraryLean[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  fetchItineraries: (page?: number) => Promise<void>;
}

export function useItineraries(
  userId: string | undefined,
  initialLimit: number = 16
): UseItinerariesReturn {
  const [itineraries, setItineraries] = useState<ItineraryLean[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const fetchItineraries = useCallback(async (page: number = 0) => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const limit = initialLimit;
      const skip = page * limit;
      
      const response = await fetch(
        `${API_BASE_URL}/api/itineraries/user/${userId}?limit=${limit}&skip=${skip}`
      );

      if (!response.ok) {
        throw new Error('Error al cargar los itinerarios');
      }

      const data = await response.json();
      
      if (data.success) {
        setItineraries(data.data.itineraries);
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (err) {
      console.error('Error fetching itineraries:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar itinerarios');
    } finally {
      setIsLoading(false);
    }
  }, [userId, initialLimit]); 
  useEffect(() => {
    fetchItineraries(0);
  }, [fetchItineraries]); 

  return {
    itineraries,
    isLoading,
    error,
    pagination,
    fetchItineraries,
  };
}