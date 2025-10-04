-- Fix Critical Security Issues in Database Policies

-- 1. CRITICAL: Remove public access to location_sharing_sessions
-- Current policy allows anyone to track users in real-time
DROP POLICY IF EXISTS "Public can view active shared locations" ON public.location_sharing_sessions;

-- Replace with user-only access - users can only view their own shared locations
CREATE POLICY "Users can view their own shared locations"
ON public.location_sharing_sessions
FOR SELECT
USING (auth.uid() = user_id AND is_active = true AND expires_at > now());

-- 2. Fix trip_activities RLS to include collaborators
-- Current policy only allows trip owners, breaking collaboration feature
DROP POLICY IF EXISTS "Users can manage activities for their trips" ON public.trip_activities;

-- Allow trip owners and accepted collaborators to view activities
CREATE POLICY "Trip owners and collaborators can view activities"
ON public.trip_activities
FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM public.trips WHERE id = trip_activities.trip_id
    UNION
    SELECT user_id FROM public.trip_collaborators 
    WHERE trip_id = trip_activities.trip_id 
    AND status = 'accepted'
  )
);

-- Only trip owners and editor collaborators can modify activities
CREATE POLICY "Trip owners and editors can modify activities"
ON public.trip_activities
FOR ALL
USING (
  auth.uid() IN (
    SELECT user_id FROM public.trips WHERE id = trip_activities.trip_id
    UNION
    SELECT user_id FROM public.trip_collaborators 
    WHERE trip_id = trip_activities.trip_id 
    AND status = 'accepted'
    AND role = 'editor'
  )
);

-- 3. Add INSERT policy to notifications table
-- Prevent unauthorized notification creation
CREATE POLICY "Only authenticated users can create their own notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);