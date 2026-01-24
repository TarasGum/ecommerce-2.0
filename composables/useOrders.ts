// composables/useOrders.ts
// Orders composable handles order-related API calls

import type {
  Order,
  OrderItem,
  PaginatedResponse,
} from "~/types/models";
import type { OrderStatus } from "~/utils/constants";

export interface OrdersListParams {
  status?: OrderStatus;
  invoice?: string;
  customer_id?: string;
  limit?: number;
  offset?: number;
  ordering?: string;
  project_id?: number;
}

export const useOrders = () => {
  const api = useApi();

  /**
   * Fetch orders list with filters
   * @param params - filter and pagination options
   */
  async function list(params: OrdersListParams = {}): Promise<PaginatedResponse<Order>> {
    const { status, invoice, customer_id, limit = 50, offset = 0, ordering, project_id } = params;
    
    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.set("limit", limit.toString());
    queryParams.set("offset", offset.toString());
    
    if (status) {
      queryParams.set("status", status);
    }
    if (invoice) {
      queryParams.set("invoice", invoice);
    }
    if (customer_id) {
      queryParams.set("customer_id", customer_id);
    }
    if (ordering) {
      queryParams.set("ordering", ordering);
    }
    if (project_id !== undefined) {
      queryParams.set("project_id", project_id.toString());
    }

    const url = `/data/orders/?${queryParams.toString()}`;
    return api.get<PaginatedResponse<Order>>(url);
  }

  /**
   * Fetch single order by autoid with items
   * @param autoid - order autoid
   */
  async function getByAutoid(autoid: string): Promise<Order> {
    return api.get<Order>(`/data/orders/${autoid}/`);
  }

  /**
   * Fetch order details (line items) by invoice number
   * @param invoice - order invoice number
   */
  async function getDetailsByInvoice(invoice: string): Promise<{ items: OrderItem[] }> {
    return api.get<{ items: OrderItem[] }>(`/data/orders/${invoice}/details/`);
  }

  return {
    list,
    getByAutoid,
    getDetailsByInvoice,
  };
};
