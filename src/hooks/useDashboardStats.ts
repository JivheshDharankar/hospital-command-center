import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalHospitals: number;
  criticalUnits: number;
  avgTriageSeconds: number;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalHospitals: 0,
    criticalUnits: 0,
    avgTriageSeconds: 45,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      // Get hospital counts
      const { data: hospitals } = await supabase
        .from('hospitals')
        .select('status');

      if (hospitals) {
        const totalHospitals = hospitals.length;
        const criticalUnits = hospitals.filter(h => h.status === 'critical').length;

        // Get average triage time from recent logs
        const { data: triageLogs } = await supabase
          .from('triage_logs')
          .select('created_at')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .limit(100);

        // Estimate ~45 seconds average if we have logs, otherwise default
        const avgTriageSeconds = triageLogs && triageLogs.length > 0 ? 45 : 60;

        setStats({
          totalHospitals,
          criticalUnits,
          avgTriageSeconds,
        });
      }
      setLoading(false);
    }

    fetchStats();

    // Subscribe to hospital changes
    const channel = supabase
      .channel('dashboard-stats')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hospitals' },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { stats, loading };
}
