-- Create queue_events table for real-time patient intake simulation
CREATE TABLE public.queue_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  risk TEXT NOT NULL CHECK (risk IN ('Low', 'Medium', 'High')),
  department TEXT NOT NULL,
  hospital_name TEXT NOT NULL,
  event_time TIMESTAMPTZ DEFAULT now(),
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE public.queue_events;

-- Enable RLS
ALTER TABLE public.queue_events ENABLE ROW LEVEL SECURITY;

-- Anyone can read queue events (public display)
CREATE POLICY "Anyone can read queue events"
  ON public.queue_events FOR SELECT
  USING (true);

-- Admins can insert queue events
CREATE POLICY "Admins can insert queue events"
  ON public.queue_events FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can delete queue events (for cleanup)
CREATE POLICY "Admins can delete queue events"
  ON public.queue_events FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));