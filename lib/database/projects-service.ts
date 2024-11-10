import { SupabaseClient } from "@supabase/supabase-js";
import { Database, TablesInsert } from "@/supabase/types";

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type GetProjectTagsReturnType =
  Database["public"]["Functions"]["get_project_tags"]["Returns"];
export type GetConnectedProjectsReturnType =
  Database["public"]["Functions"]["get_connected_projects"]["Returns"];
export type GetProjectHierarchyReturnType =
  Database["public"]["Functions"]["get_project_hierarchy"]["Returns"];
export type GetProjectConnectionsReturnType =
  Database["public"]["Functions"]["get_project_connections"]["Returns"];
export type GetProjectSummaryReturnType =
  Database["public"]["Functions"]["get_project_summary"]["Returns"];
export type MoveProjectReturnType =
  Database["public"]["Functions"]["move_project"]["Returns"];
export type InsertProjectReturnType =
  Database["public"]["Tables"]["projects"]["Insert"];
export type UpdateProjectReturnType =
  Database["public"]["Tables"]["projects"]["Update"];
export type GetProjectStatisticsReturnType =
  Database["public"]["Functions"]["get_project_statistics"]["Returns"];
export type GetProjectTimelineReturnType =
  Database["public"]["Functions"]["get_project_timeline"]["Returns"];

export class ProjectsService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getProjectTags(projectId: string): Promise<GetProjectTagsReturnType> {
    const { data, error } = await this.supabase.rpc("get_project_tags", {
      p_project_id: projectId,
    });

    if (error) throw error;
    return data;
  }

  async getConnectedProjects(
    projectId: string,
  ): Promise<GetConnectedProjectsReturnType> {
    const { data, error } = await this.supabase.rpc("get_connected_projects", {
      p_project_id: projectId,
    });

    if (error) throw error;
    return data;
  }

  async getProjectHierarchy(
    projectId: string,
  ): Promise<GetProjectHierarchyReturnType> {
    const { data, error } = await this.supabase.rpc("get_project_hierarchy", {
      p_project_id: projectId,
    });

    if (error) throw error;
    return data;
  }

  async getProjectConnections(
    projectId: string,
  ): Promise<GetProjectConnectionsReturnType> {
    const { data, error } = await this.supabase.rpc("get_project_connections", {
      p_project_id: projectId,
    });

    if (error) throw error;
    return data;
  }

  async getProjectSummary(
    projectId: string,
  ): Promise<GetProjectSummaryReturnType> {
    const { data, error } = await this.supabase.rpc("get_project_summary", {
      p_project_id: projectId,
    });

    if (error) throw error;
    return data;
  }

  async moveProject(
    projectId: string,
    newParentId: string | undefined,
  ): Promise<MoveProjectReturnType> {
    const { data, error } = await this.supabase.rpc("move_project", {
      p_project_id: projectId,
      p_new_parent_id: newParentId,
    });

    if (error) throw error;
    return data;
  }

  async insertProject(
    project: TablesInsert<"projects">,
  ): Promise<InsertProjectReturnType> {
    const { data, error } = await this.supabase
      .from("projects")
      .insert(project)
      .single();

    if (error) throw error;
    return data;
  }

  async updateProject(
    projectId: string,
    project: UpdateProjectReturnType,
  ): Promise<UpdateProjectReturnType> {
    const { data, error } = await this.supabase
      .from("projects")
      .update(project)
      .eq("project_id", projectId)
      .single();

    if (error) throw error;
    return data;
  }

  async deleteProject(projectId: string): Promise<null> {
    const { error } = await this.supabase
      .from("projects")
      .delete()
      .eq("project_id", projectId)
      .single();

    if (error) throw error;
    return null;
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
}
