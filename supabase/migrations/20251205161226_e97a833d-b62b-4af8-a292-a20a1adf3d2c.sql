-- Add user_id column to staff table to link with auth users
ALTER TABLE public.staff 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL UNIQUE;

-- Update RLS policy for staff_availability to only allow users to manage their own availability
DROP POLICY IF EXISTS "Authenticated users can insert availability" ON public.staff_availability;
DROP POLICY IF EXISTS "Authenticated users can delete availability" ON public.staff_availability;

CREATE POLICY "Users can insert their own availability"
ON public.staff_availability
FOR INSERT
WITH CHECK (
  staff_id IN (SELECT id FROM public.staff WHERE user_id = auth.uid())
);

CREATE POLICY "Users can delete their own availability"
ON public.staff_availability
FOR DELETE
USING (
  staff_id IN (SELECT id FROM public.staff WHERE user_id = auth.uid())
);