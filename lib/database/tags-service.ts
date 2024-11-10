import { SupabaseClient } from "@supabase/supabase-js";
import { Database, TablesInsert } from "@/supabase/types";

export type Tag = Database["public"]["Tables"]["tags"]["Row"];
export type Taggable = Database["public"]["Tables"]["taggables"]["Row"];
export type GetItemTagsReturnType =
  Database["public"]["Functions"]["get_item_tags"]["Returns"];
export type TagItemReturnType =
  Database["public"]["Functions"]["tag_item"]["Returns"];
export type InsertTagReturnType =
  Database["public"]["Tables"]["tags"]["Insert"];
export type UpdateTagReturnType =
  Database["public"]["Tables"]["tags"]["Update"];

export type TaggableType = "project" | "note" | "resource" | "area";

export class TagsService {
  constructor(private supabase: SupabaseClient<Database>) {}

  // Core tag operations
  async createTag(tag: TablesInsert<"tags">): Promise<InsertTagReturnType> {
    const { data, error } = await this.supabase
      .from("tags")
      .insert(tag)
      .single();

    if (error) throw error;
    return data;
  }

  async updateTag(
    tagId: string,
    tag: UpdateTagReturnType,
  ): Promise<UpdateTagReturnType> {
    const { data, error } = await this.supabase
      .from("tags")
      .update(tag)
      .eq("tag_id", tagId)
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTag(tagId: string): Promise<null> {
    const { error } = await this.supabase
      .from("tags")
      .delete()
      .eq("tag_id", tagId)
      .single();

    if (error) throw error;
    return null;
  }

  async getTag(tagId: string): Promise<Tag> {
    const { data, error } = await this.supabase
      .from("tags")
      .select("*")
      .eq("tag_id", tagId)
      .single();

    if (error) throw error;
    return data;
  }

  async getUserTags(userId: string): Promise<Tag[]> {
    const { data, error } = await this.supabase
      .from("tags")
      .select("*")
      .eq("user_id", userId)
      .order("name");

    if (error) throw error;
    return data;
  }

  // Taggable operations
  async getItemTags(
    taggableId: string,
    taggableType: TaggableType,
  ): Promise<GetItemTagsReturnType> {
    const { data, error } = await this.supabase.rpc("get_item_tags", {
      p_taggable_id: taggableId,
      p_taggable_type: taggableType,
    });

    if (error) throw error;
    return data;
  }

  async tagItem(
    taggableId: string,
    taggableType: TaggableType,
    tagId: string,
    context?: string,
  ): Promise<TagItemReturnType> {
    const { data, error } = await this.supabase.rpc("tag_item", {
      p_taggable_id: taggableId,
      p_taggable_type: taggableType,
      p_tag_id: tagId,
      p_context: context,
    });

    if (error) throw error;
    return data;
  }

  async removeTag(
    taggableId: string,
    taggableType: TaggableType,
    tagId: string,
  ): Promise<null> {
    const { error } = await this.supabase.from("taggables").delete().match({
      taggable_id: taggableId,
      taggable_type: taggableType,
      tag_id: tagId,
    });

    if (error) throw error;
    return null;
  }

  async getTaggedItems(
    tagId: string,
    taggableType?: TaggableType,
  ): Promise<Taggable[]> {
    let query = this.supabase.from("taggables").select("*").eq("tag_id", tagId);

    if (taggableType) {
      query = query.eq("taggable_type", taggableType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  async updateTagContext(
    taggableId: string,
    taggableType: TaggableType,
    tagId: string,
    context: string,
  ): Promise<Taggable> {
    const { data, error } = await this.supabase
      .from("taggables")
      .update({ context })
      .match({
        taggable_id: taggableId,
        taggable_type: taggableType,
        tag_id: tagId,
      })
      .single();

    if (error) throw error;
    return data;
  }

  // Batch operations
  async tagItems(
    items: Array<{
      taggableId: string;
      taggableType: TaggableType;
      tagId: string;
      context?: string;
    }>,
  ): Promise<null> {
    const { error } = await this.supabase.from("taggables").insert(
      items.map((item) => ({
        taggable_id: item.taggableId,
        taggable_type: item.taggableType,
        tag_id: item.tagId,
        context: item.context,
      })),
    );

    if (error) throw error;
    return null;
  }

  async removeTagsFromItem(
    taggableId: string,
    taggableType: TaggableType,
  ): Promise<null> {
    const { error } = await this.supabase.from("taggables").delete().match({
      taggable_id: taggableId,
      taggable_type: taggableType,
    });

    if (error) throw error;
    return null;
  }

  // Search and utility functions
  async searchTags(
    userId: string,
    searchTerm: string,
    limit: number = 10,
  ): Promise<Tag[]> {
    const { data, error } = await this.supabase
      .from("tags")
      .select("*")
      .eq("user_id", userId)
      .ilike("name", `%${searchTerm}%`)
      .limit(limit);

    if (error) throw error;
    return data;
  }
}
