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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bed_updates: {
        Row: {
          created_at: string | null
          hospital_id: string
          id: string
          new_beds: number
          previous_beds: number
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          hospital_id: string
          id?: string
          new_beds: number
          previous_beds: number
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          hospital_id?: string
          id?: string
          new_beds?: number
          previous_beds?: number
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bed_updates_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospital_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bed_updates_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string | null
          name: string
          organization: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message?: string | null
          name: string
          organization?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string | null
          name?: string
          organization?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      hospital_alerts: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string | null
          hospital_id: string
          id: string
          message: string
          severity: string | null
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string | null
          hospital_id: string
          id?: string
          message: string
          severity?: string | null
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string | null
          hospital_id?: string
          id?: string
          message?: string
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hospital_alerts_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospital_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hospital_alerts_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitals: {
        Row: {
          accreditations: string[] | null
          address: string
          ambulance_count: number | null
          available_beds: number
          created_at: string | null
          doctors_available: number
          emergency_available: boolean | null
          established: number | null
          icu_beds: number | null
          id: string
          insurance: Json | null
          lat: number
          lng: number
          name: string
          nicu_available: boolean | null
          phone: string
          rating: number | null
          review_count: number | null
          specialties: Json | null
          status: string
          total_beds: number
          type: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          accreditations?: string[] | null
          address: string
          ambulance_count?: number | null
          available_beds?: number
          created_at?: string | null
          doctors_available?: number
          emergency_available?: boolean | null
          established?: number | null
          icu_beds?: number | null
          id?: string
          insurance?: Json | null
          lat: number
          lng: number
          name: string
          nicu_available?: boolean | null
          phone: string
          rating?: number | null
          review_count?: number | null
          specialties?: Json | null
          status?: string
          total_beds?: number
          type: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          accreditations?: string[] | null
          address?: string
          ambulance_count?: number | null
          available_beds?: number
          created_at?: string | null
          doctors_available?: number
          emergency_available?: boolean | null
          established?: number | null
          icu_beds?: number | null
          id?: string
          insurance?: Json | null
          lat?: number
          lng?: number
          name?: string
          nicu_available?: boolean | null
          phone?: string
          rating?: number | null
          review_count?: number | null
          specialties?: Json | null
          status?: string
          total_beds?: number
          type?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      queue_events: {
        Row: {
          created_at: string | null
          department: string
          event_time: string | null
          hospital_name: string
          id: string
          patient_name: string
          processed: boolean | null
          risk: string
        }
        Insert: {
          created_at?: string | null
          department: string
          event_time?: string | null
          hospital_name: string
          id?: string
          patient_name: string
          processed?: boolean | null
          risk: string
        }
        Update: {
          created_at?: string | null
          department?: string
          event_time?: string | null
          hospital_name?: string
          id?: string
          patient_name?: string
          processed?: boolean | null
          risk?: string
        }
        Relationships: []
      }
      triage_logs: {
        Row: {
          ai_response: Json
          created_at: string | null
          id: string
          recommended_department: string | null
          symptoms: string
          urgency_level: string | null
          user_id: string | null
        }
        Insert: {
          ai_response: Json
          created_at?: string | null
          id?: string
          recommended_department?: string | null
          symptoms: string
          urgency_level?: string | null
          user_id?: string | null
        }
        Update: {
          ai_response?: Json
          created_at?: string | null
          id?: string
          recommended_department?: string | null
          symptoms?: string
          urgency_level?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      hospital_analytics: {
        Row: {
          active_alerts: number | null
          available_beds: number | null
          doctors_available: number | null
          id: string | null
          name: string | null
          occupancy_rate: number | null
          status: string | null
          total_beds: number | null
          total_updates: number | null
          type: string | null
        }
        Insert: {
          active_alerts?: never
          available_beds?: number | null
          doctors_available?: number | null
          id?: string | null
          name?: string | null
          occupancy_rate?: never
          status?: string | null
          total_beds?: number | null
          total_updates?: never
          type?: string | null
        }
        Update: {
          active_alerts?: never
          available_beds?: number | null
          doctors_available?: number | null
          id?: string | null
          name?: string | null
          occupancy_rate?: never
          status?: string | null
          total_beds?: number | null
          total_updates?: never
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
