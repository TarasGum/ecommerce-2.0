// composables/useProjects.ts
// Projects composable handles project-related API calls

import type { Project, PaginatedResponse } from "~/types/models";

export interface ProjectsListParams {
  page?: number;
}

export const useProjects = () => {
  const api = useApi();

  /**
   * Fetch paginated projects list (SuperAdmin only)
   * @param params - page number
   */
  async function list(
    params: ProjectsListParams = {}
  ): Promise<PaginatedResponse<Project>> {
    const { page = 1 } = params;
    const queryParams = new URLSearchParams();
    queryParams.set("page", page.toString());

    return api.get<PaginatedResponse<Project>>(
      `/projects/?${queryParams.toString()}`
    );
  }

  return {
    list,
  };
};
