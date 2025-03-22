import type { Database } from '@/supabase/types';

export type Chat = Database['public']['Tables']['Chat']['Row'];
export type DBMessage = Database['public']['Tables']['Message']['Row'];
export type Document = Database['public']['Tables']['Document']['Row'];
export type Vote = Database['public']['Tables']['Vote']['Row'];
export type Suggestion = Database['public']['Tables']['Suggestion']['Row'];
export type Profile = Database['public']['Tables']['Profile']['Row'];
