import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WaitTimePrediction {
  hospital_id: string;
  hospital_name: string;
  predicted_wait_minutes: number;
  confidence: 'low' | 'medium' | 'high';
  trend: 'increasing' | 'stable' | 'decreasing';
  reasoning: string;
}

interface PredictionResult {
  predictions: WaitTimePrediction[];
  generated_at: string;
}

export function useWaitTimePrediction() {
  const [predictions, setPredictions] = useState<WaitTimePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPredictions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke<PredictionResult>('predict-wait-times');

      if (invokeError) throw invokeError;

      if (data?.predictions) {
        setPredictions(data.predictions);
        setLastUpdated(new Date(data.generated_at));
      }
    } catch (err) {
      console.error('Error fetching predictions:', err);
      setError('Failed to fetch wait time predictions');
    } finally {
      setLoading(false);
    }
  }, []);

  const getPredictionForHospital = useCallback((hospitalId: string): WaitTimePrediction | undefined => {
    return predictions.find(p => p.hospital_id === hospitalId);
  }, [predictions]);

  const getConfidenceColor = useCallback((confidence: WaitTimePrediction['confidence']): string => {
    switch (confidence) {
      case 'high': return 'text-emerald-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  }, []);

  const getTrendIcon = useCallback((trend: WaitTimePrediction['trend']): string => {
    switch (trend) {
      case 'increasing': return '↑';
      case 'decreasing': return '↓';
      case 'stable': return '→';
      default: return '→';
    }
  }, []);

  const getTrendColor = useCallback((trend: WaitTimePrediction['trend']): string => {
    switch (trend) {
      case 'increasing': return 'text-red-500';
      case 'decreasing': return 'text-emerald-500';
      case 'stable': return 'text-amber-500';
      default: return 'text-muted-foreground';
    }
  }, []);

  return {
    predictions,
    loading,
    error,
    lastUpdated,
    fetchPredictions,
    getPredictionForHospital,
    getConfidenceColor,
    getTrendIcon,
    getTrendColor
  };
}
