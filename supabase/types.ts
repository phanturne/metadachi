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
      areas: {
        Row: {
          area_id: string
          created_at: string | null
          description: string | null
          is_archived: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          area_id?: string
          created_at?: string | null
          description?: string | null
          is_archived?: boolean | null
          name: string
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          area_id?: string
          created_at?: string | null
          description?: string | null
          is_archived?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          area_id: string | null
          content: Json
          created_at: string | null
          is_archived: boolean | null
          name: string
          note_id: string
          note_type: string | null
          project_id: string | null
          resource_id: string | null
          task_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          area_id?: string | null
          content: Json
          created_at?: string | null
          is_archived?: boolean | null
          name: string
          note_id?: string
          note_type?: string | null
          project_id?: string | null
          resource_id?: string | null
          task_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          area_id?: string | null
          content?: Json
          created_at?: string | null
          is_archived?: boolean | null
          name?: string
          note_id?: string
          note_type?: string | null
          project_id?: string | null
          resource_id?: string | null
          task_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "notes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "notes_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["resource_id"]
          },
          {
            foreignKeyName: "notes_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["task_id"]
          },
        ]
      }
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
          user_id?: string
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
      related_notes: {
        Row: {
          created_at: string | null
          note_id: string
          related_note_id: string
          relationship_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          note_id: string
          related_note_id: string
          relationship_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          note_id?: string
          related_note_id?: string
          relationship_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "related_notes_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["note_id"]
          },
          {
            foreignKeyName: "related_notes_related_note_id_fkey"
            columns: ["related_note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["note_id"]
          },
        ]
      }
      resources: {
        Row: {
          created_at: string | null
          description: string | null
          is_archived: boolean | null
          name: string
          resource_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          is_archived?: boolean | null
          name: string
          resource_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          is_archived?: boolean | null
          name?: string
          resource_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      task_dependencies: {
        Row: {
          created_at: string | null
          dependency_task_id: string
          dependent_task_id: string
        }
        Insert: {
          created_at?: string | null
          dependency_task_id: string
          dependent_task_id: string
        }
        Update: {
          created_at?: string | null
          dependency_task_id?: string
          dependent_task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_dependencies_dependency_task_id_fkey"
            columns: ["dependency_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["task_id"]
          },
          {
            foreignKeyName: "task_dependencies_dependent_task_id_fkey"
            columns: ["dependent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["task_id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_hours: number | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          is_archived: boolean | null
          parent_task_id: string | null
          priority: string | null
          project_id: string | null
          status: string | null
          task_id: string
          task_type: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_hours?: number | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          is_archived?: boolean | null
          parent_task_id?: string | null
          priority?: string | null
          project_id?: string | null
          status?: string | null
          task_id?: string
          task_type?: string | null
          title: string
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          actual_hours?: number | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          is_archived?: boolean | null
          parent_task_id?: string | null
          priority?: string | null
          project_id?: string | null
          status?: string | null
          task_id?: string
          task_type?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["task_id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_project_cascade: {
        Args: {
          p_project_id: string
        }
        Returns: undefined
      }
      archive_task_cascade: {
        Args: {
          p_task_id: string
        }
        Returns: undefined
      }
      can_complete_task: {
        Args: {
          p_task_id: string
        }
        Returns: boolean
      }
      delete_area: {
        Args: {
          p_area_id: string
        }
        Returns: boolean
      }
      delete_note: {
        Args: {
          p_note_id: string
        }
        Returns: boolean
      }
      delete_project: {
        Args: {
          p_project_id: string
        }
        Returns: boolean
      }
      delete_resource: {
        Args: {
          p_resource_id: string
        }
        Returns: boolean
      }
      find_or_create_tag:
        | {
            Args: {
              p_tag_name: string
              p_description?: string
            }
            Returns: string
          }
        | {
            Args: {
              p_user_id: string
              p_tag_name: string
              p_description?: string
            }
            Returns: string
          }
      get_area_summary: {
        Args: {
          p_area_id: string
        }
        Returns: {
          area_id: string
          name: string
          description: string
          created_at: string
          updated_at: string
          is_archived: boolean
          tags: Json
          related_notes: Json
          owner_id: string
          owner_avatar_url: string
        }[]
      }
      get_area_tags: {
        Args: {
          p_area_id: string
        }
        Returns: Json
      }
      get_completed_tasks_in_project: {
        Args: {
          p_project_id: string
        }
        Returns: {
          task_id: string
          title: string
          completed_at: string
          estimated_hours: number
          actual_hours: number
        }[]
      }
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
      get_note_summary: {
        Args: {
          p_note_id: string
        }
        Returns: {
          note_id: string
          name: string
          note_type: string
          created_at: string
          updated_at: string
          project_id: string
          area_id: string
          resource_id: string
          task_id: string
          is_archived: boolean
          tags: Json
          related_notes: Json
          owner_id: string
          owner_avatar_url: string
        }[]
      }
      get_note_tags: {
        Args: {
          p_note_id: string
        }
        Returns: {
          tag_id: string
          name: string
          context: string
        }[]
      }
      get_notes_for_project: {
        Args: {
          p_project_id: string
          p_area_id?: string
          p_task_id?: string
          p_note_type?: string
        }
        Returns: {
          note_id: string
          name: string
          content: Json
          note_type: string
          created_at: string
          tags: Json
        }[]
      }
      get_notes_for_task: {
        Args: {
          p_task_id: string
        }
        Returns: {
          note_id: string
          name: string
          content: Json
          note_type: string
          created_at: string
          updated_at: string
          tags: Json
        }[]
      }
      get_overdue_tasks: {
        Args: {
          p_user_id?: string
          p_project_id?: string
        }
        Returns: {
          task_id: string
          title: string
          status: string
          due_date: string
          project_id: string
          user_id: string
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
      get_project_statistics: {
        Args: {
          p_project_id: string
        }
        Returns: {
          total_tasks: number
          completed_tasks: number
          overdue_tasks: number
          total_estimated_hours: number
          total_actual_hours: number
          completion_percentage: number
          on_track: boolean
        }[]
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
          updated_at: string
          is_archived: boolean
          tags: Json
          related_notes: Json
          owner_id: string
          owner_avatar_url: string
        }[]
      }
      get_project_tags: {
        Args: {
          p_project_id: string
        }
        Returns: Json
      }
      get_project_timeline: {
        Args: {
          p_project_id: string
        }
        Returns: {
          item_type: string
          item_id: string
          title: string
          status: string
          start_date: string
          due_date: string
          completion_percentage: number
        }[]
      }
      get_recent_notes: {
        Args: {
          p_user_id?: string
          p_project_id?: string
          p_limit?: number
        }
        Returns: {
          note_id: string
          name: string
          content: Json
          note_type: string
          created_at: string
          tags: Json
        }[]
      }
      get_related_notes:
        | {
            Args: {
              p_entity_id: string
              p_entity_type: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_note_id: string
            }
            Returns: {
              related_note_id: string
              content: Json
              created_at: string
              tags: Json
            }[]
          }
      get_resource_summary: {
        Args: {
          p_resource_id: string
        }
        Returns: {
          resource_id: string
          name: string
          description: string
          created_at: string
          updated_at: string
          is_archived: boolean
          tags: Json
          related_notes: Json
          owner_id: string
          owner_avatar_url: string
        }[]
      }
      get_resource_tags: {
        Args: {
          p_resource_id: string
        }
        Returns: Json
      }
      get_task_dependencies: {
        Args: {
          p_task_id: string
        }
        Returns: {
          task_id: string
          title: string
          status: string
          dependency_type: string
        }[]
      }
      get_task_hierarchy: {
        Args: {
          p_task_id: string
        }
        Returns: {
          task_id: string
          title: string
          level: number
          path: string[]
        }[]
      }
      get_task_hierarchy_with_dependencies: {
        Args: {
          p_task_id: string
        }
        Returns: {
          task_id: string
          title: string
          level: number
          dependency_task_id: string
          dependency_title: string
          dependency_type: string
        }[]
      }
      get_task_summary_for_user: {
        Args: {
          p_user_id: string
        }
        Returns: {
          total_tasks: number
          completed_tasks: number
          overdue_tasks: number
          pending_tasks: number
          total_estimated_hours: number
          total_actual_hours: number
        }[]
      }
      get_tasks_for_project: {
        Args: {
          p_project_id: string
          p_include_subtasks?: boolean
          p_status?: string
        }
        Returns: {
          task_id: string
          title: string
          status: string
          due_date: string
          priority: string
          parent_task_id: string
        }[]
      }
      get_user_areas: {
        Args: {
          p_user_id: string
        }
        Returns: {
          area_id: string
          name: string
          description: string
          created_at: string
          tags: Json
        }[]
      }
      get_user_notes:
        | {
            Args: {
              p_user_id: string
              p_project_id?: string
              p_area_id?: string
              p_resource_id?: string
              p_note_type?: string
              p_is_archived?: boolean
            }
            Returns: {
              note_id: string
              name: string
              note_type: string
              created_at: string
              updated_at: string
              project_id: string
              area_id: string
              resource_id: string
              task_id: string
              tags: Json
            }[]
          }
        | {
            Args: {
              p_user_id: string
              p_project_id?: string
              p_area_id?: string
              p_task_id?: string
              p_note_type?: string
            }
            Returns: {
              note_id: string
              name: string
              content: Json
              note_type: string
              created_at: string
              updated_at: string
              tags: Json
            }[]
          }
      get_user_resources: {
        Args: {
          p_user_id: string
        }
        Returns: {
          resource_id: string
          name: string
          description: string
          created_at: string
          tags: Json
        }[]
      }
      get_user_tasks: {
        Args: {
          p_user_id: string
          p_status?: string
          p_is_archived?: boolean
        }
        Returns: {
          task_id: string
          title: string
          status: string
          due_date: string
          priority: string
        }[]
      }
      insert_area: {
        Args: {
          p_name: string
          p_description?: string
          p_tags?: Json
        }
        Returns: string
      }
      insert_note: {
        Args: {
          p_name: string
          p_content: Json
          p_note_type?: string
          p_project_id?: string
          p_area_id?: string
          p_resource_id?: string
          p_task_id?: string
          p_tags?: Json
        }
        Returns: string
      }
      insert_project: {
        Args: {
          p_name: string
          p_description?: string
          p_status?: string
          p_priority?: number
          p_due_date?: string
          p_parent_project_id?: string
          p_tags?: Json
        }
        Returns: string
      }
      insert_resource: {
        Args: {
          p_name: string
          p_description?: string
          p_tags?: Json
        }
        Returns: string
      }
      move_note: {
        Args: {
          p_note_id: string
          p_new_project_id: string
          p_new_area_id: string
          p_new_resource_id: string
          p_new_task_id: string
        }
        Returns: boolean
      }
      move_project: {
        Args: {
          p_project_id?: string
          p_new_parent_id?: string
        }
        Returns: boolean
      }
      search_user_tags: {
        Args: {
          p_user_id: string
          p_search_term: string
        }
        Returns: {
          tag_id: string
          name: string
          description: string
          usage_count: number
        }[]
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
      update_area: {
        Args: {
          p_area_id: string
          p_name: string
          p_description?: string
          p_tags?: Json
        }
        Returns: boolean
      }
      update_note: {
        Args: {
          p_note_id: string
          p_name: string
          p_content: Json
          p_note_type?: string
          p_project_id?: string
          p_area_id?: string
          p_resource_id?: string
          p_task_id?: string
          p_tags?: Json
        }
        Returns: boolean
      }
      update_project: {
        Args: {
          p_project_id: string
          p_name: string
          p_description?: string
          p_status?: string
          p_priority?: number
          p_due_date?: string
          p_parent_project_id?: string
          p_tags?: Json
        }
        Returns: boolean
      }
      update_resource: {
        Args: {
          p_resource_id: string
          p_name: string
          p_description?: string
          p_tags?: Json
        }
        Returns: boolean
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
