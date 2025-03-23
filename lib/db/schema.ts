import type { Database } from '@/supabase/types';

// Row types
export type Chat = Database['public']['Tables']['Chat']['Row'];
export type DBMessage = Database['public']['Tables']['Message']['Row'];
export type Document = Database['public']['Tables']['Document']['Row'];
export type Vote = Database['public']['Tables']['Vote']['Row'];
export type Suggestion = Database['public']['Tables']['Suggestion']['Row'];
export type Profile = Database['public']['Tables']['Profile']['Row'];
export type Library = Database['public']['Tables']['Library']['Row'];
export type File = Database['public']['Tables']['File']['Row'];
export type Embedding = Database['public']['Tables']['Embedding']['Row'];

// Insert types
export type ChatInsert = Database['public']['Tables']['Chat']['Insert'];
export type MessageInsert = Database['public']['Tables']['Message']['Insert'];
export type DocumentInsert = Database['public']['Tables']['Document']['Insert'];
export type VoteInsert = Database['public']['Tables']['Vote']['Insert'];
export type SuggestionInsert =
  Database['public']['Tables']['Suggestion']['Insert'];
export type LibraryInsert = Database['public']['Tables']['Library']['Insert'];
export type FileInsert = Database['public']['Tables']['File']['Insert'];
export type EmbeddingInsert =
  Database['public']['Tables']['Embedding']['Insert'];
