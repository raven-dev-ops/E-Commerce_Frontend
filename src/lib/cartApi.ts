// src/lib/cartApi.ts

import { api } from '@/lib/api';

// All MongoDB IDs are strings
export interface CartItem {
  id: string;             // Cart item ID (MongoDB ObjectId as string)
  product_id: string;     // Product ID (MongoDB ObjectId as string)
  product_name: string;
  quantity: number;
  price: number;
  // Add other relevant item properties if needed
}

export interface Cart {
  id: string;             // Cart ID (MongoDB ObjectId as string)
  items: CartItem[];
  total_price: string; // Or number, depending on your backend
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

// Function to fetch cart contents
export async function fetchCartContents(): Promise<Cart> {
  try {
    const response = await api.get<Cart>('/cart/');
    return response.data;
  } catch (error) {
    console.error('Error fetching cart contents:', error);
    throw error;
  }
}

// Function to add a product to the cart
export async function addItemToCart(itemData: AddItemData): Promise<Cart> {
  try {
    const response = await api.post<Cart>('/cart/', itemData);
    return response.data;
  } catch (error) {
    console.error('Error adding item to cart:', error);
    throw error;
  }
}

// Function to update the quantity of an item in the cart
export async function updateCartItemQuantity(updateData: UpdateItemData): Promise<Cart> {
  try {
    const response = await api.put<Cart>('/cart/', updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    throw error;
  }
}

// Function to remove an item from the cart
export async function removeCartItem(removeData: RemoveItemData): Promise<Cart> {
  try {
    const response = await api.delete<Cart>('/cart/', { data: removeData }); // DELETE request body for item_id
    return response.data;
  } catch (error) {
    console.error('Error removing item from cart:', error);
    throw error;
  }
}

// Optional: Function to clear the entire cart (uncomment if backend supports)
// export async function clearCart(): Promise<void> {
//   try {
//     await api.delete<void>('/cart/'); // Or api.post('/cart/clear/') depending on backend
//   } catch (error) {
//     console.error('Error clearing cart:', error);
//     throw error;
//   }
// }
