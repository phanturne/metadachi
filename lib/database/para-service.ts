import { Database } from "@/supabase/types";
import { SupabaseClient } from "@supabase/supabase-js";

// Add to existing types
export type GetRecentItemsReturn =
  Database["public"]["Functions"]["get_recent_items"]["Returns"];

export class ParaService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getRecentItems(
    userId: string,
    limit: number = 10,
  ): Promise<GetRecentItemsReturn> {
    const { data, error } = await this.supabase.rpc("get_recent_items", {
      p_user_id: userId,
      p_limit: limit,
    });

    if (error) throw error;
    return data;
  }
}
