-- =============================================
-- PHASE 1: Historical Analytics
-- =============================================

-- Analytics snapshots for historical data
CREATE TABLE public.analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  occupancy_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  total_patients INTEGER NOT NULL DEFAULT 0,
  avg_wait_minutes INTEGER NOT NULL DEFAULT 0,
  critical_events INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(hospital_id, snapshot_date)
);

ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view analytics snapshots"
ON public.analytics_snapshots FOR SELECT USING (true);

CREATE POLICY "System can insert snapshots"
ON public.analytics_snapshots FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Function to generate daily snapshot
CREATE OR REPLACE FUNCTION public.generate_daily_snapshot()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.analytics_snapshots (hospital_id, snapshot_date, occupancy_rate, total_patients, avg_wait_minutes, critical_events)
  SELECT 
    h.id,
    CURRENT_DATE,
    ROUND((1 - h.available_beds::NUMERIC / NULLIF(h.total_beds, 0)) * 100, 2),
    COALESCE((SELECT COUNT(*) FROM queue_events WHERE created_at::DATE = CURRENT_DATE), 0)::INTEGER,
    COALESCE((SELECT AVG(avg_wait_minutes) FROM department_stats WHERE hospital_id = h.id), 15)::INTEGER,
    COALESCE((SELECT COUNT(*) FROM hospital_alerts WHERE hospital_id = h.id AND severity = 'critical' AND created_at::DATE = CURRENT_DATE), 0)::INTEGER
  FROM hospitals h
  ON CONFLICT (hospital_id, snapshot_date) DO UPDATE SET
    occupancy_rate = EXCLUDED.occupancy_rate,
    total_patients = EXCLUDED.total_patients,
    avg_wait_minutes = EXCLUDED.avg_wait_minutes,
    critical_events = EXCLUDED.critical_events;
END;
$$;

-- Function to get historical analytics
CREATE OR REPLACE FUNCTION public.get_historical_analytics(days INTEGER DEFAULT 30)
RETURNS TABLE(
  snapshot_date DATE,
  avg_occupancy NUMERIC,
  total_patients BIGINT,
  avg_wait INTEGER,
  critical_events BIGINT,
  hospital_count BIGINT
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT 
    snapshot_date,
    ROUND(AVG(occupancy_rate), 2) as avg_occupancy,
    SUM(total_patients) as total_patients,
    AVG(avg_wait_minutes)::INTEGER as avg_wait,
    SUM(critical_events) as critical_events,
    COUNT(DISTINCT hospital_id) as hospital_count
  FROM public.analytics_snapshots
  WHERE snapshot_date >= CURRENT_DATE - days
  GROUP BY snapshot_date
  ORDER BY snapshot_date ASC;
$$;

-- =============================================
-- PHASE 2: Patient Journey Tracking
-- =============================================

-- Patients registry
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mrn TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  date_of_birth DATE,
  phone TEXT,
  emergency_contact TEXT,
  blood_type TEXT,
  allergies JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view patients"
ON public.patients FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage patients"
ON public.patients FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Patient journeys (admissions)
CREATE TABLE public.patient_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE NOT NULL,
  admission_type TEXT NOT NULL CHECK (admission_type IN ('emergency', 'scheduled', 'transfer')),
  status TEXT NOT NULL DEFAULT 'admitted' CHECK (status IN ('admitted', 'in-treatment', 'discharged', 'transferred')),
  department TEXT NOT NULL,
  bed_id TEXT,
  attending_doctor TEXT,
  admitted_at TIMESTAMPTZ DEFAULT now(),
  discharged_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.patient_journeys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view journeys"
ON public.patient_journeys FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage journeys"
ON public.patient_journeys FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for patient_journeys
ALTER PUBLICATION supabase_realtime ADD TABLE public.patient_journeys;

-- Journey events (timeline)
CREATE TABLE public.journey_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID REFERENCES public.patient_journeys(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('triage', 'admission', 'transfer', 'procedure', 'medication', 'test', 'consultation', 'discharge')),
  event_time TIMESTAMPTZ DEFAULT now(),
  department TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  staff_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.journey_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view journey events"
ON public.journey_events FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage journey events"
ON public.journey_events FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for journey_events
ALTER PUBLICATION supabase_realtime ADD TABLE public.journey_events;

-- =============================================
-- PHASE 3: Push Notifications
-- =============================================

-- Notification subscriptions (Web Push)
CREATE TABLE public.notification_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subscription_endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, subscription_endpoint)
);

ALTER TABLE public.notification_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own subscriptions"
ON public.notification_subscriptions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- In-app notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('alert', 'info', 'success', 'warning')),
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Notification preferences
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  critical_alerts BOOLEAN DEFAULT true,
  capacity_warnings BOOLEAN DEFAULT true,
  transfer_requests BOOLEAN DEFAULT true,
  patient_updates BOOLEAN DEFAULT true,
  email_digest TEXT DEFAULT 'daily' CHECK (email_digest IN ('none', 'daily', 'weekly')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences"
ON public.notification_preferences FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =============================================
-- PHASE 4: Ambulance Dispatch
-- =============================================

-- Ambulance fleet
CREATE TABLE public.ambulances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE NOT NULL,
  registration_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'dispatched', 'returning', 'maintenance')),
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  last_update TIMESTAMPTZ DEFAULT now(),
  crew_count INTEGER DEFAULT 2,
  equipment JSONB DEFAULT '["stretcher", "defibrillator", "oxygen"]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ambulances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ambulances"
ON public.ambulances FOR SELECT USING (true);

CREATE POLICY "Admins can manage ambulances"
ON public.ambulances FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for ambulances
ALTER PUBLICATION supabase_realtime ADD TABLE public.ambulances;

-- Dispatch requests
CREATE TABLE public.dispatch_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambulance_id UUID REFERENCES public.ambulances(id),
  origin_lat DOUBLE PRECISION NOT NULL,
  origin_lng DOUBLE PRECISION NOT NULL,
  origin_address TEXT,
  destination_hospital_id UUID REFERENCES public.hospitals(id) NOT NULL,
  patient_condition TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('critical', 'high', 'normal')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'dispatched', 'en-route', 'arrived', 'completed', 'cancelled')),
  requested_by UUID,
  requested_at TIMESTAMPTZ DEFAULT now(),
  dispatched_at TIMESTAMPTZ,
  arrived_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  eta_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.dispatch_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view dispatch requests"
ON public.dispatch_requests FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage dispatch requests"
ON public.dispatch_requests FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can create dispatch requests"
ON public.dispatch_requests FOR INSERT TO authenticated WITH CHECK (true);

-- Enable realtime for dispatch_requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.dispatch_requests;

-- =============================================
-- PHASE 5: Inter-Hospital Transfers
-- =============================================

-- Transfer requests
CREATE TABLE public.transfer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_hospital_id UUID REFERENCES public.hospitals(id) NOT NULL,
  destination_hospital_id UUID REFERENCES public.hospitals(id) NOT NULL,
  patient_journey_id UUID REFERENCES public.patient_journeys(id),
  patient_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'normal' CHECK (urgency IN ('critical', 'high', 'normal')),
  specialty_needed TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'in-transit', 'completed', 'cancelled')),
  requested_by UUID,
  responded_by UUID,
  requested_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.transfer_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view transfer requests"
ON public.transfer_requests FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage transfer requests"
ON public.transfer_requests FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can create transfer requests"
ON public.transfer_requests FOR INSERT TO authenticated WITH CHECK (true);

-- Enable realtime for transfer_requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.transfer_requests;

-- Transfer communications
CREATE TABLE public.transfer_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id UUID REFERENCES public.transfer_requests(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.transfer_communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view transfer communications"
ON public.transfer_communications FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can send messages"
ON public.transfer_communications FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

-- Enable realtime for transfer_communications
ALTER PUBLICATION supabase_realtime ADD TABLE public.transfer_communications;

-- =============================================
-- Update triggers for updated_at
-- =============================================

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_patient_journeys_updated_at
  BEFORE UPDATE ON public.patient_journeys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();