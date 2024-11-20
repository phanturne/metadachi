import { SupabaseClient } from "@supabase/supabase-js";
import { Database, TablesInsert } from "@/supabase/types";

export type Resource = Database["public"]["Tables"]["resources"]["Row"];
export type GetResourceTagsReturnType =
  Database["public"]["Functions"]["get_resource_tags"]["Returns"];
export type GetResourceSummaryReturnType =
  Database["public"]["Functions"]["get_resource_summary"]["Returns"];
export type GetUserResourcesReturnType =
  Database["public"]["Functions"]["get_user_resources"]["Returns"];
export type InsertResourceReturnType =
  Database["public"]["Tables"]["resources"]["Insert"];
export type UpdateResourceReturnType =
  Database["public"]["Tables"]["resources"]["Update"];

export class ResourcesService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getResourceTags(
    resourceId: string,
  ): Promise<GetResourceTagsReturnType> {
    const { data, error } = await this.supabase.rpc("get_resource_tags", {
      p_resource_id: resourceId,
    });

    if (error) throw error;
    return data;
  }

  async getResourceSummary(
    resourceId: string,
  ): Promise<GetResourceSummaryReturnType> {
    const { data, error } = await this.supabase.rpc("get_resource_summary", {
      p_resource_id: resourceId,
    });

    if (error) throw error;
    return data;
  }

  async getUserResources(userId: string): Promise<GetUserResourcesReturnType> {
    const { data, error } = await this.supabase.rpc("get_user_resources", {
      p_user_id: userId,
    });

    if (error) throw error;
    return data;
  }

  async insertResource(
    resource: TablesInsert<"resources">,
  ): Promise<InsertResourceReturnType> {
    const { data, error } = await this.supabase
      .from("resources")
      .insert(resource)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  }

  async updateResource(
    resourceId: string,
    resource: UpdateResourceReturnType,
  ): Promise<UpdateResourceReturnType> {
    const { data, error } = await this.supabase
      .from("resources")
      .update(resource)
      .eq("resource_id", resourceId)
      .single();

    if (error) throw error;
    return data;
  }

  async deleteResource(resourceId: string): Promise<null> {
    const { error } = await this.supabase
      .from("resources")
      .delete()
      .eq("resource_id", resourceId)
      .single();

    if (error) throw error;
    return null;
  }

  async selectResource(resourceId: string): Promise<Resource> {
    const { data, error } = await this.supabase
      .from("resources")
      .select("*")
      .eq("resource_id", resourceId)
      .single();

    if (error) throw error;
    return data;
  }

  async archiveResource(resourceId: string): Promise<UpdateResourceReturnType> {
    const { data, error } = await this.supabase
      .from("resources")
      .update({ is_archived: true })
      .eq("resource_id", resourceId)
      .single();

    if (error) throw error;
    return data;
  }

  async unarchiveResource(
    resourceId: string,
  ): Promise<UpdateResourceReturnType> {
    const { data, error } = await this.supabase
      .from("resources")
      .update({ is_archived: false })
      .eq("resource_id", resourceId)
      .single();

    if (error) throw error;
    return data;
  }
}
