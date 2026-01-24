// composables/useCustomers.ts
// Customers composable handles customer-related API calls

import type {
  Customer,
  CreateCustomerPayload,
  UpdateCustomerPayload,
} from "~/types/models";

export interface CustomersListParams {
  limit?: number;
  offset?: number;
  search?: string;
  fields?: string; // e.g., "last_order_date"
  ordering?: string; // e.g., "l_name", "-last_order_date"
  project_id?: number;
}

export interface CustomersListResponse {
  count: number;
  limit: number;
  offset: number;
  results: Customer[];
}

export const useCustomers = () => {
  const api = useApi();

  /**
   * Fetch paginated customers list
   * @param params - pagination, search, and filtering options
   */
  async function list(params: CustomersListParams = {}): Promise<CustomersListResponse> {
    const { limit = 50, offset = 0, search, fields, ordering, project_id } = params;
    
    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.set("limit", limit.toString());
    queryParams.set("offset", offset.toString());
    
    if (search) {
      queryParams.set("search", search);
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

    return api.get<CustomersListResponse>(`/data/customers/?${queryParams.toString()}`);
  }

  /**
   * Get a single customer by ID
   * @param customerId - customer ID
   * @param fields - optional fields to include (e.g., "last_order_date")
   * @param projectId - optional project ID (for superadmin)
   */
  async function getById(customerId: string, fields?: string, projectId?: number): Promise<Customer> {
    const queryParams = new URLSearchParams();
    if (fields) {
      queryParams.set("fields", fields);
    }
    if (projectId !== undefined) {
      queryParams.set("project_id", projectId.toString());
    }

    const queryString = queryParams.toString();
    const url = `/data/customers/${customerId}/${queryString ? `?${queryString}` : ''}`;
    
    return api.get<Customer>(url);
  }

  /**
   * Create a new customer
   * @param payload - customer creation data
   */
  async function create(payload: CreateCustomerPayload): Promise<Customer> {
    return api.post<Customer>("/data/customers/", payload);
  }

  /**
   * Update a customer
   * @param customerId - customer ID
   * @param payload - fields to update
   */
  async function update(customerId: string, payload: UpdateCustomerPayload): Promise<Customer> {
    return api.patch<Customer>(`/data/customers/${customerId}/`, payload);
  }

  /**
   * Delete a customer
   * @param customerId - customer ID
   */
  async function remove(customerId: string): Promise<void> {
    return api.delete(`/data/customers/${customerId}/`);
  }

  return {
    list,
    getById,
    create,
    update,
    remove,
  };
};
