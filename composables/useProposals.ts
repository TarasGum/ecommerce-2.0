// composables/useProposals.ts
// Proposals composable handles proposal-related API calls

import type {
  Proposal,
  ProposalItem,
  PaginatedResponse,
} from "~/types/models";
import type { ProposalStatus } from "~/utils/constants";

export interface ProposalsListParams {
  status?: ProposalStatus;
  quote?: string;
  customer_id?: string;
  autoid?: string;
  fields?: string;
  limit?: number;
  offset?: number;
  ordering?: string;
  project_id?: number;
}

export const useProposals = () => {
  const api = useApi();

  /**
   * Fetch proposals list with filters
   * @param params - filter and pagination options
   * @param signal - optional AbortSignal for request cancellation
   */
  async function list(params: ProposalsListParams = {}, signal?: AbortSignal): Promise<PaginatedResponse<Proposal>> {
    const { status, quote, customer_id, autoid, fields, limit = 50, offset = 0, ordering, project_id } = params;
    
    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.set("limit", limit.toString());
    queryParams.set("offset", offset.toString());
    
    if (status) {
      queryParams.set("status", status);
    }
    if (quote) {
      queryParams.set("quote", quote);
    }
    if (customer_id) {
      queryParams.set("customer_id", customer_id);
    }
    if (autoid) {
      queryParams.set("autoid", autoid);
    }
    if (fields) {
      queryParams.set("fields", fields);
    }
    if (ordering) {
      queryParams.set("ordering", ordering);
    }
    if (project_id !== undefined) {
      queryParams.set("project_id", project_id.toString());
    }

    const url = `/data/proposals/?${queryParams.toString()}`;
    return api.get<PaginatedResponse<Proposal>>(url, signal ? { signal } : undefined);
  }

  /**
   * Fetch single proposal by autoid with items
   * @param autoid - proposal autoid
   * @param params - optional query parameters (fields, project_id)
   */
  async function getByAutoid(autoid: string, params?: { fields?: string; project_id?: number }): Promise<Proposal> {
    const queryParams = new URLSearchParams();
    
    if (params?.fields) {
      queryParams.set("fields", params.fields);
    }
    if (params?.project_id !== undefined) {
      queryParams.set("project_id", params.project_id.toString());
    }
    
    const queryString = queryParams.toString();
    const url = `/data/proposals/${autoid}/${queryString ? `?${queryString}` : ''}`;
    return api.get<Proposal>(url);
  }

  return {
    list,
    getByAutoid,
  };
};
