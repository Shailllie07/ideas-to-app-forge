// Local type definitions for database tables
// These types match the Supabase schema and are used until types.ts is regenerated

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  bio: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  blood_type: string | null;
  medical_allergies: string[];
  medical_conditions: string[];
  medical_medications: string[];
  emergency_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  phone_number: string;
  relationship: string | null;
  email: string | null;
  notes: string | null;
  is_primary: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled';
  budget: number | null;
  notes: string | null;
  itinerary: any;
  created_at: string;
  updated_at: string;
}

export interface OfflineMap {
  id: string;
  user_id: string;
  region_name: string;
  region_id: string;
  size_bytes: number;
  download_status: 'pending' | 'downloading' | 'completed' | 'failed';
  last_updated: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'booking' | 'emergency';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  trip_id: string | null;
  booking_type: 'flight' | 'train' | 'bus' | 'hotel';
  booking_reference: string | null;
  provider: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  details: any;
  price: number | null;
  currency: string;
  booking_date: string;
  travel_date: string | null;
  created_at: string;
  updated_at: string;
}
