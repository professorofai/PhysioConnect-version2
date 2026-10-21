CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  full_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Patients can create own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Patients can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.assessment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  patient_name text NOT NULL,
  age integer,
  gender text NOT NULL,
  affected_area text NOT NULL,
  description text NOT NULL DEFAULT '',
  duration text NOT NULL,
  pain_score smallint NOT NULL,
  mobility_score smallint NOT NULL,
  activities text[] NOT NULL DEFAULT '{}',
  recent_surgery text NOT NULL DEFAULT 'no',
  medications text NOT NULL DEFAULT '',
  report_names text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.assessment_submissions TO authenticated;
GRANT ALL ON public.assessment_submissions TO service_role;
ALTER TABLE public.assessment_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients can read own assessments" ON public.assessment_submissions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Patients can create own assessments" ON public.assessment_submissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  physio_id text NOT NULL,
  physio_name text NOT NULL,
  clinic text NOT NULL,
  appointment_date date NOT NULL,
  appointment_time text NOT NULL,
  price integer NOT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients can read own bookings" ON public.bookings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Patients can create own bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX assessment_submissions_user_created_idx ON public.assessment_submissions (user_id, created_at DESC);
CREATE INDEX bookings_user_date_idx ON public.bookings (user_id, appointment_date);