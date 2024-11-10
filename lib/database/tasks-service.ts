import { SupabaseClient } from "@supabase/supabase-js";
import { Database, TablesInsert } from "@/supabase/types";

export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type GetTaskHierarchyReturnType =
  Database["public"]["Functions"]["get_task_hierarchy"]["Returns"];
export type GetTaskDependenciesReturnType =
  Database["public"]["Functions"]["get_task_dependencies"]["Returns"];
export type GetTaskHierarchyWithDependenciesReturnType =
  Database["public"]["Functions"]["get_task_hierarchy_with_dependencies"]["Returns"];
export type GetUserTasksReturnType =
  Database["public"]["Functions"]["get_user_tasks"]["Returns"];
export type GetTasksForProjectReturnType =
  Database["public"]["Functions"]["get_tasks_for_project"]["Returns"];
export type GetOverdueTasksReturnType =
  Database["public"]["Functions"]["get_overdue_tasks"]["Returns"];
export type GetCompletedTasksInProjectReturnType =
  Database["public"]["Functions"]["get_completed_tasks_in_project"]["Returns"];
export type GetTaskSummaryForUserReturnType =
  Database["public"]["Functions"]["get_task_summary_for_user"]["Returns"];

export class TasksService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getTaskHierarchy(taskId: string): Promise<GetTaskHierarchyReturnType> {
    const { data, error } = await this.supabase.rpc("get_task_hierarchy", {
      p_task_id: taskId,
    });

    if (error) throw error;
    return data;
  }

  async getTaskDependencies(
    taskId: string,
  ): Promise<GetTaskDependenciesReturnType> {
    const { data, error } = await this.supabase.rpc("get_task_dependencies", {
      p_task_id: taskId,
    });

    if (error) throw error;
    return data;
  }

  async canCompleteTask(taskId: string): Promise<boolean> {
    const { data, error } = await this.supabase.rpc("can_complete_task", {
      p_task_id: taskId,
    });

    if (error) throw error;
    return data;
  }

  async archiveTaskCascade(taskId: string): Promise<void> {
    const { error } = await this.supabase.rpc("archive_task_cascade", {
      p_task_id: taskId,
    });

    if (error) throw error;
  }

  async getTaskHierarchyWithDependencies(
    taskId: string,
  ): Promise<GetTaskHierarchyWithDependenciesReturnType> {
    const { data, error } = await this.supabase.rpc(
      "get_task_hierarchy_with_dependencies",
      {
        p_task_id: taskId,
      },
    );

    if (error) throw error;
    return data;
  }

  async getUserTasks(
    userId: string,
    status?: string,
    isArchived: boolean = false,
  ): Promise<GetUserTasksReturnType> {
    const { data, error } = await this.supabase.rpc("get_user_tasks", {
      p_user_id: userId,
      p_status: status,
      p_is_archived: isArchived,
    });

    if (error) throw error;
    return data;
  }

  async getTasksForProject(
    projectId: string,
    includeSubtasks: boolean = true,
    status?: string,
  ): Promise<GetTasksForProjectReturnType> {
    const { data, error } = await this.supabase.rpc("get_tasks_for_project", {
      p_project_id: projectId,
      p_include_subtasks: includeSubtasks,
      p_status: status,
    });

    if (error) throw error;
    return data;
  }

  async getOverdueTasks(
    userId?: string,
    projectId?: string,
  ): Promise<GetOverdueTasksReturnType> {
    const { data, error } = await this.supabase.rpc("get_overdue_tasks", {
      p_user_id: userId,
      p_project_id: projectId,
    });

    if (error) throw error;
    return data;
  }

  async getCompletedTasksInProject(
    projectId: string,
  ): Promise<GetCompletedTasksInProjectReturnType> {
    const { data, error } = await this.supabase.rpc(
      "get_completed_tasks_in_project",
      {
        p_project_id: projectId,
      },
    );

    if (error) throw error;
    return data;
  }

  async getTaskSummaryForUser(
    userId: string,
  ): Promise<GetTaskSummaryForUserReturnType> {
    const { data, error } = await this.supabase.rpc(
      "get_task_summary_for_user",
      {
        p_user_id: userId,
      },
    );

    if (error) throw error;
    return data;
  }

  async insertTask(task: TablesInsert<"tasks">): Promise<Task> {
    const { data, error } = await this.supabase
      .from("tasks")
      .insert(task)
      .single();

    if (error) throw error;
    return data;
  }

  async updateTask(taskId: string, task: Partial<Task>): Promise<Task> {
    const { data, error } = await this.supabase
      .from("tasks")
      .update(task)
      .eq("task_id", taskId)
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTask(taskId: string): Promise<null> {
    const { error } = await this.supabase
      .from("tasks")
      .delete()
      .eq("task_id", taskId)
      .single();

    if (error) throw error;
    return null;
  }

  async selectTask(taskId: string): Promise<Task> {
    const { data, error } = await this.supabase
      .from("tasks")
      .select("*")
      .eq("task_id", taskId)
      .single();

    if (error) throw error;
    return data;
  }

  async createTaskDependency(
    dependentTaskId: string,
    dependencyTaskId: string,
  ): Promise<null> {
    const { error } = await this.supabase
      .from("task_dependencies")
      .insert({
        dependent_task_id: dependentTaskId,
        dependency_task_id: dependencyTaskId,
      })
      .single();

    if (error) throw error;
    return null;
  }

  async deleteTaskDependency(
    dependentTaskId: string,
    dependencyTaskId: string,
  ): Promise<null> {
    const { error } = await this.supabase
      .from("task_dependencies")
      .delete()
      .match({
        dependent_task_id: dependentTaskId,
        dependency_task_id: dependencyTaskId,
      })
      .single();

    if (error) throw error;
    return null;
  }
}
