-- Add duration_hours column to work_sessions for tracking livestream hours
ALTER TABLE public.work_sessions 
ADD COLUMN duration_hours numeric(4,2) DEFAULT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.work_sessions.duration_hours IS 'Duration in hours, primarily used for livestream sessions to calculate pay';