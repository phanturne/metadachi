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
      Chat: {
        Row: {
          createdAt: string
          id: string
          title: string
          userId: string
          visibility: string
        }
        Insert: {
          createdAt?: string
          id?: string
          title: string
          userId: string
          visibility?: string
        }
        Update: {
          createdAt?: string
          id?: string
          title?: string
          userId?: string
          visibility?: string
        }
        Relationships: []
      }
      Document: {
        Row: {
          content: string | null
          createdAt: string
          id: string
          kind: string
          title: string
          userId: string
        }
        Insert: {
          content?: string | null
          createdAt?: string
          id?: string
          kind?: string
          title: string
          userId: string
        }
        Update: {
          content?: string | null
          createdAt?: string
          id?: string
          kind?: string
          title?: string
          userId?: string
        }
        Relationships: []
      }
      Message: {
        Row: {
          attachments: Json
          chatId: string
          createdAt: string
          id: string
          parts: Json
          role: string
        }
        Insert: {
          attachments: Json
          chatId: string
          createdAt?: string
          id?: string
          parts: Json
          role: string
        }
        Update: {
          attachments?: Json
          chatId?: string
          createdAt?: string
          id?: string
          parts?: Json
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "Message_chatId_fkey"
            columns: ["chatId"]
            isOneToOne: false
            referencedRelation: "Chat"
            referencedColumns: ["id"]
          },
        ]
      }
      Profile: {
        Row: {
          avatarUrl: string | null
          bio: string
          createdAt: string | null
          displayName: string
          id: string
          updatedAt: string | null
          userId: string
          username: string
        }
        Insert: {
          avatarUrl?: string | null
          bio?: string
          createdAt?: string | null
          displayName: string
          id?: string
          updatedAt?: string | null
          userId: string
          username: string
        }
        Update: {
          avatarUrl?: string | null
          bio?: string
          createdAt?: string | null
          displayName?: string
          id?: string
          updatedAt?: string | null
          userId?: string
          username?: string
        }
        Relationships: []
      }
      Suggestion: {
        Row: {
          createdAt: string
          description: string | null
          documentCreatedAt: string
          documentId: string
          id: string
          isResolved: boolean
          originalText: string
          suggestedText: string
          userId: string
        }
        Insert: {
          createdAt?: string
          description?: string | null
          documentCreatedAt: string
          documentId: string
          id?: string
          isResolved?: boolean
          originalText: string
          suggestedText: string
          userId: string
        }
        Update: {
          createdAt?: string
          description?: string | null
          documentCreatedAt?: string
          documentId?: string
          id?: string
          isResolved?: boolean
          originalText?: string
          suggestedText?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Suggestion_documentId_documentCreatedAt_fkey"
            columns: ["documentId", "documentCreatedAt"]
            isOneToOne: false
            referencedRelation: "Document"
            referencedColumns: ["id", "createdAt"]
          },
        ]
      }
      Vote: {
        Row: {
          chatId: string
          createdAt: string
          isUpvoted: boolean
          messageId: string
        }
        Insert: {
          chatId: string
          createdAt?: string
          isUpvoted: boolean
          messageId: string
        }
        Update: {
          chatId?: string
          createdAt?: string
          isUpvoted?: boolean
          messageId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Vote_chatId_fkey"
            columns: ["chatId"]
            isOneToOne: false
            referencedRelation: "Chat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Vote_messageId_fkey"
            columns: ["messageId"]
            isOneToOne: false
            referencedRelation: "Message"
            referencedColumns: ["id"]
          },
        ]
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
