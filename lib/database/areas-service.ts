import { SupabaseClient } from "@supabase/supabase-js";
import { Database, TablesInsert } from "@/supabase/types";

export type Area = Database["public"]["Tables"]["areas"]["Row"];
export type GetAreaTagsReturnType =
  Database["public"]["Functions"]["get_area_tags"]["Returns"];
export type GetAreaSummaryReturnType =
  Database["public"]["Functions"]["get_area_summary"]["Returns"];
export type GetUserAreasReturnType =
  Database["public"]["Functions"]["get_user_areas"]["Returns"];
export type InsertAreaReturnType =
  Database["public"]["Tables"]["areas"]["Insert"];
export type UpdateAreaReturnType =
  Database["public"]["Tables"]["areas"]["Update"];

export class AreasService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getAreaTags(areaId: string): Promise<GetAreaTagsReturnType> {
    const { data, error } = await this.supabase.rpc("get_area_tags", {
      p_area_id: areaId,
    });

    if (error) throw error;
    return data;
  }

  async getAreaSummary(areaId: string): Promise<GetAreaSummaryReturnType> {
    const { data, error } = await this.supabase.rpc("get_area_summary", {
      p_area_id: areaId,
    });

    if (error) throw error;
    return data;
  }

  async getUserAreas(userId: string): Promise<GetUserAreasReturnType> {
    const { data, error } = await this.supabase.rpc("get_user_areas", {
      p_user_id: userId,
    });

    if (error) throw error;
    return data;
  }

  async insertArea(area: TablesInsert<"areas">): Promise<InsertAreaReturnType> {
    const { data, error } = await this.supabase
      .from("areas")
      .insert(area)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  }

  async updateArea(
    areaId: string,
    area: UpdateAreaReturnType,
  ): Promise<UpdateAreaReturnType> {
    const { data, error } = await this.supabase
      .from("areas")
      .update(area)
      .eq("area_id", areaId)
      .single();

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

  async archiveArea(areaId: string): Promise<UpdateAreaReturnType> {
    const { data, error } = await this.supabase
      .from("areas")
      .update({ is_archived: true })
      .eq("area_id", areaId)
      .single();

    if (error) throw error;
    return data;
  }

  async unarchiveArea(areaId: string): Promise<UpdateAreaReturnType> {
    const { data, error } = await this.supabase
      .from("areas")
      .update({ is_archived: false })
      .eq("area_id", areaId)
      .single();

    if (error) throw error;
    return data;
  }
}
