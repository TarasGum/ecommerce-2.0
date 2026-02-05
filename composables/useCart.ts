import type { Product, CartItem, Cart, CartConfiguration } from "~/types/models";

export interface AddToCartPayload {
  product_autoid: string;
  quantity: number;
  unit: string;
  configurations?: CartConfiguration[];
}

export interface UpdateCartItemPayload {
  quantity?: number;
  configurations?: CartConfiguration[];
}

export const useCart = () => {
  const api = useApi();

  // Current customer ID for cart operations
  let currentCustomerId: string | null = null;

  /**
   * Get cart for a customer
   * Returns cart snapshot with totals and items (prices fetched fresh from EBMS)
   */
  async function getCart(customerId: string): Promise<Cart> {
    currentCustomerId = customerId;
    return api.get<Cart>(
      `/cart/?customer_id=${encodeURIComponent(customerId)}`,
    );
  }

  /**
   * Build cart payload from product data
   */
  function buildAddPayload(
    product: Product,
    quantity: number,
    unit: string,
    configurations: CartConfiguration[] = [],
  ): AddToCartPayload {
    return {
      product_autoid: product.autoid,
      quantity,
      unit,
      configurations: configurations.length > 0 ? configurations : undefined,
    };
  }

  /**
   * Add item to cart
   * If same product + unit + configurations exists, quantity is merged
   * Returns updated cart snapshot
   */
  async function addItem(
    payload: AddToCartPayload,
    customerId?: string,
  ): Promise<Cart> {
    const customerIdToUse = customerId ?? currentCustomerId;
    if (!customerIdToUse) {
      throw new Error("customer_id is required for cart operations");
    }
    return api.post<Cart>(
      `/cart/?customer_id=${encodeURIComponent(customerIdToUse)}`,
      payload,
    );
  }

  /**
   * Update cart item quantity and/or configurations
   * Returns updated cart snapshot
   */
  async function updateItem(
    itemId: number,
    payload: UpdateCartItemPayload,
    customerId?: string,
  ): Promise<Cart> {
    const customerIdToUse = customerId ?? currentCustomerId;
    if (!customerIdToUse) {
      throw new Error("customer_id is required for cart operations");
    }
    return api.patch<Cart>(
      `/cart/${itemId}/?customer_id=${encodeURIComponent(customerIdToUse)}`,
      payload,
    );
  }

  /**
   * Delete a single cart item
   * Returns updated cart snapshot
   */
  async function deleteItem(
    itemId: number,
    customerId?: string,
  ): Promise<Cart> {
    const customerIdToUse = customerId ?? currentCustomerId;
    if (!customerIdToUse) {
      throw new Error("customer_id is required for cart operations");
    }
    return api.delete<Cart>(
      `/cart/${itemId}/?customer_id=${encodeURIComponent(customerIdToUse)}`,
    );
  }

  /**
   * Flush cart (delete all items)
   * Requires { flush: true } in request body
   */
  async function flushCart(customerId?: string): Promise<void> {
    const customerIdToUse = customerId ?? currentCustomerId;
    if (!customerIdToUse) {
      throw new Error("customer_id is required for cart operations");
    }
    return api.delete(
      `/cart/?customer_id=${encodeURIComponent(customerIdToUse)}`,
      { flush: true },
    );
  }

  return {
    getCart,
    buildAddPayload,
    addItem,
    updateItem,
    deleteItem,
    flushCart,
  };
};
