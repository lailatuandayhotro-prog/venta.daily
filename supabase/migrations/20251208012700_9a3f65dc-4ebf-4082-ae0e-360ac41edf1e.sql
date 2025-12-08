-- Drop existing permissive policies for work_sessions
DROP POLICY IF EXISTS "Authenticated users can insert sessions" ON public.work_sessions;
DROP POLICY IF EXISTS "Authenticated users can update sessions" ON public.work_sessions;
DROP POLICY IF EXISTS "Authenticated users can delete sessions" ON public.work_sessions;

-- Create new policies for admin/manager only
CREATE POLICY "Managers can insert sessions" 
ON public.work_sessions 
FOR INSERT 
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Managers can update sessions" 
ON public.work_sessions 
FOR UPDATE 
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Managers can delete sessions" 
ON public.work_sessions 
FOR DELETE 
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)
);

-- Drop existing permissive policies for session_staff
DROP POLICY IF EXISTS "Authenticated users can insert session_staff" ON public.session_staff;
DROP POLICY IF EXISTS "Authenticated users can delete session_staff" ON public.session_staff;

-- Create new policies for admin/manager only
CREATE POLICY "Managers can insert session_staff" 
ON public.session_staff 
FOR INSERT 
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Managers can delete session_staff" 
ON public.session_staff 
FOR DELETE 
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)
);