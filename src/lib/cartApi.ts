// src/lib/cartApi.ts

import { api, getApiErrorMessage } from '@/lib/api';
import { cartSchema, parseWithSchema } from '@/lib/schemas';

export interface CartItem {
  id: string;             // Cart item ID (string from backend)
  product_id: string;     // Product ID (string from backend)
  product_name: string;
  quantity: number;
  price: number;
  // Add other relevant item properties if needed
}

export interface Cart {
  id: string;             // Cart ID (string from backend)
  items: CartItem[];
  total_price: string;    // Or number, depending on your backend
  // Add other relevant cart properties if needed
}

export interface AddItemData {
  product_id: string;     // CHANGED from number to string
  quantity: number;
}

export interface UpdateItemData {
  item_id: string;        // CHANGED from number to string
  quantity: number;
}

export interface RemoveItemData {
  item_id: string;        // CHANGED from number to string
}

/**
 * Fetch the current user's cart.
 */
export async function fetchCartContents(): Promise<Cart> {
  try {
    const response = await api.get('/cart/');
    return parseWithSchema(cartSchema, response.data, 'cart');
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to fetch cart contents.'));
  }
}

/**
 * Add an item to the cart.
 */
export async function addItemToCart(itemData: AddItemData): Promise<Cart> {
  try {
    const response = await api.post('/cart/', itemData);
    return parseWithSchema(cartSchema, response.data, 'cart');
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to add item to cart.'));
  }
}

/**
 * Update the quantity of an existing cart item.
 */
export async function updateCartItemQuantity(updateData: UpdateItemData): Promise<Cart> {
  try {
    const response = await api.put('/cart/', updateData);
    return parseWithSchema(cartSchema, response.data, 'cart');
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update cart item quantity.'));
  }
}

/**
 * Remove a single item from the cart.
 */
export async function removeCartItem(removeData: RemoveItemData): Promise<Cart> {
  try {
    const response = await api.delete('/cart/', { data: removeData });
    return parseWithSchema(cartSchema, response.data, 'cart');
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to remove cart item.'));
  }
}

// Optional: clear entire cart (if your backend supports it)
// export async function clearCart(): Promise<void> {
//   await api.delete('/cart/');
// }
