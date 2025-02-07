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
      chat: {
        Row: {
          created_at: string
          id: string
          title: string
          user_id: string
          visibility: string
        }
        Insert: {
          created_at?: string
          id?: string
          title: string
          user_id: string
          visibility?: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          user_id?: string
          visibility?: string
        }
        Relationships: []
      }
      community: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      document: {
        Row: {
          chat_id: string
          content: string | null
          created_at: string
          id: string
          kind: string
          title: string
          user_id: string
        }
        Insert: {
          chat_id: string
          content?: string | null
          created_at?: string
          id?: string
          kind?: string
          title: string
          user_id: string
        }
        Update: {
          chat_id?: string
          content?: string | null
          created_at?: string
          id?: string
          kind?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chat"
            referencedColumns: ["id"]
          },
        ]
      }
      embedding: {
        Row: {
          content: string
          created_at: string
          embedding: string
          file_id: string
          hash: string
          id: string
          metadata: Json | null
          tokens: number
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          embedding: string
          file_id: string
          hash: string
          id?: string
          metadata?: Json | null
          tokens: number
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          embedding?: string
          file_id?: string
          hash?: string
          id?: string
          metadata?: Json | null
          tokens?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "embedding_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "file"
            referencedColumns: ["id"]
          },
        ]
      }
      file: {
        Row: {
          created_at: string
          description: string | null
          file_path: string
          folder_id: string | null
          hash: string | null
          id: string
          metadata: Json | null
          name: string
          sharing: string
          size: number | null
          tokens: number | null
          type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_path: string
          folder_id?: string | null
          hash?: string | null
          id?: string
          metadata?: Json | null
          name: string
          sharing?: string
          size?: number | null
          tokens?: number | null
          type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_path?: string
          folder_id?: string | null
          hash?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          sharing?: string
          size?: number | null
          tokens?: number | null
          type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folder"
            referencedColumns: ["id"]
          },
        ]
      }
      folder: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          parent_id: string | null
          sharing: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
          sharing?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          sharing?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "folder_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "folder"
            referencedColumns: ["id"]
          },
        ]
      }
      message: {
        Row: {
          chat_id: string
          content: Json
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          chat_id: string
          content: Json
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          chat_id?: string
          content?: Json
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chat"
            referencedColumns: ["id"]
          },
        ]
      }
      permission: {
        Row: {
          community_id: string | null
          id: string
          resource_id: string
          resource_type: string
          role: string
          user_id: string | null
        }
        Insert: {
          community_id?: string | null
          id?: string
          resource_id: string
          resource_type: string
          role?: string
          user_id?: string | null
        }
        Update: {
          community_id?: string | null
          id?: string
          resource_id?: string
          resource_type?: string
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "permission_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "community"
            referencedColumns: ["id"]
          },
        ]
      }
      profile: {
        Row: {
          avatar_url: string | null
          bio: string
          created_at: string
          display_name: string
          id: string
          updated_at: string | null
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string
          created_at?: string
          display_name: string
          id?: string
          updated_at?: string | null
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string | null
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      suggestion: {
        Row: {
          created_at: string
          description: string | null
          document_created_at: string | null
          document_id: string
          id: string
          is_resolved: boolean
          original_text: string
          suggested_text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          document_created_at?: string | null
          document_id: string
          id?: string
          is_resolved?: boolean
          original_text: string
          suggested_text: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          document_created_at?: string | null
          document_id?: string
          id?: string
          is_resolved?: boolean
          original_text?: string
          suggested_text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggestion_document_id_document_created_at_fkey"
            columns: ["document_id", "document_created_at"]
            isOneToOne: false
            referencedRelation: "document"
            referencedColumns: ["id", "created_at"]
          },
        ]
      }
      user_community: {
        Row: {
          community_id: string
          user_id: string
        }
        Insert: {
          community_id: string
          user_id: string
        }
        Update: {
          community_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_community_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "community"
            referencedColumns: ["id"]
          },
        ]
      }
      vote: {
        Row: {
          chat_id: string
          created_at: string
          is_upvoted: boolean
          message_id: string
          user_id: string
        }
        Insert: {
          chat_id: string
          created_at?: string
          is_upvoted: boolean
          message_id: string
          user_id: string
        }
        Update: {
          chat_id?: string
          created_at?: string
          is_upvoted?: boolean
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vote_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vote_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "message"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      get_all_file_ids_from_folders: {
        Args: {
          folder_ids: string[]
        }
        Returns: string[]
      }
      halfvec_avg: {
        Args: {
          "": number[]
        }
        Returns: unknown
      }
      halfvec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      halfvec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      has_permission: {
        Args: {
          resource_type: string
          resource_id: string
          user_id: string
        }
        Returns: boolean
      }
      hnsw_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnswhandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflathandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      l2_norm:
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      l2_normalize:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      match_file_items: {
        Args: {
          query_embedding: string
          match_count?: number
          file_ids?: string[]
          folder_ids?: string[]
        }
        Returns: {
          id: string
          file_id: string
          content: string
          tokens: number
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      sparsevec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      vector_avg: {
        Args: {
          "": number[]
        }
        Returns: string
      }
      vector_dims:
        | {
            Args: {
              "": string
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      vector_norm: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
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
