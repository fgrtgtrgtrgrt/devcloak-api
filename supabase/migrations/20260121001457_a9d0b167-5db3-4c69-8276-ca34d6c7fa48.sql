-- Fix the overly permissive policies by making them more specific
-- These tables need to allow inserts from the edge function (service role), not anonymous users

-- Drop the permissive policies
DROP POLICY IF EXISTS "Anyone can insert executions" ON public.script_executions;
DROP POLICY IF EXISTS "Anyone can request hwid reset" ON public.hwid_resets;

-- For script_executions, we'll use service role from edge function
-- No public insert policy needed - edge function uses service role
-- Add a policy that allows authenticated users to view their script executions (already exists)

-- For hwid_resets, require authenticated users only
CREATE POLICY "Authenticated users can request hwid reset" ON public.hwid_resets 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);