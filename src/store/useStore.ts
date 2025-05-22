// frontend/src/store/useStore.ts
import { create } from 'zustand';

export interface CartItem {
  productId: number;
  quantity: number;
}

interface StoreState {
  isAuthenticated: boolean;
  user: { [key: string]: any } | null;
  cart: CartItem[];
  login: (userData: { [key: string]: any }) => void;
  logout: () => void;
  addToCart: (productId: number, qty?: number) => void;
  clearCart: () => void;
  updateCartItemQuantity: (productId: number, newQuantity: number) => void;
  removeFromCart: (productId: number) => void;
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

export const useStore = create<StoreState>((set) => ({
  isAuthenticated: false,
  user: null,
  cart: [],

  login: (userData) => set({ isAuthenticated: true, user: userData }),

  logout: () => set({ isAuthenticated: false, user: null }),

  hydrateCart: () => {
    set({ cart: loadCartFromLocalStorage() });
  },

  addToCart: (productId, qty = 1) =>
    set((state) => {
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

  updateCartItemQuantity: (productId, newQuantity) =>
    set((state) => {
      const updatedCart =
        newQuantity <= 0
          ? state.cart.filter((item) => item.productId !== productId)
          : state.cart.map((item) =>
              item.productId === productId ? { ...item, quantity: newQuantity } : item
            );
      saveCartToLocalStorage(updatedCart);
      return { cart: updatedCart };
    }),

  removeFromCart: (productId) =>
    set((state) => {
      const updatedCart = state.cart.filter((item) => item.productId !== productId);
      saveCartToLocalStorage(updatedCart);
      return { cart: updatedCart };
    }),
}));
