// composables/useProducts.ts
// Products composable handles product-related API calls from Mirror DB
// NOTE: This is a TEST API and will be significantly changed

import type { Product, ProductsListResponse } from "~/types/models";

export interface ProductsListParams {
  fields?: string;
  limit?: number;
  offset?: number;
  project_id?: number;
}

export const useProducts = () => {
  const api = useApi();

  /**
   * Fetch products list with pagination
   * @param params - filter and pagination options
   * @param signal - optional AbortSignal for request cancellation
   */
  async function list(params: ProductsListParams = {}, signal?: AbortSignal): Promise<ProductsListResponse> {
    const { fields, limit = 50, offset = 0, project_id } = params;
    
    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.set("limit", limit.toString());
    queryParams.set("offset", offset.toString());
    
    if (fields) {
      queryParams.set("fields", fields);
    }
    if (project_id !== undefined) {
      queryParams.set("project_id", project_id.toString());
    }

    const url = `/data/products/?${queryParams.toString()}`;
    return api.get<ProductsListResponse>(url, signal ? { signal } : undefined);
  }

  /**
   * Fetch single product by autoid
   * @param autoid - product autoid
   */
  async function getByAutoid(autoid: string): Promise<Product> {
    return api.get<Product>(`/data/products/${autoid}/`);
  }

  /**
   * Search products by ID (product code/SKU)
   * Note: API doesn't have search, so we fetch and filter client-side
   * This is a temporary solution until proper search is implemented
   * @param searchTerm - product ID/code to search for
   * @param params - additional list params
   */
  async function searchById(searchTerm: string, params: ProductsListParams = {}): Promise<ProductsListResponse> {
    // For now, fetch a larger batch and filter client-side
    // This will be replaced with proper server-side search
    const response = await list({ ...params, limit: 100 });
    
    if (!searchTerm.trim()) {
      return response;
    }

    const search = searchTerm.toLowerCase().trim();
    const filtered = response.results.filter(product => 
      product.id.toLowerCase().includes(search) ||
      product.autoid.toLowerCase().includes(search) ||
      product.descr_1.toLowerCase().includes(search)
    );

    return {
      ...response,
      count: filtered.length,
      results: filtered,
    };
  }

  return {
    list,
    getByAutoid,
    searchById,
  };
};
