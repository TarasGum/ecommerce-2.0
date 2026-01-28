// composables/useProjects.ts
// Projects composable handles project-related API calls (SuperAdmin only)

import type {
  Project,
  PaginatedResponse,
  CreateProjectPayload,
  UpdateProjectPayload,
} from "~/types/models";

export interface ProjectsListParams {
  limit?: number;
  offset?: number;
  ordering?: string;
  search?: string;
}

export const useProjects = () => {
  const api = useApi();

  /**
   * Fetch paginated projects list (SuperAdmin only)
   * @param params - limit, offset, ordering and search options
   */
  async function list(
    params: ProjectsListParams = {}
  ): Promise<PaginatedResponse<Project>> {
    const { limit = 50, offset = 0, ordering, search } = params;

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

    return api.get<PaginatedResponse<Project>>(
      `/projects/?${queryParams.toString()}`
    );
  }

  /**
   * Get a single project by ID (SuperAdmin only)
   * @param id - project ID
   */
  async function get(id: number): Promise<Project> {
    return api.get<Project>(`/projects/${id}/`);
  }

  /**
   * Create a new project (SuperAdmin only)
   * @param payload - project creation data
   */
  async function create(payload: CreateProjectPayload): Promise<Project> {
    return api.post<Project>("/projects/", payload);
  }

  /**
   * Update a project (full update) (SuperAdmin only)
   * @param id - project ID
   * @param payload - all project fields
   */
  async function update(id: number, payload: CreateProjectPayload): Promise<Project> {
    return api.put<Project>(`/projects/${id}/`, payload);
  }

  /**
   * Partially update a project (SuperAdmin only)
   * @param id - project ID
   * @param payload - fields to update
   */
  async function patch(id: number, payload: UpdateProjectPayload): Promise<Project> {
    return api.patch<Project>(`/projects/${id}/`, payload);
  }

  /**
   * Delete a project (SuperAdmin only)
   * @param id - project ID
   */
  async function remove(id: number): Promise<void> {
    return api.delete(`/projects/${id}/`);
  }

  return {
    list,
    get,
    create,
    update,
    patch,
    remove,
  };
};
