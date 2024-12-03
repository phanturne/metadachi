import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/supabase/types";
import { RemovePPrefix } from "@/lib/utils";

// Table Types
export type Note = Database["public"]["Tables"]["notes"]["Row"];

// Function Return Types
export type GetNoteTagsReturn =
  Database["public"]["Functions"]["get_note_tags"]["Returns"];
export type GetRelatedNotesReturn =
  Database["public"]["Functions"]["get_related_notes"]["Returns"];
export type MoveNoteReturn =
  Database["public"]["Functions"]["move_note"]["Returns"];
export type GetUserNotesReturn =
  Database["public"]["Functions"]["get_user_notes"]["Returns"];
export type GetNotesForProjectReturn =
  Database["public"]["Functions"]["get_notes_for_project"]["Returns"];
export type GetNotesForTaskReturn =
  Database["public"]["Functions"]["get_notes_for_task"]["Returns"];
export type GetRecentNotesReturn =
  Database["public"]["Functions"]["get_recent_notes"]["Returns"];
export type InsertNoteReturn =
  Database["public"]["Functions"]["insert_note"]["Returns"];
export type UpdateNoteReturn =
  Database["public"]["Functions"]["update_note"]["Returns"];
export type GetNoteSummaryReturn =
  Database["public"]["Functions"]["get_note_summary"]["Returns"];

// Function Argument Types
export type InsertNoteArgs =
  Database["public"]["Functions"]["insert_note"]["Args"];
export type UpdateNoteArgs =
  Database["public"]["Functions"]["update_note"]["Args"];

export type NoteStatus = "inbox" | "active" | "deleted";

// Interface for cleaner API without 'p_' prefix
export type InsertNoteParams = RemovePPrefix<InsertNoteArgs>;
export type UpdateNoteParams = RemovePPrefix<UpdateNoteArgs>;

export class NotesService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getNoteTags(noteId: string): Promise<GetNoteTagsReturn> {
    const { data, error } = await this.supabase.rpc("get_note_tags", {
      p_note_id: noteId,
    });

    if (error) throw error;
    return data;
  }

  async getRelatedNotes(noteId: string): Promise<GetRelatedNotesReturn> {
    const { data, error } = await this.supabase.rpc("get_related_notes", {
      p_note_id: noteId,
    });

    if (error) throw error;
    return data;
  }

  async moveNote(
    noteId: string,
    newProjectId: string,
    newAreaId: string,
    newResourceId: string,
    newTaskId: string,
  ): Promise<MoveNoteReturn> {
    const { data, error } = await this.supabase.rpc("move_note", {
      p_note_id: noteId,
      p_new_project_id: newProjectId,
      p_new_area_id: newAreaId,
      p_new_resource_id: newResourceId,
      p_new_task_id: newTaskId,
    });

    if (error) throw error;
    return data;
  }

  async getUserNotes(
    userId: string,
    projectId?: string,
    areaId?: string,
    resourceId?: string,
    noteType?: string,
    isArchived: boolean = false,
  ): Promise<GetUserNotesReturn> {
    const { data, error } = await this.supabase.rpc("get_user_notes", {
      p_user_id: userId,
      p_project_id: projectId,
      p_area_id: areaId,
      p_resource_id: resourceId,
      p_note_type: noteType,
      p_is_archived: isArchived,
    });

    if (error) throw error;
    return data;
  }

  async getNotesForProject(
    projectId: string,
    areaId?: string,
    taskId?: string,
    noteType?: string,
  ): Promise<GetNotesForProjectReturn> {
    const { data, error } = await this.supabase.rpc("get_notes_for_project", {
      p_project_id: projectId,
      p_area_id: areaId,
      p_task_id: taskId,
      p_note_type: noteType,
    });

    if (error) throw error;
    return data;
  }

  async getNotesForTask(taskId: string): Promise<GetNotesForTaskReturn> {
    const { data, error } = await this.supabase.rpc("get_notes_for_task", {
      p_task_id: taskId,
    });

    if (error) throw error;
    return data;
  }

  async getRecentNotes(
    userId?: string,
    projectId?: string,
    limit: number = 10,
  ): Promise<GetRecentNotesReturn> {
    const { data, error } = await this.supabase.rpc("get_recent_notes", {
      p_user_id: userId,
      p_project_id: projectId,
      p_limit: limit,
    });

    if (error) throw error;
    return data;
  }

  async insertNote(params: InsertNoteParams): Promise<InsertNoteReturn> {
    const args: InsertNoteArgs = {
      p_name: params.name,
      p_content: params.content,
      p_note_type: params.note_type,
      p_project_id: params.project_id,
      p_area_id: params.area_id,
      p_resource_id: params.resource_id,
      p_task_id: params.task_id,
      p_tags: params.tags,
      p_status: params.status,
    };

    const { data, error } = await this.supabase.rpc("insert_note", args);

    if (error) throw error;
    return data;
  }

  async updateNote(params: UpdateNoteParams): Promise<UpdateNoteReturn> {
    const args: UpdateNoteArgs = {
      p_note_id: params.note_id,
      p_name: params.name,
      p_content: params.content,
      p_note_type: params.note_type,
      p_project_id: params.project_id,
      p_area_id: params.area_id,
      p_resource_id: params.resource_id,
      p_task_id: params.task_id,
      p_tags: params.tags,
      p_status: params.status,
    };

    const { data, error } = await this.supabase.rpc("update_note", args);

    if (error) throw error;
    return data;
  }

  async deleteNote(noteId: string): Promise<null> {
    const { error } = await this.supabase.rpc("delete_note", {
      p_note_id: noteId,
    });

    if (error) throw error;
    return null;
  }

  async selectNote(noteId: string): Promise<Note> {
    const { data, error } = await this.supabase
      .from("notes")
      .select("*")
      .eq("note_id", noteId)
      .single();

    if (error) throw error;
    return data;
  }

  async getNoteSummary(noteId: string): Promise<GetNoteSummaryReturn> {
    const { data, error } = await this.supabase.rpc("get_note_summary", {
      p_note_id: noteId,
    });

    if (error) throw error;
    return data;
  }

  async getNotesByStatus(userId: string | null, status: NoteStatus) {
    if (!userId) return [];

    const { data, error } = await this.supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }
}
