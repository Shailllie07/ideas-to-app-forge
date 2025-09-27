-- Create storage buckets for documents and images
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('trip-documents', 'trip-documents', false),
  ('profile-avatars', 'profile-avatars', true),
  ('trip-photos', 'trip-photos', false);

-- Create storage policies for trip documents
CREATE POLICY "Users can view their own trip documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'trip-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own trip documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'trip-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own trip documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'trip-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own trip documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'trip-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for profile avatars
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for trip photos
CREATE POLICY "Users can view their own trip photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'trip-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own trip photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'trip-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own trip photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'trip-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own trip photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'trip-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add more database functions for trip management (fixed JSON types)
CREATE OR REPLACE FUNCTION public.get_trip_with_activities(trip_uuid uuid)
RETURNS TABLE(
  trip_id uuid,
  title text,
  destination text,
  start_date date,
  end_date date,
  status text,
  budget numeric,
  notes text,
  ai_generated_itinerary jsonb,
  activities jsonb
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    t.id as trip_id,
    t.title,
    t.destination,
    t.start_date,
    t.end_date,
    t.status,
    t.budget,
    t.notes,
    t.ai_generated_itinerary,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', ta.id,
          'day_number', ta.day_number,
          'title', ta.title,
          'description', ta.description,
          'location', ta.location,
          'start_time', ta.start_time,
          'end_time', ta.end_time,
          'activity_type', ta.activity_type,
          'estimated_cost', ta.estimated_cost,
          'booking_url', ta.booking_url
        ) ORDER BY ta.day_number, ta.start_time
      ) FILTER (WHERE ta.id IS NOT NULL),
      '[]'::jsonb
    ) as activities
  FROM public.trips t
  LEFT JOIN public.trip_activities ta ON t.id = ta.trip_id
  WHERE t.id = trip_uuid 
    AND t.user_id = auth.uid()
  GROUP BY t.id, t.title, t.destination, t.start_date, t.end_date, t.status, t.budget, t.notes, t.ai_generated_itinerary;
$function$;

-- Function to get user's booking statistics
CREATE OR REPLACE FUNCTION public.get_user_booking_stats(user_uuid uuid)
RETURNS TABLE(
  total_bookings bigint,
  pending_bookings bigint,
  confirmed_bookings bigint,
  cancelled_bookings bigint,
  total_spent numeric,
  avg_booking_amount numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    COUNT(*) as total_bookings,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_bookings,
    COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_bookings,
    COALESCE(SUM(total_amount) FILTER (WHERE status = 'confirmed'), 0) as total_spent,
    COALESCE(AVG(total_amount) FILTER (WHERE status = 'confirmed'), 0) as avg_booking_amount
  FROM public.bookings
  WHERE user_id = user_uuid;
$function$;

-- Function to search trips by destination or title
CREATE OR REPLACE FUNCTION public.search_user_trips(user_uuid uuid, search_term text)
RETURNS TABLE(
  trip_id uuid,
  title text,
  destination text,
  start_date date,
  end_date date,
  status text,
  budget numeric,
  relevance_score numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    id as trip_id,
    title,
    destination,
    start_date,
    end_date,
    status,
    budget,
    (
      CASE 
        WHEN LOWER(title) LIKE LOWER('%' || search_term || '%') THEN 2
        ELSE 0
      END +
      CASE 
        WHEN LOWER(destination) LIKE LOWER('%' || search_term || '%') THEN 1
        ELSE 0
      END
    ) as relevance_score
  FROM public.trips
  WHERE user_id = user_uuid
    AND (
      LOWER(title) LIKE LOWER('%' || search_term || '%') OR
      LOWER(destination) LIKE LOWER('%' || search_term || '%')
    )
  ORDER BY relevance_score DESC, start_date DESC;
$function$;

-- Enable realtime for key tables
ALTER TABLE public.trips REPLICA IDENTITY FULL;
ALTER TABLE public.bookings REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.trip_activities REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_activities;