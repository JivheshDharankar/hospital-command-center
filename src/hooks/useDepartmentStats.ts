import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DepartmentStat {
  department: string;
  totalQueue: number;
  avgWait: number;
  hospitalsCount: number;
}

export function useDepartmentStats() {
  const [departments, setDepartments] = useState<DepartmentStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDepartments() {
      const { data } = await supabase
        .from('department_stats')
        .select('department, current_queue, avg_wait_minutes, hospital_id');

      if (data && data.length > 0) {
        // Aggregate by department
        const aggregated = data.reduce((acc, row) => {
          if (!acc[row.department]) {
            acc[row.department] = {
              department: row.department,
              totalQueue: 0,
              avgWait: 0,
              hospitalsCount: 0,
              waitSum: 0,
            };
          }
          acc[row.department].totalQueue += row.current_queue;
          acc[row.department].waitSum += row.avg_wait_minutes;
          acc[row.department].hospitalsCount += 1;
          return acc;
        }, {} as Record<string, DepartmentStat & { waitSum: number }>);

        const result = Object.values(aggregated).map(d => ({
          department: d.department,
          totalQueue: d.totalQueue,
          avgWait: Math.round(d.waitSum / d.hospitalsCount),
          hospitalsCount: d.hospitalsCount,
        }));

        setDepartments(result.sort((a, b) => b.totalQueue - a.totalQueue));
      }
      setLoading(false);
    }

    fetchDepartments();

    // Subscribe to department stats changes
    const channel = supabase
      .channel('department-stats')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'department_stats' },
        () => fetchDepartments()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { departments, loading };
}
