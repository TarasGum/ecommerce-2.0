import type { Product, CartItem, Cart } from "~/types/models";

export interface CartConfiguration {
  name: string;
  id: string | number;
}

export interface CartPayload {
  product_autoid: string | number;
  unit: string;
  quantity: number;
  configurations: CartConfiguration[];
}

export const useCart = () => {
  const api = useApi();

  // Current customer ID for cart operations
  let currentCustomerId: string | null = null;

  /**
   * Get cart for a customer
   */
  async function getCart(customerId: string): Promise<Cart> {
    currentCustomerId = customerId;
    return api.get<Cart>(`/cart/?customer_id=${encodeURIComponent(customerId)}`);
  }

  /**
   * Build cart payload from product data
   */
  function getPayload(
    product: Product | CartItem,
    quantity: number,
    configurations: CartConfiguration[] = [],
  ): CartPayload {
    return {
      product_autoid: product.autoid,
      unit: product.unit || product.def_unit || "",
      quantity,
      configurations,
    };
  }

  /**
   * Add item to cart
   */
  async function addItem(payload: CartPayload, customerId?: string) {
    const customerIdToUse = customerId ?? currentCustomerId;
    const url = customerIdToUse
      ? `/cart/add/?customer_id=${encodeURIComponent(customerIdToUse)}`
      : "/cart/add/";
    return api.post(url, payload);
  }

  /**
   * Update cart item
   */
  async function changeItem(itemId: string | number, payload: Partial<CartPayload>, customerId?: string) {
    const customerIdToUse = customerId ?? currentCustomerId;
    const url = customerIdToUse
      ? `/cart/${itemId}/?customer_id=${encodeURIComponent(customerIdToUse)}`
      : `/cart/${itemId}/`;
    return api.patch(url, payload);
  }

  /**
   * Delete cart item
   */
  async function deleteItem(itemId: string | number) {
    const url = currentCustomerId
      ? `/cart/${itemId}/?customer_id=${encodeURIComponent(currentCustomerId)}`
      : `/cart/${itemId}/`;
    return api.delete(url);
  }

  return {
    getCart,
    getPayload,
    addItem,
    changeItem,
    deleteItem,
  };
};
