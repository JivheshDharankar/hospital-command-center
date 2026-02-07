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
      ambulances: {
        Row: {
          created_at: string | null
          crew_count: number | null
          current_lat: number | null
          current_lng: number | null
          equipment: Json | null
          hospital_id: string
          id: string
          last_update: string | null
          registration_number: string
          status: string
        }
        Insert: {
          created_at?: string | null
          crew_count?: number | null
          current_lat?: number | null
          current_lng?: number | null
          equipment?: Json | null
          hospital_id: string
          id?: string
          last_update?: string | null
          registration_number: string
          status?: string
        }
        Update: {
          created_at?: string | null
          crew_count?: number | null
          current_lat?: number | null
          current_lng?: number | null
          equipment?: Json | null
          hospital_id?: string
          id?: string
          last_update?: string | null
          registration_number?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ambulances_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospital_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ambulances_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_snapshots: {
        Row: {
          avg_wait_minutes: number
          created_at: string | null
          critical_events: number
          hospital_id: string | null
          id: string
          occupancy_rate: number
          snapshot_date: string
          total_patients: number
        }
        Insert: {
          avg_wait_minutes?: number
          created_at?: string | null
          critical_events?: number
          hospital_id?: string | null
          id?: string
          occupancy_rate?: number
          snapshot_date?: string
          total_patients?: number
        }
        Update: {
          avg_wait_minutes?: number
          created_at?: string | null
          critical_events?: number
          hospital_id?: string | null
          id?: string
          occupancy_rate?: number
          snapshot_date?: string
          total_patients?: number
        }
        Relationships: [
          {
            foreignKeyName: "analytics_snapshots_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospital_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_snapshots_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
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
      department_stats: {
        Row: {
          avg_wait_minutes: number
          capacity: number
          current_queue: number
          department: string
          hospital_id: string
          id: string
          staff_count: number
          updated_at: string
        }
        Insert: {
          avg_wait_minutes?: number
          capacity?: number
          current_queue?: number
          department: string
          hospital_id: string
          id?: string
          staff_count?: number
          updated_at?: string
        }
        Update: {
          avg_wait_minutes?: number
          capacity?: number
          current_queue?: number
          department?: string
          hospital_id?: string
          id?: string
          staff_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "department_stats_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospital_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_stats_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      dispatch_requests: {
        Row: {
          ambulance_id: string | null
          arrived_at: string | null
          completed_at: string | null
          created_at: string | null
          destination_hospital_id: string
          dispatched_at: string | null
          eta_minutes: number | null
          id: string
          notes: string | null
          origin_address: string | null
          origin_lat: number
          origin_lng: number
          patient_condition: string
          priority: string
          requested_at: string | null
          requested_by: string | null
          status: string
        }
        Insert: {
          ambulance_id?: string | null
          arrived_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          destination_hospital_id: string
          dispatched_at?: string | null
          eta_minutes?: number | null
          id?: string
          notes?: string | null
          origin_address?: string | null
          origin_lat: number
          origin_lng: number
          patient_condition: string
          priority?: string
          requested_at?: string | null
          requested_by?: string | null
          status?: string
        }
        Update: {
          ambulance_id?: string | null
          arrived_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          destination_hospital_id?: string
          dispatched_at?: string | null
          eta_minutes?: number | null
          id?: string
          notes?: string | null
          origin_address?: string | null
          origin_lat?: number
          origin_lng?: number
          patient_condition?: string
          priority?: string
          requested_at?: string | null
          requested_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispatch_requests_ambulance_id_fkey"
            columns: ["ambulance_id"]
            isOneToOne: false
            referencedRelation: "ambulances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatch_requests_destination_hospital_id_fkey"
            columns: ["destination_hospital_id"]
            isOneToOne: false
            referencedRelation: "hospital_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatch_requests_destination_hospital_id_fkey"
            columns: ["destination_hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      external_notifications: {
        Row: {
          channel: string
          created_at: string | null
          error_message: string | null
          external_id: string | null
          id: string
          message: string
          notification_type: string
          recipient: string
          sent_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          channel: string
          created_at?: string | null
          error_message?: string | null
          external_id?: string | null
          id?: string
          message: string
          notification_type: string
          recipient: string
          sent_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          channel?: string
          created_at?: string | null
          error_message?: string | null
          external_id?: string | null
          id?: string
          message?: string
          notification_type?: string
          recipient?: string
          sent_at?: string | null
          status?: string | null
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
      journey_events: {
        Row: {
          created_at: string | null
          department: string | null
          details: Json | null
          event_time: string | null
          event_type: string
          id: string
          journey_id: string
          staff_id: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          details?: Json | null
          event_time?: string | null
          event_type: string
          id?: string
          journey_id: string
          staff_id?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          details?: Json | null
          event_time?: string | null
          event_type?: string
          id?: string
          journey_id?: string
          staff_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journey_events_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "patient_journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          capacity_warnings: boolean | null
          created_at: string | null
          critical_alerts: boolean | null
          email_digest: string | null
          id: string
          patient_updates: boolean | null
          transfer_requests: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          capacity_warnings?: boolean | null
          created_at?: string | null
          critical_alerts?: boolean | null
          email_digest?: string | null
          id?: string
          patient_updates?: boolean | null
          transfer_requests?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          capacity_warnings?: boolean | null
          created_at?: string | null
          critical_alerts?: boolean | null
          email_digest?: string | null
          id?: string
          patient_updates?: boolean | null
          transfer_requests?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notification_subscriptions: {
        Row: {
          auth_key: string
          created_at: string | null
          id: string
          p256dh_key: string
          subscription_endpoint: string
          user_id: string
        }
        Insert: {
          auth_key: string
          created_at?: string | null
          id?: string
          p256dh_key: string
          subscription_endpoint: string
          user_id: string
        }
        Update: {
          auth_key?: string
          created_at?: string | null
          id?: string
          p256dh_key?: string
          subscription_endpoint?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      patient_journeys: {
        Row: {
          access_token: string | null
          admission_type: string
          admitted_at: string | null
          attending_doctor: string | null
          bed_id: string | null
          created_at: string | null
          department: string
          discharged_at: string | null
          hospital_id: string
          id: string
          notes: string | null
          patient_id: string
          qr_generated_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          access_token?: string | null
          admission_type: string
          admitted_at?: string | null
          attending_doctor?: string | null
          bed_id?: string | null
          created_at?: string | null
          department: string
          discharged_at?: string | null
          hospital_id: string
          id?: string
          notes?: string | null
          patient_id: string
          qr_generated_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          access_token?: string | null
          admission_type?: string
          admitted_at?: string | null
          attending_doctor?: string | null
          bed_id?: string | null
          created_at?: string | null
          department?: string
          discharged_at?: string | null
          hospital_id?: string
          id?: string
          notes?: string | null
          patient_id?: string
          qr_generated_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_journeys_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospital_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_journeys_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_journeys_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          allergies: Json | null
          blood_type: string | null
          created_at: string | null
          date_of_birth: string | null
          emergency_contact: string | null
          id: string
          mrn: string
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          allergies?: Json | null
          blood_type?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          emergency_contact?: string | null
          id?: string
          mrn: string
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          allergies?: Json | null
          blood_type?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          emergency_contact?: string | null
          id?: string
          mrn?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          phone_number: string | null
          sms_enabled: boolean | null
          updated_at: string | null
          user_id: string
          whatsapp_enabled: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          sms_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
          whatsapp_enabled?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          sms_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
          whatsapp_enabled?: boolean | null
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
      staff: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          current_department: string | null
          hospital_id: string
          id: string
          name: string
          phone: string | null
          role: string
          shift_end: string | null
          shift_start: string | null
          specialty: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          current_department?: string | null
          hospital_id: string
          id?: string
          name: string
          phone?: string | null
          role: string
          shift_end?: string | null
          shift_start?: string | null
          specialty?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          current_department?: string | null
          hospital_id?: string
          id?: string
          name?: string
          phone?: string | null
          role?: string
          shift_end?: string | null
          shift_start?: string | null
          specialty?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospital_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_assignments: {
        Row: {
          assigned_by: string | null
          created_at: string | null
          effective_at: string | null
          from_department: string | null
          id: string
          reason: string | null
          staff_id: string
          to_department: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string | null
          effective_at?: string | null
          from_department?: string | null
          id?: string
          reason?: string | null
          staff_id: string
          to_department: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string | null
          effective_at?: string | null
          from_department?: string | null
          id?: string
          reason?: string | null
          staff_id?: string
          to_department?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_assignments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      transfer_communications: {
        Row: {
          attachments: Json | null
          created_at: string | null
          id: string
          message: string
          sender_id: string
          transfer_id: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          message: string
          sender_id: string
          transfer_id: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          message?: string
          sender_id?: string
          transfer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfer_communications_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "transfer_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      transfer_requests: {
        Row: {
          completed_at: string | null
          created_at: string | null
          destination_hospital_id: string
          id: string
          patient_journey_id: string | null
          patient_name: string
          reason: string
          rejection_reason: string | null
          requested_at: string | null
          requested_by: string | null
          responded_at: string | null
          responded_by: string | null
          source_hospital_id: string
          specialty_needed: string | null
          status: string
          urgency: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          destination_hospital_id: string
          id?: string
          patient_journey_id?: string | null
          patient_name: string
          reason: string
          rejection_reason?: string | null
          requested_at?: string | null
          requested_by?: string | null
          responded_at?: string | null
          responded_by?: string | null
          source_hospital_id: string
          specialty_needed?: string | null
          status?: string
          urgency?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          destination_hospital_id?: string
          id?: string
          patient_journey_id?: string | null
          patient_name?: string
          reason?: string
          rejection_reason?: string | null
          requested_at?: string | null
          requested_by?: string | null
          responded_at?: string | null
          responded_by?: string | null
          source_hospital_id?: string
          specialty_needed?: string | null
          status?: string
          urgency?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfer_requests_destination_hospital_id_fkey"
            columns: ["destination_hospital_id"]
            isOneToOne: false
            referencedRelation: "hospital_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_requests_destination_hospital_id_fkey"
            columns: ["destination_hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_requests_patient_journey_id_fkey"
            columns: ["patient_journey_id"]
            isOneToOne: false
            referencedRelation: "patient_journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_requests_source_hospital_id_fkey"
            columns: ["source_hospital_id"]
            isOneToOne: false
            referencedRelation: "hospital_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_requests_source_hospital_id_fkey"
            columns: ["source_hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
      }
    }
    Functions: {
      calculate_queue_counts: {
        Args: never
        Returns: {
          avg_wait: number
          department: string
          hospitals_count: number
          total_queue: number
        }[]
      }
      generate_daily_snapshot: { Args: never; Returns: undefined }
      get_cohort_statistics: {
        Args: never
        Returns: {
          cohort_name: string
          patient_count: number
          risk_level: string
          trend_percent: number
        }[]
      }
      get_dashboard_stats: {
        Args: never
        Returns: {
          avg_triage_seconds: number
          critical_units: number
          total_hospitals: number
        }[]
      }
      get_historical_analytics: {
        Args: { days?: number }
        Returns: {
          avg_occupancy: number
          avg_wait: number
          critical_events: number
          hospital_count: number
          snapshot_date: string
          total_patients: number
        }[]
      }
      get_journey_by_token: {
        Args: { _journey_id: string; _token: string }
        Returns: {
          access_token: string | null
          admission_type: string
          admitted_at: string | null
          attending_doctor: string | null
          bed_id: string | null
          created_at: string | null
          department: string
          discharged_at: string | null
          hospital_id: string
          id: string
          notes: string | null
          patient_id: string
          qr_generated_at: string | null
          status: string
          updated_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "patient_journeys"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_surge_prediction: {
        Args: never
        Returns: {
          current_occupancy: number
          predicted_occupancy: number
          prediction_window_minutes: number
          recommended_actions: Json
          surge_risk: string
        }[]
      }
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
