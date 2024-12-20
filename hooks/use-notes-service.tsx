import { createClient } from "@/utils/supabase/client";
import { useMemo } from "react";
import {
  NotesService,
  InsertNoteParams,
  UpdateNoteParams,
  NoteStatus,
} from "@/lib/database/notes-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paraKeys } from "@/hooks/use-para-service";

export const useNotesService = () => {
  const supabase = createClient();
  const notesService = useMemo(() => new NotesService(supabase), [supabase]);
  return notesService;
};

export const noteKeys = {
  all: ["notes"] as const,
  note: (noteId: string) => [...noteKeys.all, noteId] as const,
  noteTags: (noteId: string) => [...noteKeys.note(noteId), "tags"] as const,
  relatedNotes: (noteId: string) =>
    [...noteKeys.note(noteId), "related"] as const,
  notesWithRelated: (noteId: string) =>
    [...noteKeys.note(noteId), "withRelated"] as const,
  userNotes: (userId: string) => [...noteKeys.all, "user", userId] as const,
  projectNotes: (projectId: string) =>
    [...noteKeys.all, "project", projectId] as const,
  taskNotes: (taskId: string) => [...noteKeys.all, "task", taskId] as const,
  recentNotes: (userId?: string, projectId?: string) =>
    [...noteKeys.all, "recent", userId || "all", projectId || "all"] as const,
  noteSummary: (noteId: string) =>
    [...noteKeys.note(noteId), "summary"] as const,
};

export const useGetNote = (noteId: string) => {
  const notesService = useNotesService();

  return useQuery({
    queryKey: noteKeys.note(noteId),
    queryFn: () => notesService.selectNote(noteId),
  });
};

export const useGetNoteTags = (noteId: string) => {
  const notesService = useNotesService();

  return useQuery({
    queryKey: noteKeys.noteTags(noteId),
    queryFn: () => notesService.getNoteTags(noteId),
  });
};

export const useGetRelatedNotes = (noteId: string) => {
  const notesService = useNotesService();

  return useQuery({
    queryKey: noteKeys.relatedNotes(noteId),
    queryFn: () => notesService.getRelatedNotes(noteId),
  });
};

export const useGetUserNotes = (
  userId: string,
  projectId?: string,
  areaId?: string,
  resourceId?: string,
  noteType?: string,
  isArchived: boolean = false,
) => {
  const notesService = useNotesService();

  return useQuery({
    queryKey: [
      ...noteKeys.userNotes(userId),
      projectId,
      areaId,
      resourceId,
      noteType,
      isArchived,
    ],
    queryFn: () =>
      notesService.getUserNotes(
        userId,
        projectId,
        areaId,
        resourceId,
        noteType,
        isArchived,
      ),
  });
};

export const useGetNotesForProject = (
  projectId: string,
  areaId?: string,
  taskId?: string,
  noteType?: string,
) => {
  const notesService = useNotesService();

  return useQuery({
    queryKey: [...noteKeys.projectNotes(projectId), areaId, taskId, noteType],
    queryFn: () =>
      notesService.getNotesForProject(projectId, areaId, taskId, noteType),
  });
};

export const useGetNotesForTask = (taskId: string) => {
  const notesService = useNotesService();

  return useQuery({
    queryKey: noteKeys.taskNotes(taskId),
    queryFn: () => notesService.getNotesForTask(taskId),
  });
};

export const useGetRecentNotes = (
  userId?: string,
  projectId?: string,
  limit: number = 10,
) => {
  const notesService = useNotesService();

  return useQuery({
    queryKey: [...noteKeys.recentNotes(userId, projectId), limit],
    queryFn: () => notesService.getRecentNotes(userId, projectId, limit),
  });
};

export const useMoveNote = () => {
  const notesService = useNotesService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      noteId,
      newProjectId,
      newAreaId,
      newResourceId,
      newTaskId,
    }: {
      noteId: string;
      newProjectId: string;
      newAreaId: string;
      newResourceId: string;
      newTaskId: string;
    }) =>
      notesService.moveNote(
        noteId,
        newProjectId,
        newAreaId,
        newResourceId,
        newTaskId,
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: noteKeys.note(variables.noteId),
      });
      queryClient.invalidateQueries({
        queryKey: noteKeys.projectNotes(variables.newProjectId),
      });
      if (variables.newTaskId) {
        queryClient.invalidateQueries({
          queryKey: noteKeys.taskNotes(variables.newTaskId),
        });
      }
    },
  });
};

export const useCreateNote = () => {
  const notesService = useNotesService();
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: (note: InsertNoteParams) => notesService.insertNote(note),
    onSuccess: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        queryClient.invalidateQueries({
          queryKey: noteKeys.all,
        });
        queryClient.invalidateQueries({
          queryKey: paraKeys.recentItems(session.user.id),
        });
      }
    },
  });
};

export const useUpdateNote = () => {
  const notesService = useNotesService();
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: (updates: UpdateNoteParams) => notesService.updateNote(updates),
    onSuccess: async (data, variables) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        queryClient.invalidateQueries({
          queryKey: noteKeys.note(variables.note_id),
        });
        queryClient.invalidateQueries({
          queryKey: noteKeys.userNotes(session.user.id),
        });
        queryClient.invalidateQueries({
          queryKey: paraKeys.recentItems(session.user.id),
        });
      }
    },
  });
};

export const useDeleteNote = () => {
  const notesService = useNotesService();
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: (noteId: string) => notesService.deleteNote(noteId),
    onSuccess: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        queryClient.invalidateQueries({
          queryKey: noteKeys.all,
        });
        queryClient.invalidateQueries({
          queryKey: paraKeys.recentItems(session.user.id),
        });
      }
    },
  });
};

export const useGetNoteSummary = (noteId: string) => {
  const notesService = useNotesService();

  return useQuery({
    queryKey: noteKeys.noteSummary(noteId),
    queryFn: () => notesService.getNoteSummary(noteId),
  });
};

export const useNotesByStatus = (userId: string | null, status: NoteStatus) => {
  const notesService = useNotesService();

  return useQuery({
    queryKey: ["notesByStatus", userId, status],
    queryFn: () => notesService.getNotesByStatus(userId, status),
    enabled: !!userId,
  });
};
