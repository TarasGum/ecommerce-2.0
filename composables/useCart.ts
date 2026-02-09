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

function buildCartUrl(
  path: string,
  customerId: string,
  projectId?: number | null,
): string {
  const params = new URLSearchParams();
  params.set("customer_id", customerId);
  if (projectId !== undefined && projectId !== null) {
    params.set("project_id", projectId.toString());
  }
  return `${path}?${params.toString()}`;
}

export const useCart = () => {
  const api = useApi();

  // Current customer ID for cart operations
  let currentCustomerId: string | null = null;

  /**
   * Get cart for a customer
   * Returns cart snapshot with totals and items (prices fetched fresh from EBMS)
   */
  async function getCart(customerId: string, projectId?: number | null): Promise<Cart> {
    currentCustomerId = customerId;
    return api.get<Cart>(buildCartUrl("/cart/", customerId, projectId));
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
    projectId?: number | null,
  ): Promise<Cart> {
    const customerIdToUse = customerId ?? currentCustomerId;
    if (!customerIdToUse) {
      throw new Error("customer_id is required for cart operations");
    }
    return api.post<Cart>(
      buildCartUrl("/cart/", customerIdToUse, projectId),
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
    projectId?: number | null,
  ): Promise<Cart> {
    const customerIdToUse = customerId ?? currentCustomerId;
    if (!customerIdToUse) {
      throw new Error("customer_id is required for cart operations");
    }
    return api.patch<Cart>(
      buildCartUrl(`/cart/${itemId}/`, customerIdToUse, projectId),
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
    projectId?: number | null,
  ): Promise<Cart> {
    const customerIdToUse = customerId ?? currentCustomerId;
    if (!customerIdToUse) {
      throw new Error("customer_id is required for cart operations");
    }
    return api.delete<Cart>(
      buildCartUrl(`/cart/${itemId}/`, customerIdToUse, projectId),
    );
  }

  /**
   * Flush cart (delete all items)
   * Requires { flush: true } in request body
   */
  async function flushCart(customerId?: string, projectId?: number | null): Promise<void> {
    const customerIdToUse = customerId ?? currentCustomerId;
    if (!customerIdToUse) {
      throw new Error("customer_id is required for cart operations");
    }
    return api.delete(
      buildCartUrl("/cart/", customerIdToUse, projectId),
      { flush: true },
    );
  }

  /**
   * Submit cart as an ARQT proposal to the EBMS system.
   * On success the cart is cleared server-side and the ARQT response is returned.
   */
  async function submitProposal(
    customerId?: string,
    projectId?: number | null,
  ): Promise<any> {
    const customerIdToUse = customerId ?? currentCustomerId;
    if (!customerIdToUse) {
      throw new Error("customer_id is required for cart operations");
    }
    return api.post<any>(
      buildCartUrl("/cart/proposal/", customerIdToUse, projectId),
    );
  }

  return {
    getCart,
    buildAddPayload,
    addItem,
    updateItem,
    deleteItem,
    flushCart,
    submitProposal,
  };
};
