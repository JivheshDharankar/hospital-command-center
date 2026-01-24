import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CohortStat {
  name: string;
  size: number;
  risk: 'High' | 'Medium' | 'Low';
  trend: string;
}

export function useCohortStats() {
  const [cohorts, setCohorts] = useState<CohortStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCohorts() {
      // Get queue events grouped by risk level
      const { data: events } = await supabase
        .from('queue_events')
        .select('risk, created_at')
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

      if (events && events.length > 0) {
        const riskCounts = events.reduce((acc, event) => {
          acc[event.risk] = (acc[event.risk] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Calculate trends (last 7 days vs previous 7 days)
        const now = Date.now();
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
        const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;

        const recentByRisk = events.reduce((acc, event) => {
          const eventTime = new Date(event.created_at).getTime();
          if (eventTime > weekAgo) {
            acc[event.risk] = (acc[event.risk] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

        const prevByRisk = events.reduce((acc, event) => {
          const eventTime = new Date(event.created_at).getTime();
          if (eventTime > twoWeeksAgo && eventTime <= weekAgo) {
            acc[event.risk] = (acc[event.risk] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

        const cohortData: CohortStat[] = [
          {
            name: 'Frequent ED users (≥4 visits/year)',
            size: riskCounts['High'] || 0,
            risk: 'High' as const,
            trend: calculateTrend(recentByRisk['High'] || 0, prevByRisk['High'] || 0),
          },
          {
            name: 'Chronic condition patients',
            size: riskCounts['Medium'] || 0,
            risk: 'Medium' as const,
            trend: calculateTrend(recentByRisk['Medium'] || 0, prevByRisk['Medium'] || 0),
          },
          {
            name: 'Routine care patients',
            size: riskCounts['Low'] || 0,
            risk: 'Low' as const,
            trend: calculateTrend(recentByRisk['Low'] || 0, prevByRisk['Low'] || 0),
          },
        ].filter(c => c.size > 0);

        setCohorts(cohortData.length > 0 ? cohortData : getDefaultCohorts());
      } else {
        setCohorts(getDefaultCohorts());
      }
      setLoading(false);
    }

    fetchCohorts();

    // Subscribe to queue events changes
    const channel = supabase
      .channel('cohort-stats')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'queue_events' },
        () => fetchCohorts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { cohorts, loading };
}

function calculateTrend(recent: number, prev: number): string {
  if (prev === 0) return recent > 0 ? `+${recent * 10}%` : '0%';
  const change = Math.round(((recent - prev) / prev) * 100);
  return change >= 0 ? `+${change}%` : `${change}%`;
}

function getDefaultCohorts(): CohortStat[] {
  return [
    { name: 'Frequent ED users (≥4 visits/year)', size: 0, risk: 'High', trend: '0%' },
    { name: 'Chronic condition patients', size: 0, risk: 'Medium', trend: '0%' },
    { name: 'Routine care patients', size: 0, risk: 'Low', trend: '0%' },
  ];
}
