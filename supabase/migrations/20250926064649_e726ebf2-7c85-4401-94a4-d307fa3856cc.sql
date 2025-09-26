-- Create trips table for travel planning
CREATE TABLE public.trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'confirmed', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ai_generated_itinerary JSONB,
  notes TEXT
);

-- Create bookings table for transportation and accommodation
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  booking_type TEXT NOT NULL CHECK (booking_type IN ('flight', 'train', 'bus', 'hotel')),
  booking_reference TEXT,
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  booking_data JSONB NOT NULL,
  total_amount DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  booking_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  travel_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trip activities table for itinerary management
CREATE TABLE public.trip_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_time TIME,
  end_time TIME,
  activity_type TEXT CHECK (activity_type IN ('sightseeing', 'dining', 'transport', 'accommodation', 'activity', 'other')),
  estimated_cost DECIMAL(10,2),
  booking_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table for user alerts
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('booking_update', 'weather_alert', 'safety_warning', 'trip_reminder', 'emergency', 'general')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  related_id UUID,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security on all tables
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for trips
CREATE POLICY "Users can view their own trips" 
ON public.trips 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trips" 
ON public.trips 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips" 
ON public.trips 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips" 
ON public.trips 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for bookings
CREATE POLICY "Users can view their own bookings" 
ON public.bookings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" 
ON public.bookings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookings" 
ON public.bookings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for trip activities
CREATE POLICY "Users can manage activities for their trips" 
ON public.trip_activities 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.trips 
    WHERE trips.id = trip_activities.trip_id 
    AND trips.user_id = auth.uid()
  )
);

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_trips_user_id ON public.trips(user_id);
CREATE INDEX idx_trips_status ON public.trips(status);
CREATE INDEX idx_trips_dates ON public.trips(start_date, end_date);

CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_trip_id ON public.bookings(trip_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_type ON public.bookings(booking_type);

CREATE INDEX idx_trip_activities_trip_id ON public.trip_activities(trip_id);
CREATE INDEX idx_trip_activities_day ON public.trip_activities(day_number);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON public.notifications(type);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trip_activities_updated_at
  BEFORE UPDATE ON public.trip_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get user's active trips
CREATE OR REPLACE FUNCTION public.get_active_trips(user_uuid UUID)
RETURNS TABLE(
  trip_id UUID,
  title TEXT,
  destination TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT,
  days_until_start INTEGER
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id as trip_id,
    title,
    destination,
    start_date,
    end_date,
    status,
    (start_date - CURRENT_DATE)::INTEGER as days_until_start
  FROM public.trips
  WHERE user_id = user_uuid
    AND status IN ('planning', 'confirmed', 'ongoing')
    AND end_date >= CURRENT_DATE
  ORDER BY start_date ASC;
$$;

-- Create function to get trip statistics
CREATE OR REPLACE FUNCTION public.get_trip_statistics(user_uuid UUID)
RETURNS TABLE(
  total_trips BIGINT,
  completed_trips BIGINT,
  upcoming_trips BIGINT,
  total_spent DECIMAL
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COUNT(*) as total_trips,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_trips,
    COUNT(*) FILTER (WHERE status IN ('planning', 'confirmed') AND start_date > CURRENT_DATE) as upcoming_trips,
    COALESCE(SUM(budget) FILTER (WHERE status = 'completed'), 0) as total_spent
  FROM public.trips
  WHERE user_id = user_uuid;
$$;