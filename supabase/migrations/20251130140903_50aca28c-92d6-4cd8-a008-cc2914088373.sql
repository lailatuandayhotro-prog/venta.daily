-- Create staff table
CREATE TABLE public.staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create session type enum
CREATE TYPE public.session_type AS ENUM ('livestream', 'video', 'event');

-- Create time slot enum  
CREATE TYPE public.time_slot AS ENUM ('sáng', 'chiều', 'tối');

-- Create work sessions table
CREATE TABLE public.work_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  time_slot public.time_slot NOT NULL,
  product_category TEXT NOT NULL,
  session_type public.session_type NOT NULL DEFAULT 'livestream',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create junction table for many-to-many relationship between sessions and staff
CREATE TABLE public.session_staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.work_sessions(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  UNIQUE(session_id, staff_id)
);

-- Enable RLS
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_staff ENABLE ROW LEVEL SECURITY;

-- RLS policies for staff (authenticated users can view and manage)
CREATE POLICY "Authenticated users can view staff" ON public.staff
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert staff" ON public.staff
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update staff" ON public.staff
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete staff" ON public.staff
  FOR DELETE TO authenticated USING (true);

-- RLS policies for work_sessions
CREATE POLICY "Authenticated users can view sessions" ON public.work_sessions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert sessions" ON public.work_sessions
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update sessions" ON public.work_sessions
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete sessions" ON public.work_sessions
  FOR DELETE TO authenticated USING (true);

-- RLS policies for session_staff
CREATE POLICY "Authenticated users can view session_staff" ON public.session_staff
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert session_staff" ON public.session_staff
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can delete session_staff" ON public.session_staff
  FOR DELETE TO authenticated USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON public.staff
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_work_sessions_updated_at
  BEFORE UPDATE ON public.work_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default staff
INSERT INTO public.staff (name) VALUES 
  ('An'),
  ('Chi'),
  ('Kỳ'),
  ('Ngân Hà'),
  ('Trà My');