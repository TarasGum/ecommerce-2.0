import type { Product, CartItem, Cart } from "~/types/models";

export interface CartConfiguration {
  name: string;
  id: string | number;
}

export interface CartPayload {
  id: string | number;
  unit: string;
  count: number;
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
    count: number,
    configurations: CartConfiguration[] = [],
  ): CartPayload {
    return {
      id: product.autoid,
      unit: product.unit || product.def_unit || "",
      count,
      configurations,
    };
  }

  /**
   * Add item to cart
   */
  async function addItem(payload: CartPayload) {
    const url = currentCustomerId
      ? `/cart/add/?customer_id=${encodeURIComponent(currentCustomerId)}`
      : "/cart/add/";
    return api.post(url, payload);
  }

  /**
   * Update cart item
   */
  async function changeItem(itemId: string | number, payload: Partial<CartPayload>) {
    const url = currentCustomerId
      ? `/cart/${itemId}/?customer_id=${encodeURIComponent(currentCustomerId)}`
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
