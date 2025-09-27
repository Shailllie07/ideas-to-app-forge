-- Create tables for advanced trip management and notification features

-- Trip collaborators table
CREATE TABLE public.trip_collaborators (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_by uuid NOT NULL,
  invited_at timestamp with time zone NOT NULL DEFAULT now(),
  accepted_at timestamp with time zone,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(trip_id, user_id)
);

-- Trip expenses table
CREATE TABLE public.trip_expenses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  category text NOT NULL CHECK (category IN ('transport', 'accommodation', 'food', 'activities', 'shopping', 'other')),
  description text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  date date NOT NULL,
  receipt_url text,
  split_type text NOT NULL DEFAULT 'equal' CHECK (split_type IN ('equal', 'custom', 'percentage')),
  split_data jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Location history table
CREATE TABLE public.location_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  accuracy numeric,
  timestamp timestamp with time zone NOT NULL,
  activity_type text CHECK (activity_type IN ('stationary', 'walking', 'running', 'cycling', 'driving')),
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Proximity alerts table
CREATE TABLE public.proximity_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  radius numeric NOT NULL DEFAULT 100, -- in meters
  is_active boolean NOT NULL DEFAULT true,
  alert_type text NOT NULL CHECK (alert_type IN ('enter', 'exit', 'both')),
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Location sharing sessions table
CREATE TABLE public.location_sharing_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  access_token text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Push subscriptions table
CREATE TABLE public.push_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  endpoint text NOT NULL,
  keys jsonb NOT NULL,
  device_info jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Add location_history_enabled column to profiles
ALTER TABLE public.profiles ADD COLUMN location_history_enabled boolean DEFAULT false;

-- Enable RLS on all new tables
ALTER TABLE public.trip_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proximity_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_sharing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for trip_collaborators
CREATE POLICY "Users can view collaborations they're part of" 
ON public.trip_collaborators 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() IN (
  SELECT user_id FROM public.trips WHERE id = trip_id
));

CREATE POLICY "Trip owners can manage collaborators" 
ON public.trip_collaborators 
FOR ALL 
USING (auth.uid() IN (
  SELECT user_id FROM public.trips WHERE id = trip_id
));

CREATE POLICY "Users can respond to their invitations" 
ON public.trip_collaborators 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for trip_expenses
CREATE POLICY "Collaborators can view trip expenses" 
ON public.trip_expenses 
FOR SELECT 
USING (auth.uid() IN (
  SELECT user_id FROM public.trips WHERE id = trip_id
  UNION
  SELECT user_id FROM public.trip_collaborators WHERE trip_id = trip_expenses.trip_id AND status = 'accepted'
));

CREATE POLICY "Collaborators can create trip expenses" 
ON public.trip_expenses 
FOR INSERT 
WITH CHECK (auth.uid() IN (
  SELECT user_id FROM public.trips WHERE id = trip_id
  UNION
  SELECT user_id FROM public.trip_collaborators WHERE trip_id = trip_expenses.trip_id AND status = 'accepted'
));

CREATE POLICY "Users can update their own expenses" 
ON public.trip_expenses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses" 
ON public.trip_expenses 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for location_history
CREATE POLICY "Users can manage their own location history" 
ON public.location_history 
FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for proximity_alerts
CREATE POLICY "Users can manage their own proximity alerts" 
ON public.proximity_alerts 
FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for location_sharing_sessions
CREATE POLICY "Users can manage their own location sharing sessions" 
ON public.location_sharing_sessions 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Public can view active shared locations" 
ON public.location_sharing_sessions 
FOR SELECT 
USING (is_active = true AND expires_at > now());

-- Create RLS policies for push_subscriptions
CREATE POLICY "Users can manage their own push subscriptions" 
ON public.push_subscriptions 
FOR ALL 
USING (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_trip_collaborators_updated_at
BEFORE UPDATE ON public.trip_collaborators
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trip_expenses_updated_at
BEFORE UPDATE ON public.trip_expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_proximity_alerts_updated_at
BEFORE UPDATE ON public.proximity_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_push_subscriptions_updated_at
BEFORE UPDATE ON public.push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_collaborators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.location_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.proximity_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.push_subscriptions;