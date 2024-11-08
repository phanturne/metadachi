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
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string
          created_at: string | null
          display_name: string
          id: string
          onboarding_completed_at: string | null
          onboarding_status: Database["public"]["Enums"]["onboarding_status"]
          updated_at: string | null
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string
          created_at?: string | null
          display_name: string
          id?: string
          onboarding_completed_at?: string | null
          onboarding_status?: Database["public"]["Enums"]["onboarding_status"]
          updated_at?: string | null
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string
          created_at?: string | null
          display_name?: string
          id?: string
          onboarding_completed_at?: string | null
          onboarding_status?: Database["public"]["Enums"]["onboarding_status"]
          updated_at?: string | null
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      project_connections: {
        Row: {
          connected_project_id: string
          connection_type: string
          context: string | null
          created_at: string | null
          project_id: string
          updated_at: string | null
        }
        Insert: {
          connected_project_id: string
          connection_type: string
          context?: string | null
          created_at?: string | null
          project_id: string
          updated_at?: string | null
        }
        Update: {
          connected_project_id?: string
          connection_type?: string
          context?: string | null
          created_at?: string | null
          project_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_connections_connected_project_id_fkey"
            columns: ["connected_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_connections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string | null
          is_archived: boolean | null
          name: string
          parent_project_id: string | null
          priority: number | null
          project_id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          is_archived?: boolean | null
          name: string
          parent_project_id?: string | null
          priority?: number | null
          project_id?: string
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          is_archived?: boolean | null
          name?: string
          parent_project_id?: string | null
          priority?: number | null
          project_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_parent_project_id_fkey"
            columns: ["parent_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
        ]
      }
      taggables: {
        Row: {
          context: string | null
          created_at: string | null
          tag_id: string
          taggable_id: string
          taggable_type: string
          updated_at: string | null
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          tag_id: string
          taggable_id: string
          taggable_type: string
          updated_at?: string | null
        }
        Update: {
          context?: string | null
          created_at?: string | null
          tag_id?: string
          taggable_id?: string
          taggable_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "taggables_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["tag_id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string | null
          description: string | null
          name: string
          tag_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          name: string
          tag_id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          name?: string
          tag_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_connected_projects: {
        Args: {
          p_project_id: string
        }
        Returns: Json
      }
      get_item_tags: {
        Args: {
          p_taggable_id: string
          p_taggable_type: string
        }
        Returns: {
          tag_id: string
          tag_name: string
          context: string
        }[]
      }
      get_project_connections: {
        Args: {
          p_project_id: string
        }
        Returns: {
          connected_project_id: string
          name: string
          connection_type: string
          context: string
          created_at: string
          tags: Json
        }[]
      }
      get_project_hierarchy: {
        Args: {
          p_project_id: string
        }
        Returns: {
          project_id: string
          name: string
          status: string
          level: number
          path: string[]
          has_children: boolean
          tags: Json
        }[]
      }
      get_project_hierarchy_path: {
        Args: {
          p_project_id: string
        }
        Returns: Json
      }
      get_project_summary: {
        Args: {
          p_project_id: string
        }
        Returns: {
          project_id: string
          name: string
          description: string
          status: string
          priority: number
          due_date: string
          created_at: string
          tags: Json
          connections: Json
          parent_path: Json
        }[]
      }
      get_project_tags: {
        Args: {
          p_project_id: string
        }
        Returns: Json
      }
      move_project: {
        Args: {
          p_project_id: string
          p_new_parent_id: string
        }
        Returns: boolean
      }
      tag_item: {
        Args: {
          p_taggable_id: string
          p_taggable_type: string
          p_tag_id: string
          p_context?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      onboarding_status: "not_started" | "in_progress" | "completed"
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
