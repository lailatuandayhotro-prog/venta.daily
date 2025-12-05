-- Create table for staff availability (weekly schedule)
CREATE TABLE public.staff_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 1 = Monday, etc.
  time_slot time_slot NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(staff_id, day_of_week, time_slot)
);

-- Enable RLS
ALTER TABLE public.staff_availability ENABLE ROW LEVEL SECURITY;

-- RLS policies for staff_availability
CREATE POLICY "Authenticated users can view availability"
ON public.staff_availability
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert availability"
ON public.staff_availability
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete availability"
ON public.staff_availability
FOR DELETE
USING (true);