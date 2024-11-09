import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/supabase/types";

export type Note = Database["public"]["Tables"]["notes"]["Row"];
export type GetNoteTagsReturnType =
  Database["public"]["Functions"]["get_note_tags"]["Returns"];
export type GetRelatedNotesReturnType =
  Database["public"]["Functions"]["get_related_notes"]["Returns"];
export type GetNotesWithRelatedNotesReturnType =
  Database["public"]["Functions"]["get_notes_with_related_notes"]["Returns"];
export type MoveNoteReturnType =
  Database["public"]["Functions"]["move_note"]["Returns"];
export type GetUserNotesReturnType =
  Database["public"]["Functions"]["get_user_notes"]["Returns"];
export type GetNotesForProjectReturnType =
  Database["public"]["Functions"]["get_notes_for_project"]["Returns"];
export type GetNotesForTaskReturnType =
  Database["public"]["Functions"]["get_notes_for_task"]["Returns"];
export type GetRecentNotesReturnType =
  Database["public"]["Functions"]["get_recent_notes"]["Returns"];
export type InsertNoteReturnType =
  Database["public"]["Tables"]["notes"]["Insert"];
export type UpdateNoteReturnType =
  Database["public"]["Tables"]["notes"]["Update"];

export class NotesService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getNoteTags(noteId: string): Promise<GetNoteTagsReturnType> {
    const { data, error } = await this.supabase.rpc("get_note_tags", {
      p_note_id: noteId,
    });

    if (error) throw error;
    return data;
  }

  async getRelatedNotes(noteId: string): Promise<GetRelatedNotesReturnType> {
    const { data, error } = await this.supabase.rpc("get_related_notes", {
      p_note_id: noteId,
    });

    if (error) throw error;
    return data;
  }

  async getNotesWithRelatedNotes(
    noteId: string,
  ): Promise<GetNotesWithRelatedNotesReturnType> {
    const { data, error } = await this.supabase.rpc(
      "get_notes_with_related_notes",
      {
        p_note_id: noteId,
      },
    );

    if (error) throw error;
    return data;
  }

  async moveNote(
    noteId: string,
    newProjectId: string,
    newAreaId: string,
    newResourceId: string,
    newTaskId: string,
  ): Promise<MoveNoteReturnType> {
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
    taskId?: string,
    noteType?: string,
  ): Promise<GetUserNotesReturnType> {
    const { data, error } = await this.supabase.rpc("get_user_notes", {
      p_user_id: userId,
      p_project_id: projectId,
      p_area_id: areaId,
      p_task_id: taskId,
      p_note_type: noteType,
    });

    if (error) throw error;
    return data;
  }

  async getNotesForProject(
    projectId: string,
    areaId?: string,
    taskId?: string,
    noteType?: string,
  ): Promise<GetNotesForProjectReturnType> {
    const { data, error } = await this.supabase.rpc("get_notes_for_project", {
      p_project_id: projectId,
      p_area_id: areaId,
      p_task_id: taskId,
      p_note_type: noteType,
    });

    if (error) throw error;
    return data;
  }

  async getNotesForTask(taskId: string): Promise<GetNotesForTaskReturnType> {
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
  ): Promise<GetRecentNotesReturnType> {
    const { data, error } = await this.supabase.rpc("get_recent_notes", {
      p_user_id: userId,
      p_project_id: projectId,
      p_limit: limit,
    });

    if (error) throw error;
    return data;
  }

  async insertNote(note: InsertNoteReturnType): Promise<InsertNoteReturnType> {
    const { data, error } = await this.supabase
      .from("notes")
      .insert(note)
      .single();

    if (error) throw error;
    return data;
  }

  async updateNote(
    noteId: string,
    note: UpdateNoteReturnType,
  ): Promise<UpdateNoteReturnType> {
    const { data, error } = await this.supabase
      .from("notes")
      .update(note)
      .eq("id", noteId)
      .single();

    if (error) throw error;
    return data;
  }

  async deleteNote(noteId: string): Promise<null> {
    const { error } = await this.supabase
      .from("notes")
      .delete()
      .eq("id", noteId)
      .single();

    if (error) throw error;
    return null;
  }

  async selectNote(noteId: string): Promise<Note> {
    const { data, error } = await this.supabase
      .from("notes")
      .select("*")
      .eq("id", noteId)
      .single();

    if (error) throw error;
    return data;
  }
}
