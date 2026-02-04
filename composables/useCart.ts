import type { Product, CartItem, Cart } from "~/types/models";

export interface CartConfiguration {
  name: string;
  id: string | number;
}

export interface CartPayload {
  id: string | number;
  unit: string;
  quantity: number;
  configurations: CartConfiguration[];
}

export const useCart = () => {
  const api = useApi();

  /**
   * Get cart for a customer
   */
  async function getCart(customerId: string): Promise<Cart> {
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
      id: product.autoid,
      unit: product.unit || product.def_unit || "",
      quantity,
      configurations,
    };
  }

  /**
   * Add item to cart
   */
  async function addItem(payload: CartPayload) {
    // TODO: implement API call
    return api.post("/cart/add/", payload);
  }

  /**
   * Update cart item
   */
  async function changeItem(itemId: string | number, payload: Partial<CartPayload>) {
    // TODO: implement API call
    return api.patch(`/cart/${itemId}/`, payload);
  }

  /**
   * Delete cart item
   */
  async function deleteItem(itemId: string | number) {
    // TODO: implement API call
    return api.delete(`/cart/${itemId}/`);
  }

  return {
    getCart,
    getPayload,
    addItem,
    changeItem,
    deleteItem,
  };
};
