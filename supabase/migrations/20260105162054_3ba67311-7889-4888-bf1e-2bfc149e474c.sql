-- Fix: Convert SECURITY DEFINER view to regular view with explicit permissions
DROP VIEW IF EXISTS public.hospital_analytics;

-- Recreate as a regular view (not security definer)
CREATE VIEW public.hospital_analytics AS
SELECT 
  h.id,
  h.name,
  h.status,
  h.available_beds,
  h.total_beds,
  h.doctors_available,
  ROUND((1 - (h.available_beds::numeric / NULLIF(h.total_beds, 0))) * 100, 1) as occupancy_rate,
  h.type,
  (SELECT COUNT(*) FROM bed_updates WHERE hospital_id = h.id) as total_updates,
  (SELECT COUNT(*) FROM hospital_alerts WHERE hospital_id = h.id AND acknowledged = false) as active_alerts
FROM hospitals h;

-- Grant access to authenticated users
GRANT SELECT ON public.hospital_analytics TO authenticated;
GRANT SELECT ON public.hospital_analytics TO anon;