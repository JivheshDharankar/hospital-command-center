-- 1. Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Create hospitals table
CREATE TABLE public.hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  available_beds INTEGER NOT NULL DEFAULT 0,
  total_beds INTEGER NOT NULL DEFAULT 0,
  doctors_available INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'normal' CHECK (status IN ('normal', 'busy', 'critical')),
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('government', 'private', 'trust')),
  accreditations TEXT[] DEFAULT '{}',
  rating NUMERIC(2,1) DEFAULT 4.0,
  review_count INTEGER DEFAULT 0,
  specialties JSONB DEFAULT '[]',
  insurance JSONB DEFAULT '[]',
  emergency_available BOOLEAN DEFAULT true,
  ambulance_count INTEGER DEFAULT 2,
  icu_beds INTEGER DEFAULT 0,
  nicu_available BOOLEAN DEFAULT false,
  established INTEGER,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 5. Create contact_submissions table
CREATE TABLE public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Create bed_updates table (audit trail for realtime)
CREATE TABLE public.bed_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE NOT NULL,
  previous_beds INTEGER NOT NULL,
  new_beds INTEGER NOT NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Enable RLS on all tables
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bed_updates ENABLE ROW LEVEL SECURITY;

-- 8. Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 9. RLS Policies for hospitals (public read, admin write)
CREATE POLICY "Anyone can view hospitals"
  ON public.hospitals FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert hospitals"
  ON public.hospitals FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update hospitals"
  ON public.hospitals FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete hospitals"
  ON public.hospitals FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 10. RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 11. RLS Policies for user_roles (only admins can manage)
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 12. RLS Policies for contact_submissions
CREATE POLICY "Anyone can submit contact form"
  ON public.contact_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own submissions"
  ON public.contact_submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all submissions"
  ON public.contact_submissions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 13. RLS Policies for bed_updates
CREATE POLICY "Anyone can view bed updates"
  ON public.bed_updates FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert bed updates"
  ON public.bed_updates FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 14. Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Give all new users the 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 15. Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_hospitals_updated_at
  BEFORE UPDATE ON public.hospitals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 16. Enable realtime for bed_updates and hospitals
ALTER PUBLICATION supabase_realtime ADD TABLE public.bed_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hospitals;

-- 17. Seed the 15 Pune hospitals
INSERT INTO public.hospitals (name, available_beds, total_beds, doctors_available, status, lat, lng, phone, address, type, accreditations, rating, review_count, specialties, insurance, emergency_available, ambulance_count, icu_beds, nicu_available, established, website) VALUES
('Sahyadri Super Speciality Hospital', 45, 120, 28, 'normal', 18.5308, 73.8475, '+91-20-6721-3000', 'Plot No. 30-C, Erandwane, Karve Road, Pune 411004', 'private', ARRAY['NABH', 'NABL', 'JCI'], 4.6, 2847, '[{"name": "Cardiology", "available": true, "waitTime": 15, "queue": 3}, {"name": "Neurology", "available": true, "waitTime": 20, "queue": 5}, {"name": "Orthopedics", "available": true, "waitTime": 10, "queue": 2}]', '[{"name": "Star Health", "cashless": true}, {"name": "HDFC Ergo", "cashless": true}, {"name": "ICICI Lombard", "cashless": true}]', true, 5, 24, true, 1994, 'https://sahyadrihospitals.com'),

('Ruby Hall Clinic', 38, 150, 35, 'busy', 18.5362, 73.8869, '+91-20-6645-5000', '40, Sassoon Road, Pune 411001', 'private', ARRAY['NABH', 'NABL'], 4.5, 3521, '[{"name": "Cardiology", "available": true, "waitTime": 25, "queue": 8}, {"name": "Oncology", "available": true, "waitTime": 30, "queue": 6}, {"name": "Nephrology", "available": true, "waitTime": 20, "queue": 4}]', '[{"name": "Max Bupa", "cashless": true}, {"name": "Bajaj Allianz", "cashless": true}, {"name": "New India Assurance", "cashless": true}]', true, 8, 35, true, 1959, 'https://rubyhall.com'),

('Jehangir Hospital', 52, 180, 42, 'normal', 18.5285, 73.8725, '+91-20-6681-8888', '32, Sassoon Road, Pune 411001', 'private', ARRAY['NABH', 'JCI'], 4.7, 4102, '[{"name": "Cardiology", "available": true, "waitTime": 12, "queue": 2}, {"name": "Gastroenterology", "available": true, "waitTime": 15, "queue": 3}, {"name": "Pulmonology", "available": true, "waitTime": 10, "queue": 1}]', '[{"name": "United India", "cashless": true}, {"name": "Oriental Insurance", "cashless": true}, {"name": "Religare", "cashless": true}]', true, 6, 28, true, 1946, 'https://jehangirhospital.com'),

('Deenanath Mangeshkar Hospital', 28, 100, 22, 'busy', 18.4973, 73.8289, '+91-20-6602-6800', 'Erandwane, Near Mhatre Bridge, Pune 411004', 'trust', ARRAY['NABH'], 4.4, 1893, '[{"name": "General Medicine", "available": true, "waitTime": 35, "queue": 10}, {"name": "Pediatrics", "available": true, "waitTime": 20, "queue": 5}, {"name": "Gynecology", "available": true, "waitTime": 25, "queue": 6}]', '[{"name": "Star Health", "cashless": true}, {"name": "HDFC Ergo", "cashless": false}]', true, 4, 18, true, 1991, 'https://dframegroup.com'),

('Sassoon General Hospital', 85, 200, 55, 'critical', 18.5283, 73.8693, '+91-20-2612-3456', 'Sassoon Road, Pune 411001', 'government', ARRAY['NABH'], 3.8, 5621, '[{"name": "Emergency", "available": true, "waitTime": 45, "queue": 25}, {"name": "General Surgery", "available": true, "waitTime": 60, "queue": 18}, {"name": "Trauma", "available": true, "waitTime": 30, "queue": 12}]', '[{"name": "Ayushman Bharat", "cashless": true}, {"name": "ESIC", "cashless": true}]', true, 10, 40, true, 1867, NULL),

('KEM Hospital', 62, 150, 38, 'normal', 18.5055, 73.8295, '+91-20-2612-6300', 'Sardar Moodliar Road, Rasta Peth, Pune 411011', 'trust', ARRAY['NABH', 'NABL'], 4.2, 2156, '[{"name": "Diabetes Care", "available": true, "waitTime": 20, "queue": 6}, {"name": "Ophthalmology", "available": true, "waitTime": 15, "queue": 4}, {"name": "ENT", "available": true, "waitTime": 18, "queue": 5}]', '[{"name": "Ayushman Bharat", "cashless": true}, {"name": "Star Health", "cashless": true}]', true, 4, 22, false, 1912, 'https://kemhospitalpune.org'),

('Aditya Birla Memorial Hospital', 55, 130, 32, 'normal', 18.6475, 73.7763, '+91-20-3071-7777', 'Aditya Birla Hospital Marg, Chinchwad, Pune 411033', 'private', ARRAY['NABH', 'NABL', 'JCI'], 4.5, 2789, '[{"name": "Cardiac Sciences", "available": true, "waitTime": 18, "queue": 4}, {"name": "Neurosciences", "available": true, "waitTime": 22, "queue": 5}, {"name": "Orthopedics", "available": true, "waitTime": 15, "queue": 3}]', '[{"name": "ICICI Lombard", "cashless": true}, {"name": "Max Bupa", "cashless": true}, {"name": "Bajaj Allianz", "cashless": true}]', true, 6, 26, true, 2007, 'https://adityabirlahospital.com'),

('Symbiosis University Hospital', 35, 80, 18, 'normal', 18.5167, 73.8418, '+91-20-2567-5678', 'Lavale, Mulshi, Pune 412115', 'private', ARRAY['NABH'], 4.3, 892, '[{"name": "General Medicine", "available": true, "waitTime": 12, "queue": 2}, {"name": "Pediatrics", "available": true, "waitTime": 15, "queue": 3}, {"name": "Dermatology", "available": true, "waitTime": 10, "queue": 1}]', '[{"name": "Star Health", "cashless": true}, {"name": "HDFC Ergo", "cashless": true}]', true, 3, 12, false, 2015, 'https://suh.edu.in'),

('Sancheti Hospital', 42, 95, 24, 'normal', 18.5167, 73.8563, '+91-20-2553-8900', '16, Shivajinagar, Pune 411005', 'private', ARRAY['NABH', 'NABL'], 4.4, 1756, '[{"name": "Orthopedics", "available": true, "waitTime": 20, "queue": 6}, {"name": "Sports Medicine", "available": true, "waitTime": 15, "queue": 3}, {"name": "Rehabilitation", "available": true, "waitTime": 12, "queue": 2}]', '[{"name": "New India Assurance", "cashless": true}, {"name": "United India", "cashless": true}]', true, 4, 16, false, 1966, 'https://sanchetihospital.org'),

('Noble Hospital', 48, 110, 26, 'busy', 18.5392, 73.8950, '+91-20-6612-5555', '153, Magarpatta City Road, Hadapsar, Pune 411028', 'private', ARRAY['NABH'], 4.3, 1423, '[{"name": "Cardiology", "available": true, "waitTime": 28, "queue": 7}, {"name": "Urology", "available": true, "waitTime": 22, "queue": 5}, {"name": "General Surgery", "available": true, "waitTime": 25, "queue": 6}]', '[{"name": "Bajaj Allianz", "cashless": true}, {"name": "Religare", "cashless": true}]', true, 5, 20, true, 2003, 'https://noblehospitalspune.com'),

('Inamdar Multispeciality Hospital', 32, 75, 16, 'normal', 18.4880, 73.9150, '+91-20-2699-3000', 'Fatima Nagar, Wanowrie, Pune 411040', 'private', ARRAY['NABH'], 4.1, 987, '[{"name": "Obstetrics", "available": true, "waitTime": 18, "queue": 4}, {"name": "Gynecology", "available": true, "waitTime": 20, "queue": 5}, {"name": "Pediatrics", "available": true, "waitTime": 15, "queue": 3}]', '[{"name": "Star Health", "cashless": true}, {"name": "ICICI Lombard", "cashless": false}]', true, 3, 10, true, 1998, 'https://inamdarhospital.com'),

('Columbia Asia Hospital', 40, 100, 22, 'normal', 18.5628, 73.9162, '+91-20-6728-8888', 'Kharadi, Mundhwa, Pune 411014', 'private', ARRAY['NABH', 'JCI'], 4.4, 1654, '[{"name": "Emergency Medicine", "available": true, "waitTime": 10, "queue": 2}, {"name": "Internal Medicine", "available": true, "waitTime": 15, "queue": 3}, {"name": "Orthopedics", "available": true, "waitTime": 18, "queue": 4}]', '[{"name": "Max Bupa", "cashless": true}, {"name": "HDFC Ergo", "cashless": true}, {"name": "Bajaj Allianz", "cashless": true}]', true, 4, 18, true, 2008, 'https://columbiaasiahospitals.com'),

('Poona Hospital', 58, 140, 30, 'normal', 18.5195, 73.8553, '+91-20-2605-1000', '27, Sadashiv Peth, Pune 411030', 'private', ARRAY['NABH', 'NABL'], 4.2, 2341, '[{"name": "Cardiology", "available": true, "waitTime": 20, "queue": 5}, {"name": "Neurology", "available": true, "waitTime": 25, "queue": 6}, {"name": "Gastroenterology", "available": true, "waitTime": 18, "queue": 4}]', '[{"name": "Oriental Insurance", "cashless": true}, {"name": "New India Assurance", "cashless": true}]', true, 5, 24, true, 1934, 'https://poonahospital.org'),

('Bharati Hospital', 72, 180, 45, 'busy', 18.4630, 73.8584, '+91-20-2437-2222', 'Dhankawadi, Pune 411043', 'trust', ARRAY['NABH', 'NABL'], 4.0, 3012, '[{"name": "General Medicine", "available": true, "waitTime": 35, "queue": 12}, {"name": "Surgery", "available": true, "waitTime": 40, "queue": 10}, {"name": "Orthopedics", "available": true, "waitTime": 30, "queue": 8}]', '[{"name": "Ayushman Bharat", "cashless": true}, {"name": "ESIC", "cashless": true}, {"name": "Star Health", "cashless": true}]', true, 6, 30, true, 1989, 'https://bharatividyapeeth.edu'),

('Ratna Memorial Hospital', 22, 50, 12, 'normal', 18.5089, 73.8076, '+91-20-2544-6789', 'Kothrud, Pune 411038', 'private', ARRAY['NABH'], 4.0, 654, '[{"name": "General Medicine", "available": true, "waitTime": 15, "queue": 3}, {"name": "Pediatrics", "available": true, "waitTime": 12, "queue": 2}, {"name": "Dermatology", "available": true, "waitTime": 10, "queue": 1}]', '[{"name": "Star Health", "cashless": true}]', true, 2, 8, false, 2001, NULL);