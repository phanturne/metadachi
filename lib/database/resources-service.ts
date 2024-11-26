import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/supabase/types";
import { RemovePPrefix } from "@/lib/utils";

// Table Types
export type Resource = Database["public"]["Tables"]["resources"]["Row"];

// Function Return Types
export type GetResourceTagsReturn =
  Database["public"]["Functions"]["get_resource_tags"]["Returns"];
export type GetResourceSummaryReturn =
  Database["public"]["Functions"]["get_resource_summary"]["Returns"];
export type GetUserResourcesReturn =
  Database["public"]["Functions"]["get_user_resources"]["Returns"];
export type InsertResourceReturn =
  Database["public"]["Functions"]["insert_resource"]["Returns"];
export type UpdateResourceReturn =
  Database["public"]["Functions"]["update_resource"]["Returns"];

// Function Argument Types
export type InsertResourceArgs =
  Database["public"]["Functions"]["insert_resource"]["Args"];
export type UpdateResourceArgs =
  Database["public"]["Functions"]["update_resource"]["Args"];

// Interface for cleaner API without 'p_' prefix
export type InsertResourceParams = RemovePPrefix<InsertResourceArgs>;
export type UpdateResourceParams = RemovePPrefix<UpdateResourceArgs>;

export class ResourcesService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getResourceTags(resourceId: string): Promise<GetResourceTagsReturn> {
    const { data, error } = await this.supabase.rpc("get_resource_tags", {
      p_resource_id: resourceId,
    });

    if (error) throw error;
    return data;
  }

  async getResourceSummary(
    resourceId: string,
  ): Promise<GetResourceSummaryReturn> {
    const { data, error } = await this.supabase.rpc("get_resource_summary", {
      p_resource_id: resourceId,
    });

    if (error) throw error;
    return data;
  }

  async getUserResources(userId: string): Promise<GetUserResourcesReturn> {
    const { data, error } = await this.supabase.rpc("get_user_resources", {
      p_user_id: userId,
    });

    if (error) throw error;
    return data;
  }

  async insertResource(
    params: InsertResourceParams,
  ): Promise<InsertResourceReturn> {
    const args: InsertResourceArgs = {
      p_name: params.name,
      p_description: params.description,
      p_tags: params.tags,
    };

    const { data, error } = await this.supabase.rpc("insert_resource", args);

    if (error) throw error;
    return data;
  }

  async updateResource(
    params: UpdateResourceParams,
  ): Promise<UpdateResourceReturn> {
    const args: UpdateResourceArgs = {
      p_resource_id: params.resource_id,
      p_name: params.name,
      p_description: params.description,
      p_tags: params.tags,
    };

    const { data, error } = await this.supabase.rpc("update_resource", args);

    if (error) throw error;
    return data;
  }

  async deleteResource(resourceId: string): Promise<boolean> {
    const { data, error } = await this.supabase.rpc("delete_resource", {
      p_resource_id: resourceId,
    });

    if (error) throw error;
    return data;
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

  async archiveResource(resourceId: string): Promise<UpdateResourceReturn> {
    const { data, error } = await this.supabase
      .from("resources")
      .update({ is_archived: true })
      .eq("resource_id", resourceId)
      .single();

    if (error) throw error;
    return data;
  }

  async unarchiveResource(resourceId: string): Promise<UpdateResourceReturn> {
    const { data, error } = await this.supabase
      .from("resources")
      .update({ is_archived: false })
      .eq("resource_id", resourceId)
      .single();

    if (error) throw error;
    return data;
  }
}
