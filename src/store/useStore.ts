// frontend/src/store/useStore.ts
import { create } from 'zustand';

export interface CartItem {
  // Note: Based on backend models, productId might be a number, but ensure consistency
  productId: number;
  quantity: number;
}

interface StoreState {
  cart: CartItem[];
  addToCart: (productId: number, qty?: number) => void;
  clearCart: () => void;
  updateCartItemQuantity: (productId: number, newQuantity: number) => void;
  removeFromCart: (productId: number) => void;
}

const CART_STORAGE_KEY = 'cart';

// Function to save cart to localStorage
const saveCartToLocalStorage = (cart: CartItem[]) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  } catch (e) {
    console.error('Failed to save cart to localStorage', e);
  }
};

// Function to load cart from localStorage
const loadCartFromLocalStorage = (): CartItem[] => {
  try {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        return JSON.parse(savedCart) as CartItem[];
      }
    }
  } catch (e) {
    console.error('Failed to load cart from localStorage', e);
  }
  return []; // Return empty array if loading fails or no data exists
};

export const useStore = create<StoreState>((set) => {
  // Load initial state from localStorage
  const initialCart = loadCartFromLocalStorage();

  return {
    cart: initialCart,
    addToCart: (productId, qty = 1) =>
      set((state) => {
        const existing = state.cart.find((i) => i.productId === productId);
        let updatedCart;
        if (existing) {
          updatedCart = state.cart.map((i) =>
            i.productId === productId
              ? { ...i, quantity: i.quantity + qty }
              : i
          );
        } else {
          updatedCart = [...state.cart, { productId, quantity: qty }];
        }
        saveCartToLocalStorage(updatedCart); // Save to localStorage after update
        return { cart: updatedCart };
      }),
    clearCart: () => {
      saveCartToLocalStorage([]); // Save empty cart
      set({ cart: [] });
    },
    updateCartItemQuantity: (productId, newQuantity) =>
      set((state) => {
        const updatedCart = newQuantity <= 0
          ? state.cart.filter((item) => item.productId !== productId)
          : state.cart.map((item) =>
              item.productId === productId ? { ...item, quantity: newQuantity } : item
            );
        saveCartToLocalStorage(updatedCart); // Save to localStorage after update
        return { cart: updatedCart };
      }),
    removeFromCart: (productId) =>
      set((state) => {
        const updatedCart = state.cart.filter((item) => item.productId !== productId);
        saveCartToLocalStorage(updatedCart); // Save to localStorage after update
        return { cart: updatedCart };
      }),
  };
});
