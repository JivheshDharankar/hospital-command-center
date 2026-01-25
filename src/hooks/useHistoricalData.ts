import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HistoricalDataPoint {
  snapshot_date: string;
  avg_occupancy: number;
  total_patients: number;
  avg_wait: number;
  critical_events: number;
  hospital_count: number;
}

interface UseHistoricalDataReturn {
  data: HistoricalDataPoint[];
  loading: boolean;
  error: string | null;
  refetch: (days?: number) => Promise<void>;
  generateSnapshot: () => Promise<void>;
}

export function useHistoricalData(initialDays: number = 30): UseHistoricalDataReturn {
  const [data, setData] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (days: number = 30) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: result, error: rpcError } = await supabase
        .rpc('get_historical_analytics', { days });

      if (rpcError) throw rpcError;
      
      setData(result || []);
    } catch (err) {
      console.error('Error fetching historical data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch historical data');
    } finally {
      setLoading(false);
    }
  }, []);

  const generateSnapshot = useCallback(async () => {
    try {
      const { error: rpcError } = await supabase.rpc('generate_daily_snapshot');
      if (rpcError) throw rpcError;
      await fetchData(initialDays);
    } catch (err) {
      console.error('Error generating snapshot:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate snapshot');
    }
  }, [fetchData, initialDays]);

  useEffect(() => {
    fetchData(initialDays);
  }, [fetchData, initialDays]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    generateSnapshot
  };
}
