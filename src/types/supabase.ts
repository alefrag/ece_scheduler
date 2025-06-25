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
      availability_preferences: {
        Row: {
          created_at: string | null
          day: string
          id: string
          preference: string
          time_slot: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          day: string
          id?: string
          preference: string
          time_slot: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          day?: string
          id?: string
          preference?: string
          time_slot?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      classrooms: {
        Row: {
          capacity: number
          created_at: string | null
          equipment: Json | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          capacity: number
          created_at?: string | null
          equipment?: Json | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          capacity?: number
          created_at?: string | null
          equipment?: Json | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          code: string
          course_group: string | null
          created_at: string | null
          description: string | null
          enrolled_students: number | null
          id: string
          lab_group_size: number | null
          lab_groups: number | null
          lab_hours: number | null
          lab_repetition: number | null
          name: string
          practice_hours: number | null
          practice_repetition: number | null
          required_equipment: string[] | null
          semesters: number[] | null
          study_programs: string[] | null
          theory_hours: number | null
          theory_repetition: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          course_group?: string | null
          created_at?: string | null
          description?: string | null
          enrolled_students?: number | null
          id?: string
          lab_group_size?: number | null
          lab_groups?: number | null
          lab_hours?: number | null
          lab_repetition?: number | null
          name: string
          practice_hours?: number | null
          practice_repetition?: number | null
          required_equipment?: string[] | null
          semesters?: number[] | null
          study_programs?: string[] | null
          theory_hours?: number | null
          theory_repetition?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          course_group?: string | null
          created_at?: string | null
          description?: string | null
          enrolled_students?: number | null
          id?: string
          lab_group_size?: number | null
          lab_groups?: number | null
          lab_hours?: number | null
          lab_repetition?: number | null
          name?: string
          practice_hours?: number | null
          practice_repetition?: number | null
          required_equipment?: string[] | null
          semesters?: number[] | null
          study_programs?: string[] | null
          theory_hours?: number | null
          theory_repetition?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      laboratories: {
        Row: {
          capacity: number
          created_at: string | null
          equipment: Json | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          capacity: number
          created_at?: string | null
          equipment?: Json | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          capacity?: number
          created_at?: string | null
          equipment?: Json | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      schedule_events: {
        Row: {
          course_id: string | null
          created_at: string | null
          day: string
          end_time: string
          id: string
          instructor: string
          program: string
          room: string
          semester: string
          start_time: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          day: string
          end_time: string
          id?: string
          instructor: string
          program: string
          room: string
          semester: string
          start_time: string
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          day?: string
          end_time?: string
          id?: string
          instructor?: string
          program?: string
          room?: string
          semester?: string
          start_time?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_events_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          role: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
