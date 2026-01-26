// composables/usePayloadLogs.ts
// Payload Logs composable for SuperAdmin API logs viewing

import type {
  PayloadLogListParams,
  PayloadLogListResponse,
  PayloadLogDetail,
} from "~/types/models";

export const usePayloadLogs = () => {
  const api = useApi();

  /**
   * Fetch paginated list of payload logs with optional filters
   * @param params - Optional query parameters for filtering and pagination
   * @returns Paginated list of payload logs
   */
  async function list(params: PayloadLogListParams = {}): Promise<PayloadLogListResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) {
      queryParams.set("page", params.page.toString());
    }
    if (params.created_after) {
      queryParams.set("created_after", params.created_after);
    }
    if (params.created_before) {
      queryParams.set("created_before", params.created_before);
    }
    if (params.entity) {
      queryParams.set("entity", params.entity);
    }
    if (params.is_error !== undefined && params.is_error !== null) {
      queryParams.set("is_error", params.is_error.toString());
    }
    if (params.method) {
      queryParams.set("method", params.method);
    }
    if (params.project_id) {
      queryParams.set("project_id", params.project_id.toString());
    }
    if (params.status_code) {
      queryParams.set("status_code", params.status_code.toString());
    }

    const queryString = queryParams.toString();
    const url = queryString
      ? `/projects/payload-logs/?${queryString}`
      : "/projects/payload-logs/";

    return api.get<PayloadLogListResponse>(url);
  }

  /**
   * Get a single payload log by ID
   * @param id - The payload log ID
   * @returns Detailed payload log information
   */
  async function getById(id: number): Promise<PayloadLogDetail> {
    return api.get<PayloadLogDetail>(`/projects/payload-logs/${id}/`);
  }

  return {
    list,
    getById,
  };
};
