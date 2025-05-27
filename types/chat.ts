import { Database } from "@/supabase/types"

export type Source = {
  id: string
  source_id: string
  chunk_index: number
  content: string
  similarity: number
}

export type SearchResult = {
  success: boolean
  message: string
  sources: Source[]
}

export type ToolInvocation = {
  toolCallId: string
  state: "call" | "result"
  args: {
    query: string
  }
  result?: SearchResult
}

export type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  toolInvocations?: ToolInvocation[]
}

// Re-export relevant types from Supabase
export type SourceType = Database["public"]["Enums"]["source_type"]
export type VisibilityType = Database["public"]["Enums"]["visibility_type"] 