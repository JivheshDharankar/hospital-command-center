-- =============================================
-- PHASE 2: HACKATHON BACKEND ENHANCEMENTS
-- =============================================

-- 1. Hospital Alerts Table
CREATE TABLE public.hospital_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('critical_beds', 'surge', 'emergency', 'capacity_warning')),
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hospital_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hospital_alerts
CREATE POLICY "Anyone can view alerts" ON public.hospital_alerts
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert alerts" ON public.hospital_alerts
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update alerts" ON public.hospital_alerts
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete alerts" ON public.hospital_alerts
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable Realtime for alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.hospital_alerts;

-- 2. AI Triage Logs Table
CREATE TABLE public.triage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  symptoms TEXT NOT NULL,
  ai_response JSONB NOT NULL,
  recommended_department TEXT,
  urgency_level TEXT CHECK (urgency_level IN ('low', 'medium', 'high', 'emergency')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.triage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for triage_logs
CREATE POLICY "Users can view own triage logs" ON public.triage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all triage logs" ON public.triage_logs
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert triage logs" ON public.triage_logs
  FOR INSERT WITH CHECK (true);

-- 3. Hospital Analytics View (for edge function)
CREATE OR REPLACE VIEW public.hospital_analytics AS
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

-- 4. Function to auto-create alerts when hospital goes critical
CREATE OR REPLACE FUNCTION public.check_hospital_status_alert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If status changed to critical, create an alert
  IF NEW.status = 'critical' AND (OLD.status IS NULL OR OLD.status != 'critical') THEN
    INSERT INTO public.hospital_alerts (hospital_id, alert_type, message, severity)
    VALUES (
      NEW.id,
      'critical_beds',
      'Hospital ' || NEW.name || ' has reached critical bed capacity with only ' || NEW.available_beds || ' beds available.',
      'critical'
    );
  END IF;
  
  -- If status changed to busy from normal, create warning
  IF NEW.status = 'busy' AND OLD.status = 'normal' THEN
    INSERT INTO public.hospital_alerts (hospital_id, alert_type, message, severity)
    VALUES (
      NEW.id,
      'capacity_warning',
      'Hospital ' || NEW.name || ' is experiencing high demand with ' || NEW.available_beds || ' beds remaining.',
      'warning'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto-alerts
CREATE TRIGGER hospital_status_alert_trigger
  AFTER UPDATE ON public.hospitals
  FOR EACH ROW
  EXECUTE FUNCTION public.check_hospital_status_alert();