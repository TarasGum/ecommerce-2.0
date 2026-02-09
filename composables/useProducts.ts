// composables/useProducts.ts
// Products composable handles product-related API calls from Mirror DB
// NOTE: This is a TEST API and will be significantly changed

import type { Product, ProductsListResponse, ConfigurationProduct } from "~/types/models";

export interface ProductsListParams {
  fields?: string;
  limit?: number;
  offset?: number;
  project_id?: number;
  customer_id?: string;
  search?: string;
}

export const useProducts = () => {
  const api = useApi();

  /**
   * Fetch products list with pagination
   * @param params - filter and pagination options
   * @param signal - optional AbortSignal for request cancellation
   */
  async function list(params: ProductsListParams = {}, signal?: AbortSignal): Promise<ProductsListResponse> {
    const { fields, limit = 50, offset = 0, project_id, customer_id, search } = params;

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

    if (customer_id) {
      queryParams.set("customer_id", customer_id);
    }

    if (search) {
      queryParams.set("search", search);
    }

    const url = `/data/products-with-price/?${queryParams.toString()}`;
    return api.get<ProductsListResponse>(url, signal ? { signal } : undefined);
  }

  /**
   * Fetch single product by autoid
   * @param autoid - product autoid
   * @param customerId - optional customer ID for pricing
   * @param projectId - optional project ID for filtering
   */
  async function getByAutoid(autoid: string, customerId?: string, projectId?: number | null): Promise<Product> {
    const queryParams = new URLSearchParams();

    if (customerId) {
      queryParams.set("customer_id", customerId);
    }

    if (projectId !== undefined && projectId !== null) {
      queryParams.set("project_id", projectId.toString());
    }

    const query = queryParams.toString();
    const url = `/data/products/${autoid}/${query ? `?${query}` : ''}`;
    return api.get<Product>(url);
  }

  /**
   * Search products by ID (product code/SKU)
   * @param searchTerm - product ID/code to search for
   * @param params - additional list params
   */
  async function searchById(searchTerm: string, params: ProductsListParams = {}): Promise<ProductsListResponse> {
    return list({ ...params, search: searchTerm });
  }

  /**
   * Fetch product configurations
   * @param autoid - product autoid
   * @param customerId - customer ID for pricing
   * @param projectId - optional project ID for filtering
   */
  async function getConfigurations(autoid: string, customerId: string, projectId?: number | null): Promise<ConfigurationProduct> {
    const queryParams = new URLSearchParams();
    queryParams.set("customer_id", customerId);
    
    if (projectId !== undefined && projectId !== null) {
      queryParams.set("project_id", projectId.toString());
    }

    const url = `/data/products-with-price/${autoid}/configurations/?${queryParams.toString()}`;
    return api.get<ConfigurationProduct>(url);
  }

  /**
   * Fetch photos for configuration items
   * @param configurationId - product configuration ID
   * @param categoryName - configuration category name
   * @param projectId - optional project ID for filtering
   */
  async function getConfigurationPhotos(
    configurationId: string,
    categoryName: string,
    projectId?: number | null,
  ): Promise<Array<{ id: string; autoid: string; photos: string[] }>> {
    const queryParams = new URLSearchParams();
    queryParams.set("configuration_id", configurationId);
    queryParams.set("category_name", categoryName);

    if (projectId !== undefined && projectId !== null) {
      queryParams.set("project_id", projectId.toString());
    }

    const url = `/data/configurations-photos/?${queryParams.toString()}`;
    return api.get(url);
  }

  return {
    list,
    getByAutoid,
    searchById,
    getConfigurations,
    getConfigurationPhotos,
  };
};
