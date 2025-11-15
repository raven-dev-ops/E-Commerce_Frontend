// src/lib/cartApi.ts

import { api } from '@/lib/api';

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
    const response = await api.get<Cart>('/cart/');
    return response.data;
  } catch (error) {
    console.error('Error fetching cart contents:', error);
    throw error;
  }
}

/**
 * Add an item to the cart.
 */
export async function addItemToCart(itemData: AddItemData): Promise<Cart> {
  try {
    const response = await api.post<Cart>('/cart/', itemData);
    return response.data;
  } catch (error) {
    console.error('Error adding item to cart:', error);
    throw error;
  }
}

/**
 * Update the quantity of an existing cart item.
 */
export async function updateCartItemQuantity(updateData: UpdateItemData): Promise<Cart> {
  try {
    const response = await api.put<Cart>('/cart/', updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    throw error;
  }
}

/**
 * Remove a single item from the cart.
 */
export async function removeCartItem(removeData: RemoveItemData): Promise<Cart> {
  try {
    const response = await api.delete<Cart>('/cart/', { data: removeData });
    return response.data;
  } catch (error) {
    console.error('Error removing item from cart:', error);
    throw error;
  }
}

// Optional: clear entire cart (if your backend supports it)
// export async function clearCart(): Promise<void> {
//   await api.delete('/cart/');
// }
