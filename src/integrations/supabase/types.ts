export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          booking_data: Json
          booking_date: string
          booking_reference: string | null
          booking_type: string
          created_at: string
          currency: string | null
          id: string
          provider: string
          status: string
          total_amount: number | null
          travel_date: string | null
          trip_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_data: Json
          booking_date?: string
          booking_reference?: string | null
          booking_type: string
          created_at?: string
          currency?: string | null
          id?: string
          provider: string
          status?: string
          total_amount?: number | null
          travel_date?: string | null
          trip_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_data?: Json
          booking_date?: string
          booking_reference?: string | null
          booking_type?: string
          created_at?: string
          currency?: string | null
          id?: string
          provider?: string
          status?: string
          total_amount?: number | null
          travel_date?: string | null
          trip_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_contacts: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_primary: boolean | null
          name: string
          notes: string | null
          phone_number: string
          relationship: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name: string
          notes?: string | null
          phone_number: string
          relationship: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string
          notes?: string | null
          phone_number?: string
          relationship?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_read: boolean
          message: string
          priority: string
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message: string
          priority?: string
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message?: string
          priority?: string
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      offline_maps: {
        Row: {
          download_date: string
          file_size: number | null
          id: string
          is_active: boolean | null
          map_style: string | null
          region_bounds: Json
          region_name: string
          user_id: string
        }
        Insert: {
          download_date?: string
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          map_style?: string | null
          region_bounds: Json
          region_name: string
          user_id: string
        }
        Update: {
          download_date?: string
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          map_style?: string | null
          region_bounds?: Json
          region_name?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          blood_type: string | null
          created_at: string
          display_name: string | null
          emergency_contact_consent: boolean | null
          emergency_notes: string | null
          id: string
          medical_allergies: string[] | null
          medical_conditions: string[] | null
          medical_medications: string[] | null
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          blood_type?: string | null
          created_at?: string
          display_name?: string | null
          emergency_contact_consent?: boolean | null
          emergency_notes?: string | null
          id: string
          medical_allergies?: string[] | null
          medical_conditions?: string[] | null
          medical_medications?: string[] | null
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          blood_type?: string | null
          created_at?: string
          display_name?: string | null
          emergency_contact_consent?: boolean | null
          emergency_notes?: string | null
          id?: string
          medical_allergies?: string[] | null
          medical_conditions?: string[] | null
          medical_medications?: string[] | null
          phone_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      trip_activities: {
        Row: {
          activity_type: string | null
          booking_url: string | null
          created_at: string
          day_number: number
          description: string | null
          end_time: string | null
          estimated_cost: number | null
          id: string
          location: string | null
          start_time: string | null
          title: string
          trip_id: string
          updated_at: string
        }
        Insert: {
          activity_type?: string | null
          booking_url?: string | null
          created_at?: string
          day_number: number
          description?: string | null
          end_time?: string | null
          estimated_cost?: number | null
          id?: string
          location?: string | null
          start_time?: string | null
          title: string
          trip_id: string
          updated_at?: string
        }
        Update: {
          activity_type?: string | null
          booking_url?: string | null
          created_at?: string
          day_number?: number
          description?: string | null
          end_time?: string | null
          estimated_cost?: number | null
          id?: string
          location?: string | null
          start_time?: string | null
          title?: string
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_activities_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          ai_generated_itinerary: Json | null
          budget: number | null
          created_at: string
          destination: string
          end_date: string
          id: string
          notes: string | null
          start_date: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_generated_itinerary?: Json | null
          budget?: number | null
          created_at?: string
          destination: string
          end_date: string
          id?: string
          notes?: string | null
          start_date: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_generated_itinerary?: Json | null
          budget?: number | null
          created_at?: string
          destination?: string
          end_date?: string
          id?: string
          notes?: string | null
          start_date?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_active_trips: {
        Args: { user_uuid: string }
        Returns: {
          days_until_start: number
          destination: string
          end_date: string
          start_date: string
          status: string
          title: string
          trip_id: string
        }[]
      }
      get_trip_statistics: {
        Args: { user_uuid: string }
        Returns: {
          completed_trips: number
          total_spent: number
          total_trips: number
          upcoming_trips: number
        }[]
      }
      get_trip_with_activities: {
        Args: { trip_uuid: string }
        Returns: {
          activities: Json
          ai_generated_itinerary: Json
          budget: number
          destination: string
          end_date: string
          notes: string
          start_date: string
          status: string
          title: string
          trip_id: string
        }[]
      }
      get_user_booking_stats: {
        Args: { user_uuid: string }
        Returns: {
          avg_booking_amount: number
          cancelled_bookings: number
          confirmed_bookings: number
          pending_bookings: number
          total_bookings: number
          total_spent: number
        }[]
      }
      search_user_trips: {
        Args: { search_term: string; user_uuid: string }
        Returns: {
          budget: number
          destination: string
          end_date: string
          relevance_score: number
          start_date: string
          status: string
          title: string
          trip_id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
