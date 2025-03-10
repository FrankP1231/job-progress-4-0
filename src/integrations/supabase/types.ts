export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          activity_type: string
          created_at: string
          description: string
          field_name: string | null
          id: string
          job_id: string
          new_value: Json | null
          phase_id: string | null
          previous_value: Json | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          description: string
          field_name?: string | null
          id?: string
          job_id: string
          new_value?: Json | null
          phase_id?: string | null
          previous_value?: Json | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string
          field_name?: string | null
          id?: string
          job_id?: string
          new_value?: Json | null
          phase_id?: string | null
          previous_value?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "phases"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          buyer: string
          created_at: string
          drawings_url: string | null
          id: string
          job_number: string
          project_name: string
          salesman: string
          title: string
          updated_at: string
          worksheet_url: string | null
        }
        Insert: {
          buyer: string
          created_at?: string
          drawings_url?: string | null
          id?: string
          job_number: string
          project_name: string
          salesman: string
          title: string
          updated_at?: string
          worksheet_url?: string | null
        }
        Update: {
          buyer?: string
          created_at?: string
          drawings_url?: string | null
          id?: string
          job_number?: string
          project_name?: string
          salesman?: string
          title?: string
          updated_at?: string
          worksheet_url?: string | null
        }
        Relationships: []
      }
      phases: {
        Row: {
          created_at: string
          id: string
          installation: Json
          installation_materials: Json
          is_complete: boolean
          job_id: string
          phase_name: string
          phase_number: number
          powder_coat: Json
          sewing_labor: Json
          sewing_materials: Json
          updated_at: string
          welding_labor: Json
          welding_materials: Json
        }
        Insert: {
          created_at?: string
          id?: string
          installation?: Json
          installation_materials?: Json
          is_complete?: boolean
          job_id: string
          phase_name: string
          phase_number: number
          powder_coat?: Json
          sewing_labor?: Json
          sewing_materials?: Json
          updated_at?: string
          welding_labor?: Json
          welding_materials?: Json
        }
        Update: {
          created_at?: string
          id?: string
          installation?: Json
          installation_materials?: Json
          is_complete?: boolean
          job_id?: string
          phase_name?: string
          phase_number?: number
          powder_coat?: Json
          sewing_labor?: Json
          sewing_materials?: Json
          updated_at?: string
          welding_labor?: Json
          welding_materials?: Json
        }
        Relationships: [
          {
            foreignKeyName: "phases_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cell_phone_number: string | null
          created_at: string
          email: string | null
          first_name: string
          id: string
          last_modified_by: string | null
          last_name: string
          profile_picture_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          work_area: Database["public"]["Enums"]["work_area"]
        }
        Insert: {
          cell_phone_number?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          id: string
          last_modified_by?: string | null
          last_name: string
          profile_picture_url?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          work_area: Database["public"]["Enums"]["work_area"]
        }
        Update: {
          cell_phone_number?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_modified_by?: string | null
          last_name?: string
          profile_picture_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          work_area?: Database["public"]["Enums"]["work_area"]
        }
        Relationships: []
      }
      task_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          area: string
          created_at: string
          eta: string | null
          hours: number | null
          id: string
          is_complete: boolean
          name: string
          notes: string | null
          phase_id: string
          status: string
          updated_at: string
        }
        Insert: {
          area: string
          created_at?: string
          eta?: string | null
          hours?: number | null
          id?: string
          is_complete?: boolean
          name: string
          notes?: string | null
          phase_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          area?: string
          created_at?: string
          eta?: string | null
          hours?: number | null
          id?: string
          is_complete?: boolean
          name?: string
          notes?: string | null
          phase_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "phases"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_auth_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      user_role:
        | "Sewer"
        | "Lead Welder"
        | "Welder"
        | "Welder's Helper"
        | "Lead Installer"
        | "Installer's Helper"
        | "Installer"
        | "Front Office"
      work_area: "Sewing" | "Welding" | "Installation" | "Front Office"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
