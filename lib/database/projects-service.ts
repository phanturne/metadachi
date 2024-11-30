import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/supabase/types";
import { RemovePPrefix } from "@/lib/utils";

// Table Types
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Tag = Database["public"]["Tables"]["tags"]["Row"];

// Function Return Types
export type GetProjectTagsReturn =
  Database["public"]["Functions"]["get_project_tags"]["Returns"];
export type GetRelatedNotesReturn =
  Database["public"]["Functions"]["get_related_notes"]["Returns"];
export type GetProjectSummaryReturn =
  Database["public"]["Functions"]["get_project_summary"]["Returns"];
export type InsertProjectReturn =
  Database["public"]["Functions"]["insert_project"]["Returns"];
export type UpdateProjectReturn =
  Database["public"]["Functions"]["update_project"]["Returns"];
export type DeleteProjectReturn =
  Database["public"]["Functions"]["delete_project"]["Returns"];
export type MoveProjectReturn =
  Database["public"]["Functions"]["move_project"]["Returns"];
export type GetConnectedProjectsReturn =
  Database["public"]["Functions"]["get_connected_projects"]["Returns"];
export type GetProjectHierarchyReturn =
  Database["public"]["Functions"]["get_project_hierarchy"]["Returns"];
export type GetProjectConnectionsReturn =
  Database["public"]["Functions"]["get_project_connections"]["Returns"];
export type GetProjectStatisticsReturnType =
  Database["public"]["Functions"]["get_project_statistics"]["Returns"];
export type GetProjectTimelineReturnType =
  Database["public"]["Functions"]["get_project_timeline"]["Returns"];
export type GetProjectsByStatusReturn =
  Database["public"]["Functions"]["get_user_projects"]["Returns"];

// Function Argument Types
export type InsertProjectArgs =
  Database["public"]["Functions"]["insert_project"]["Args"];
export type UpdateProjectArgs =
  Database["public"]["Functions"]["update_project"]["Args"];
export type GetProjectTagsArgs =
  Database["public"]["Functions"]["get_project_tags"]["Args"];
export type GetRelatedNotesArgs =
  Database["public"]["Functions"]["get_related_notes"]["Args"];

// Interface for cleaner API without 'p_' prefix
export type InsertProjectParams = RemovePPrefix<InsertProjectArgs>;
export type UpdateProjectParams = RemovePPrefix<UpdateProjectArgs>;

export class ProjectsService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getProjectTags(projectId: string): Promise<GetProjectTagsReturn> {
    const { data, error } = await this.supabase.rpc("get_project_tags", {
      p_project_id: projectId,
    });

    if (error) throw error;
    return data;
  }

  async getConnectedProjects(
    projectId: string,
  ): Promise<GetConnectedProjectsReturn> {
    const { data, error } = await this.supabase.rpc("get_connected_projects", {
      p_project_id: projectId,
    });

    if (error) throw error;
    return data;
  }

  async getProjectHierarchy(
    projectId: string,
  ): Promise<GetProjectHierarchyReturn> {
    const { data, error } = await this.supabase.rpc("get_project_hierarchy", {
      p_project_id: projectId,
    });

    if (error) throw error;
    return data;
  }

  async getProjectConnections(
    projectId: string,
  ): Promise<GetProjectConnectionsReturn> {
    const { data, error } = await this.supabase.rpc("get_project_connections", {
      p_project_id: projectId,
    });

    if (error) throw error;
    return data;
  }

  async getProjectSummary(projectId: string): Promise<GetProjectSummaryReturn> {
    const { data, error } = await this.supabase.rpc("get_project_summary", {
      p_project_id: projectId,
    });

    if (error) throw error;
    return data;
  }

  async moveProject(
    projectId: string,
    newParentId: string | undefined,
  ): Promise<MoveProjectReturn> {
    const { data, error } = await this.supabase.rpc("move_project", {
      p_project_id: projectId,
      p_new_parent_id: newParentId,
    });

    if (error) throw error;
    return data;
  }

  async insertProject(
    params: InsertProjectParams,
  ): Promise<InsertProjectReturn> {
    // Convert from clean API to required 'p_' prefix
    const args: InsertProjectArgs = {
      p_name: params.name,
      p_description: params.description,
      p_status: params.status,
      p_priority: params.priority,
      p_due_date: params.due_date,
      p_parent_project_id: params.parent_project_id,
      p_tags: params.tags,
    };

    const { data, error } = await this.supabase.rpc("insert_project", args);

    if (error) throw error;
    return data;
  }

  async updateProject(
    params: UpdateProjectParams,
  ): Promise<UpdateProjectReturn> {
    // Convert from clean API to required 'p_' prefix
    const args: UpdateProjectArgs = {
      p_project_id: params.project_id,
      p_name: params.name,
      p_description: params.description,
      p_status: params.status,
      p_priority: params.priority,
      p_due_date: params.due_date,
      p_parent_project_id: params.parent_project_id,
      p_tags: params.tags,
    };

    const { data, error } = await this.supabase.rpc("update_project", args);

    if (error) throw error;
    return data;
  }

  async deleteProject(projectId: string): Promise<DeleteProjectReturn> {
    const { data, error } = await this.supabase.rpc("delete_project", {
      p_project_id: projectId,
    });

    if (error) throw error;
    return data;
  }

  async selectProject(projectId: string): Promise<Project> {
    const { data, error } = await this.supabase
      .from("projects")
      .select("*")
      .eq("project_id", projectId)
      .single();

    if (error) throw error;
    return data;
  }

  async getRelatedNotes(projectId: string): Promise<GetRelatedNotesReturn> {
    const { data, error } = await this.supabase.rpc("get_related_notes", {
      p_entity_id: projectId,
      p_entity_type: "project",
    });

    if (error) throw error;
    return data;
  }

  async createProjectConnection(
    projectId: string,
    connectedProjectId: string,
    connectionType: string,
    context?: string,
  ): Promise<null> {
    const { error } = await this.supabase
      .from("project_connections")
      .insert({
        project_id: projectId,
        connected_project_id: connectedProjectId,
        connection_type: connectionType,
        context: context,
      })
      .single();

    if (error) throw error;
    return null;
  }

  async deleteProjectConnection(
    projectId: string,
    connectedProjectId: string,
  ): Promise<null> {
    const { error } = await this.supabase
      .from("project_connections")
      .delete()
      .match({
        project_id: projectId,
        connected_project_id: connectedProjectId,
      })
      .single();

    if (error) throw error;
    return null;
  }

  async getProjectStatistics(
    projectId: string,
  ): Promise<GetProjectStatisticsReturnType> {
    const { data, error } = await this.supabase.rpc("get_project_statistics", {
      p_project_id: projectId,
    });

    if (error) throw error;
    return data;
  }

  async archiveProjectCascade(projectId: string): Promise<void> {
    const { error } = await this.supabase.rpc("archive_project_cascade", {
      p_project_id: projectId,
    });

    if (error) throw error;
  }

  async getProjectTimeline(
    projectId: string,
  ): Promise<GetProjectTimelineReturnType> {
    const { data, error } = await this.supabase.rpc("get_project_timeline", {
      p_project_id: projectId,
    });

    if (error) throw error;
    return data;
  }

  async getProjectsByStatus(userId: string, status: string): Promise<GetProjectsByStatusReturn> {
    const { data, error } = await this.supabase.rpc("get_user_projects", {
      p_user_id: userId,
      p_status: status,
    });

    if (error) throw error;
    return data;
  }
}
