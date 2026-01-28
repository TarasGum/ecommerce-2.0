// composables/useTasks.ts
// Tasks composable handles task-related API calls

import type {
  Task,
  TaskListItem,
  TaskStatus,
  PaginatedResponse,
  CreateTaskPayload,
  UpdateTaskPayload,
  CreateTaskStatusPayload,
  UpdateTaskStatusPayload,
  TaskPriority,
} from "~/types/models";

export interface TasksListParams {
  limit?: number;
  offset?: number;
  search?: string;
  author?: number;
  responsible_user?: number;
  status?: number;
  priority?: TaskPriority;
  due_date_from?: string;
  due_date_to?: string;
  ordering?: string;
  project_id?: number;
}

export interface TasksListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: TaskListItem[];
}

export interface TaskStatusListParams {
  limit?: number;
  offset?: number;
  ordering?: string;
  search?: string;
  project_id?: number;
}

export interface TaskStatusListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: TaskStatus[];
}

export const useTasks = () => {
  const api = useApi();

  // ==================== TASKS ====================

  /**
   * Fetch paginated tasks list
   * @param params - pagination, search, and filtering options
   */
  async function list(params: TasksListParams = {}): Promise<TasksListResponse> {
    const {
      limit = 20,
      offset = 0,
      search,
      author,
      responsible_user,
      status,
      priority,
      due_date_from,
      due_date_to,
      ordering,
      project_id,
    } = params;

    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.set("limit", limit.toString());
    queryParams.set("offset", offset.toString());

    if (search) {
      queryParams.set("search", search);
    }
    if (author !== undefined) {
      queryParams.set("author", author.toString());
    }
    if (responsible_user !== undefined) {
      queryParams.set("responsible_user", responsible_user.toString());
    }
    if (status !== undefined) {
      queryParams.set("status", status.toString());
    }
    if (priority) {
      queryParams.set("priority", priority);
    }
    if (due_date_from) {
      queryParams.set("due_date_from", due_date_from);
    }
    if (due_date_to) {
      queryParams.set("due_date_to", due_date_to);
    }
    if (ordering) {
      queryParams.set("ordering", ordering);
    }
    if (project_id !== undefined) {
      queryParams.set("project_id", project_id.toString());
    }

    return api.get<TasksListResponse>(`/tasks/?${queryParams.toString()}`);
  }

  /**
   * Get a single task by ID
   * @param taskId - task ID
   */
  async function getById(taskId: number): Promise<Task> {
    return api.get<Task>(`/tasks/${taskId}/`);
  }

  /**
   * Create a new task
   * @param payload - task creation data
   */
  async function create(payload: CreateTaskPayload): Promise<Task> {
    return api.post<Task>("/tasks/", payload);
  }

  /**
   * Update a task (partial update)
   * @param taskId - task ID
   * @param payload - fields to update
   */
  async function update(taskId: number, payload: UpdateTaskPayload): Promise<Task> {
    return api.patch<Task>(`/tasks/${taskId}/`, payload);
  }

  /**
   * Delete a task
   * @param taskId - task ID
   */
  async function remove(taskId: number): Promise<void> {
    return api.delete(`/tasks/${taskId}/`);
  }

  // ==================== TASK STATUSES ====================

  /**
   * Fetch paginated task statuses list
   * @param params - pagination and filtering options
   */
  async function listStatuses(params: TaskStatusListParams = {}): Promise<TaskStatusListResponse> {
    const { limit = 100, offset = 0, ordering, search, project_id } = params;

    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.set("limit", limit.toString());
    queryParams.set("offset", offset.toString());

    if (ordering) {
      queryParams.set("ordering", ordering);
    }
    if (search) {
      queryParams.set("search", search);
    }
    if (project_id !== undefined) {
      queryParams.set("project_id", project_id.toString());
    }

    return api.get<TaskStatusListResponse>(`/tasks/statuses/?${queryParams.toString()}`);
  }

  /**
   * Get a single task status by ID
   * @param statusId - status ID
   */
  async function getStatusById(statusId: number): Promise<TaskStatus> {
    return api.get<TaskStatus>(`/tasks/statuses/${statusId}/`);
  }

  /**
   * Create a new task status
   * @param payload - status creation data
   */
  async function createStatus(payload: CreateTaskStatusPayload): Promise<TaskStatus> {
    return api.post<TaskStatus>("/tasks/statuses/", payload);
  }

  /**
   * Update a task status (partial update)
   * @param statusId - status ID
   * @param payload - fields to update
   */
  async function updateStatus(statusId: number, payload: UpdateTaskStatusPayload): Promise<TaskStatus> {
    return api.patch<TaskStatus>(`/tasks/statuses/${statusId}/`, payload);
  }

  /**
   * Delete a task status
   * @param statusId - status ID
   */
  async function removeStatus(statusId: number): Promise<void> {
    return api.delete(`/tasks/statuses/${statusId}/`);
  }

  return {
    // Tasks
    list,
    getById,
    create,
    update,
    remove,
    // Task Statuses
    listStatuses,
    getStatusById,
    createStatus,
    updateStatus,
    removeStatus,
  };
};
