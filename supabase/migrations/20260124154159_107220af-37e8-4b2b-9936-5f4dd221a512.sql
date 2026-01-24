-- Create department_stats table for real-time department metrics
CREATE TABLE public.department_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE NOT NULL,
  department TEXT NOT NULL,
  current_queue INTEGER NOT NULL DEFAULT 0,
  avg_wait_minutes INTEGER NOT NULL DEFAULT 15,
  staff_count INTEGER NOT NULL DEFAULT 5,
  capacity INTEGER NOT NULL DEFAULT 20,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(hospital_id, department)
);

-- Enable RLS
ALTER TABLE public.department_stats ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view department stats"
ON public.department_stats FOR SELECT
USING (true);

CREATE POLICY "Admins can manage department stats"
ON public.department_stats FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.department_stats;

-- Function: Calculate queue counts per department across all hospitals
CREATE OR REPLACE FUNCTION public.calculate_queue_counts()
RETURNS TABLE(
  department TEXT,
  total_queue INTEGER,
  avg_wait INTEGER,
  hospitals_count INTEGER
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT 
    department,
    COALESCE(SUM(current_queue), 0)::INTEGER as total_queue,
    COALESCE(AVG(avg_wait_minutes), 15)::INTEGER as avg_wait,
    COUNT(DISTINCT hospital_id)::INTEGER as hospitals_count
  FROM public.department_stats
  GROUP BY department
  ORDER BY total_queue DESC;
$$;

-- Function: Get cohort statistics based on queue_events patterns
CREATE OR REPLACE FUNCTION public.get_cohort_statistics()
RETURNS TABLE(
  cohort_name TEXT,
  patient_count INTEGER,
  risk_level TEXT,
  trend_percent INTEGER
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  WITH risk_counts AS (
    SELECT 
      risk,
      COUNT(*)::INTEGER as cnt,
      COUNT(*) FILTER (WHERE created_at > now() - interval '7 days')::INTEGER as recent_cnt,
      COUNT(*) FILTER (WHERE created_at > now() - interval '14 days' AND created_at <= now() - interval '7 days')::INTEGER as prev_cnt
    FROM public.queue_events
    WHERE created_at > now() - interval '90 days'
    GROUP BY risk
  )
  SELECT 
    CASE risk
      WHEN 'High' THEN 'Frequent ED users (≥4 visits/year)'
      WHEN 'Medium' THEN 'Chronic condition patients'
      WHEN 'Low' THEN 'Routine care patients'
    END as cohort_name,
    cnt as patient_count,
    risk as risk_level,
    CASE 
      WHEN prev_cnt = 0 THEN 0
      ELSE ((recent_cnt - prev_cnt) * 100 / GREATEST(prev_cnt, 1))
    END::INTEGER as trend_percent
  FROM risk_counts
  ORDER BY 
    CASE risk WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 ELSE 3 END;
$$;

-- Function: Get surge prediction based on historical patterns
CREATE OR REPLACE FUNCTION public.get_surge_prediction()
RETURNS TABLE(
  current_occupancy NUMERIC,
  predicted_occupancy NUMERIC,
  surge_risk TEXT,
  prediction_window_minutes INTEGER,
  recommended_actions JSONB
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  WITH hospital_stats AS (
    SELECT 
      SUM(total_beds) as total_beds,
      SUM(available_beds) as available_beds,
      COUNT(*) FILTER (WHERE status = 'critical') as critical_count
    FROM public.hospitals
  ),
  recent_events AS (
    SELECT COUNT(*) as event_count
    FROM public.queue_events
    WHERE created_at > now() - interval '2 hours'
  )
  SELECT 
    ROUND((1 - hs.available_beds::NUMERIC / NULLIF(hs.total_beds, 0)) * 100, 1) as current_occupancy,
    ROUND(LEAST(100, (1 - hs.available_beds::NUMERIC / NULLIF(hs.total_beds, 0)) * 100 + (re.event_count * 0.5)), 1) as predicted_occupancy,
    CASE 
      WHEN (1 - hs.available_beds::NUMERIC / NULLIF(hs.total_beds, 0)) > 0.7 OR hs.critical_count > 2 THEN 'High'
      WHEN (1 - hs.available_beds::NUMERIC / NULLIF(hs.total_beds, 0)) > 0.5 OR hs.critical_count > 0 THEN 'Medium'
      ELSE 'Low'
    END as surge_risk,
    90 as prediction_window_minutes,
    CASE 
      WHEN (1 - hs.available_beds::NUMERIC / NULLIF(hs.total_beds, 0)) > 0.7 THEN 
        '["Flag upcoming ED overload to operations", "Recommend diverting high-risk cases", "Call in additional staff"]'::JSONB
      WHEN (1 - hs.available_beds::NUMERIC / NULLIF(hs.total_beds, 0)) > 0.5 THEN 
        '["Pre-emptively reallocate staff", "Prepare overflow capacity"]'::JSONB
      ELSE 
        '["Continue monitoring"]'::JSONB
    END as recommended_actions
  FROM hospital_stats hs, recent_events re;
$$;

-- Function to get dynamic stats for StatsGrid
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS TABLE(
  total_hospitals INTEGER,
  critical_units INTEGER,
  avg_triage_seconds INTEGER
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM public.hospitals),
    (SELECT COUNT(*)::INTEGER FROM public.hospitals WHERE status = 'critical'),
    (SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (created_at - created_at)))::INTEGER, 45) FROM public.triage_logs WHERE created_at > now() - interval '24 hours')
  ;
$$;