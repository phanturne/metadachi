import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/supabase/types";
import { RemovePPrefix } from "@/lib/utils";

// Table Types
export type Area = Database["public"]["Tables"]["areas"]["Row"];

// Function Return Types
export type GetAreaTagsReturn =
  Database["public"]["Functions"]["get_area_tags"]["Returns"];
export type GetAreaSummaryReturn =
  Database["public"]["Functions"]["get_area_summary"]["Returns"];
export type GetUserAreasReturn =
  Database["public"]["Functions"]["get_user_areas"]["Returns"];
export type InsertAreaReturn =
  Database["public"]["Functions"]["insert_area"]["Returns"];
export type UpdateAreaReturn =
  Database["public"]["Functions"]["update_area"]["Returns"];

// Function Argument Types
export type InsertAreaArgs =
  Database["public"]["Functions"]["insert_area"]["Args"];
export type UpdateAreaArgs =
  Database["public"]["Functions"]["update_area"]["Args"];

// Interface for cleaner API without 'p_' prefix
export type InsertAreaParams = RemovePPrefix<InsertAreaArgs>;
export type UpdateAreaParams = RemovePPrefix<UpdateAreaArgs>;

export class AreasService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getAreaTags(areaId: string): Promise<GetAreaTagsReturn> {
    const { data, error } = await this.supabase.rpc("get_area_tags", {
      p_area_id: areaId,
    });

    if (error) throw error;
    return data;
  }

  async getAreaSummary(areaId: string): Promise<GetAreaSummaryReturn> {
    const { data, error } = await this.supabase.rpc("get_area_summary", {
      p_area_id: areaId,
    });

    if (error) throw error;
    return data;
  }

  async getUserAreas(userId: string): Promise<GetUserAreasReturn> {
    const { data, error } = await this.supabase.rpc("get_user_areas", {
      p_user_id: userId,
    });

    if (error) throw error;
    return data;
  }

  async insertArea(params: InsertAreaParams): Promise<InsertAreaReturn> {
    const args: InsertAreaArgs = {
      p_name: params.name,
      p_description: params.description,
      p_tags: params.tags,
    };

    const { data, error } = await this.supabase.rpc("insert_area", args);

    if (error) throw error;
    return data;
  }

  async updateArea(
    params: UpdateAreaParams,
  ): Promise<UpdateAreaReturn> {
    const args: UpdateAreaArgs = {
      p_area_id: params.area_id,
      p_name: params.name,
      p_description: params.description,
      p_tags: params.tags,
    };

    const { data, error } = await this.supabase.rpc("update_area", args);

    if (error) throw error;
    return data;
  }

  async deleteArea(areaId: string): Promise<null> {
    const { error } = await this.supabase
      .from("areas")
      .delete()
      .eq("area_id", areaId)
      .single();

    if (error) throw error;
    return null;
  }

  async selectArea(areaId: string): Promise<Area> {
    const { data, error } = await this.supabase
      .from("areas")
      .select("*")
      .eq("area_id", areaId)
      .single();

    if (error) throw error;
    return data;
  }

  async archiveArea(areaId: string): Promise<UpdateAreaReturn> {
    const { data, error } = await this.supabase
      .from("areas")
      .update({ is_archived: true })
      .eq("area_id", areaId)
      .single();

    if (error) throw error;
    return data;
  }

  async unarchiveArea(areaId: string): Promise<UpdateAreaReturn> {
    const { data, error } = await this.supabase
      .from("areas")
      .update({ is_archived: false })
      .eq("area_id", areaId)
      .single();

    if (error) throw error;
    return data;
  }
}
