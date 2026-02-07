-- Add secure access token to patient_journeys for QR code access
ALTER TABLE patient_journeys ADD COLUMN IF NOT EXISTS access_token UUID DEFAULT gen_random_uuid();
ALTER TABLE patient_journeys ADD COLUMN IF NOT EXISTS qr_generated_at TIMESTAMPTZ;

-- Add phone and notification preferences to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sms_enabled BOOLEAN DEFAULT false;

-- Create external_notifications table for WhatsApp/SMS tracking
CREATE TABLE IF NOT EXISTS public.external_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  notification_type TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('sms', 'whatsapp')),
  recipient TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
  external_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  sent_at TIMESTAMPTZ,
  error_message TEXT
);

-- Create staff table for resource allocation
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES hospitals(id) NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('doctor', 'nurse', 'technician')),
  specialty TEXT,
  current_department TEXT,
  status TEXT DEFAULT 'on-duty' CHECK (status IN ('on-duty', 'off-duty', 'on-call', 'break')),
  shift_start TIMESTAMPTZ,
  shift_end TIMESTAMPTZ,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create staff_assignments table for audit trail
CREATE TABLE IF NOT EXISTS public.staff_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE NOT NULL,
  from_department TEXT,
  to_department TEXT NOT NULL,
  assigned_by UUID,
  reason TEXT,
  effective_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.external_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies for external_notifications
CREATE POLICY "Users can view own external notifications"
ON public.external_notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage external notifications"
ON public.external_notifications FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS policies for staff
CREATE POLICY "Anyone can view staff"
ON public.staff FOR SELECT
USING (true);

CREATE POLICY "Admins can manage staff"
ON public.staff FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS policies for staff_assignments
CREATE POLICY "Anyone can view staff assignments"
ON public.staff_assignments FOR SELECT
USING (true);

CREATE POLICY "Admins can manage staff assignments"
ON public.staff_assignments FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Policy for public access to patient journey with token (via RPC function)
CREATE OR REPLACE FUNCTION public.get_journey_by_token(_journey_id UUID, _token UUID)
RETURNS SETOF patient_journeys
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM patient_journeys
  WHERE id = _journey_id AND access_token = _token
  LIMIT 1;
$$;

-- Enable realtime for staff tables
ALTER PUBLICATION supabase_realtime ADD TABLE staff;
ALTER PUBLICATION supabase_realtime ADD TABLE staff_assignments;

-- Add some demo staff data
INSERT INTO public.staff (hospital_id, name, role, specialty, current_department, status) 
SELECT 
  h.id,
  CASE (random() * 5)::int
    WHEN 0 THEN 'Dr. Amit Patel'
    WHEN 1 THEN 'Dr. Priya Sharma'
    WHEN 2 THEN 'Dr. Rajesh Kumar'
    WHEN 3 THEN 'Dr. Sneha Gupta'
    ELSE 'Dr. Vikram Singh'
  END,
  'doctor',
  CASE (random() * 4)::int
    WHEN 0 THEN 'Cardiology'
    WHEN 1 THEN 'Neurology'
    WHEN 2 THEN 'Emergency Medicine'
    ELSE 'General Medicine'
  END,
  CASE (random() * 4)::int
    WHEN 0 THEN 'Emergency'
    WHEN 1 THEN 'ICU'
    WHEN 2 THEN 'General Ward'
    ELSE 'OPD'
  END,
  'on-duty'
FROM hospitals h
LIMIT 15;

INSERT INTO public.staff (hospital_id, name, role, specialty, current_department, status) 
SELECT 
  h.id,
  CASE (random() * 5)::int
    WHEN 0 THEN 'Nr. Anita Deshmukh'
    WHEN 1 THEN 'Nr. Kavita Joshi'
    WHEN 2 THEN 'Nr. Meera Rao'
    WHEN 3 THEN 'Nr. Sunita Patil'
    ELSE 'Nr. Rekha Kulkarni'
  END,
  'nurse',
  NULL,
  CASE (random() * 4)::int
    WHEN 0 THEN 'Emergency'
    WHEN 1 THEN 'ICU'
    WHEN 2 THEN 'General Ward'
    ELSE 'OPD'
  END,
  'on-duty'
FROM hospitals h
LIMIT 20;