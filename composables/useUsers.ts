// composables/useUsers.ts
// Users composable handles user-related API calls

import type {
  User,
  PaginatedResponse,
  CreateUserPayload,
  UpdateUserPayload,
} from "~/types/models";

export interface UsersListParams {
  limit?: number;
  offset?: number;
  ordering?: string; // e.g., "first_name", "-email"
}

export const useUsers = () => {
  const api = useApi();

  /**
   * Fetch paginated users list
   * @param params - limit, offset and sorting options
   */
  async function list(params: UsersListParams = {}): Promise<PaginatedResponse<User>> {
    const { limit = 20, offset = 0, ordering } = params;
    
    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.set("limit", limit.toString());
    queryParams.set("offset", offset.toString());
    if (ordering) {
      queryParams.set("ordering", ordering);
    }

    return api.get<PaginatedResponse<User>>(`/users/?${queryParams.toString()}`);
  }

  /**
   * Create a new user
   * @param payload - user creation data
   */
  async function create(payload: CreateUserPayload): Promise<User> {
    return api.post<User>("/users/", payload);
  }

  /**
   * Partially update a user
   * @param id - user ID
   * @param payload - fields to update
   */
  async function patch(id: number, payload: UpdateUserPayload): Promise<User> {
    return api.patch<User>(`/users/${id}/`, payload);
  }

  /**
   * Delete a user
   * @param id - user ID
   */
  async function remove(id: number): Promise<void> {
    return api.delete(`/users/${id}/`);
  }

  return {
    list,
    create,
    patch,
    remove,
  };
};
