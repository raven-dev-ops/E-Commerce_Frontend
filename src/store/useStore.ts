// frontend/src/store/useStore.ts

import { create, StateCreator } from 'zustand';

// Type for a cart item
export interface CartItem {
  productId: string; // CHANGED from number to string
  quantity: number;
}

interface User {
  [key: string]: any;
}

// Store state type
export interface StoreState {
  isAuthenticated: boolean;
  user: User | null;
  cart: CartItem[];
  login: (userData: User) => void;
  logout: () => void;
  addToCart: (productId: string, qty?: number) => void; // CHANGED
  clearCart: () => void;
  updateCartItemQuantity: (productId: string, newQuantity: number) => void; // CHANGED
  removeFromCart: (productId: string) => void; // CHANGED
  hydrateCart: () => void;
}

const CART_STORAGE_KEY = 'cart';

const saveCartToLocalStorage = (cart: CartItem[]) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  } catch (e) {
    console.error('Failed to save cart to localStorage', e);
  }
};

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
  return [];
};

export const useStore = create<StoreState>(
  (set: Parameters<StateCreator<StoreState>>[0]) => ({
    isAuthenticated: false,
    user: null,
    cart: [],

    login: (userData: User) => set({ isAuthenticated: true, user: userData }),

    logout: () => set({ isAuthenticated: false, user: null }),

    hydrateCart: () => {
      set({ cart: loadCartFromLocalStorage() });
    },

    addToCart: (productId: string, qty: number = 1) =>
      set((state: StoreState) => {
        const existing = state.cart.find((i) => i.productId === productId);
        let updatedCart;
        if (existing) {
          updatedCart = state.cart.map((i) =>
            i.productId === productId ? { ...i, quantity: i.quantity + qty } : i
          );
        } else {
          updatedCart = [...state.cart, { productId, quantity: qty }];
        }
        saveCartToLocalStorage(updatedCart);
        return { cart: updatedCart };
      }),

    clearCart: () => {
      saveCartToLocalStorage([]);
      set({ cart: [] });
    },

    updateCartItemQuantity: (productId: string, newQuantity: number) =>
      set((state: StoreState) => {
        const updatedCart =
          newQuantity <= 0
            ? state.cart.filter((item) => item.productId !== productId)
            : state.cart.map((item) =>
                item.productId === productId ? { ...item, quantity: newQuantity } : item
              );
        saveCartToLocalStorage(updatedCart);
        return { cart: updatedCart };
      }),

    removeFromCart: (productId: string) =>
      set((state: StoreState) => {
        const updatedCart = state.cart.filter((item) => item.productId !== productId);
        saveCartToLocalStorage(updatedCart);
        return { cart: updatedCart };
      }),
  })
);
