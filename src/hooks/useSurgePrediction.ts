import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SurgePrediction {
  currentOccupancy: number;
  predictedOccupancy: number;
  surgeRisk: 'High' | 'Medium' | 'Low';
  predictionWindowMinutes: number;
  recommendedActions: string[];
}

export function useSurgePrediction() {
  const [prediction, setPrediction] = useState<SurgePrediction>({
    currentOccupancy: 0,
    predictedOccupancy: 0,
    surgeRisk: 'Low',
    predictionWindowMinutes: 90,
    recommendedActions: ['Continue monitoring'],
  });
  const [loading, setLoading] = useState(true);

  const calculatePrediction = useCallback(async () => {
    // Get hospital stats
    const { data: hospitals } = await supabase
      .from('hospitals')
      .select('total_beds, available_beds, status');

    // Get recent queue events (last 2 hours)
    const { data: recentEvents } = await supabase
      .from('queue_events')
      .select('id')
      .gte('created_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString());

    if (hospitals && hospitals.length > 0) {
      const totalBeds = hospitals.reduce((sum, h) => sum + h.total_beds, 0);
      const availableBeds = hospitals.reduce((sum, h) => sum + h.available_beds, 0);
      const criticalCount = hospitals.filter(h => h.status === 'critical').length;
      const eventCount = recentEvents?.length || 0;

      const currentOccupancy = totalBeds > 0 
        ? Math.round((1 - availableBeds / totalBeds) * 100) 
        : 0;
      
      // Predict based on current occupancy + recent event trend
      const predictedOccupancy = Math.min(100, currentOccupancy + Math.round(eventCount * 0.5));

      // Determine surge risk
      let surgeRisk: 'High' | 'Medium' | 'Low' = 'Low';
      if (currentOccupancy > 70 || criticalCount > 2) {
        surgeRisk = 'High';
      } else if (currentOccupancy > 50 || criticalCount > 0) {
        surgeRisk = 'Medium';
      }

      // Recommended actions based on risk
      const actions = {
        High: [
          'Flag upcoming ED overload to operations for all sites.',
          'Recommend diverting new high-risk cases to lower-pressure hospitals.',
          'Suggest calling in additional Emergency and Cardiology staff.',
        ],
        Medium: [
          'Recommend pre-emptively reallocating staff from low-pressure units.',
          'Prepare to convert OPD bays into observation beds if surge continues.',
        ],
        Low: [
          'Capacity comfortable. Continue monitoring without major interventions.',
        ],
      };

      setPrediction({
        currentOccupancy,
        predictedOccupancy,
        surgeRisk,
        predictionWindowMinutes: 90,
        recommendedActions: actions[surgeRisk],
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    calculatePrediction();

    // Subscribe to hospital and queue changes
    const channel = supabase
      .channel('surge-prediction')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hospitals' },
        () => calculatePrediction()
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'queue_events' },
        () => calculatePrediction()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [calculatePrediction]);

  return { prediction, loading };
}
