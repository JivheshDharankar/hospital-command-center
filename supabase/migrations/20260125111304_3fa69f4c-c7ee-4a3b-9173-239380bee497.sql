-- Fix security warnings for new tables

-- Fix notifications INSERT policy - require auth
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "Admins can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Fix dispatch_requests INSERT policy - track who requested
DROP POLICY IF EXISTS "Authenticated users can create dispatch requests" ON public.dispatch_requests;
CREATE POLICY "Authenticated users can create dispatch requests"
ON public.dispatch_requests FOR INSERT TO authenticated
WITH CHECK (auth.uid() = requested_by);

-- Fix transfer_requests INSERT policy - track who requested  
DROP POLICY IF EXISTS "Authenticated users can create transfer requests" ON public.transfer_requests;
CREATE POLICY "Authenticated users can create transfer requests"
ON public.transfer_requests FOR INSERT TO authenticated
WITH CHECK (auth.uid() = requested_by);

-- Fix hospital_analytics view - convert from SECURITY DEFINER to regular view
DROP VIEW IF EXISTS public.hospital_analytics;
CREATE VIEW public.hospital_analytics AS
SELECT 
  h.id,
  h.name,
  h.status,
  h.type,
  h.available_beds,
  h.total_beds,
  h.doctors_available,
  ROUND((1 - h.available_beds::NUMERIC / NULLIF(h.total_beds, 0)) * 100, 2) as occupancy_rate,
  COALESCE(bu.update_count, 0) as total_updates,
  COALESCE(ha.alert_count, 0) as active_alerts
FROM hospitals h
LEFT JOIN (
  SELECT hospital_id, COUNT(*) as update_count
  FROM bed_updates
  GROUP BY hospital_id
) bu ON h.id = bu.hospital_id
LEFT JOIN (
  SELECT hospital_id, COUNT(*) as alert_count
  FROM hospital_alerts
  WHERE acknowledged = false
  GROUP BY hospital_id
) ha ON h.id = ha.hospital_id;

-- Grant access to the view
GRANT SELECT ON public.hospital_analytics TO authenticated;
GRANT SELECT ON public.hospital_analytics TO anon;