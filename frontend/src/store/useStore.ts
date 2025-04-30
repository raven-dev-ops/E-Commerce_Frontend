// frontend/src/store/useStore.ts
import create from 'zustand';

export interface CartItem {
  productId: number;
  quantity: number;
}

interface StoreState {
  cart: CartItem[];
  addToCart: (productId: number, qty?: number) => void;
  clearCart: () => void;
}

export const useStore = create<StoreState>((set) => ({
  cart: [],
  addToCart: (productId, qty = 1) =>
    set((state) => {
      const existing = state.cart.find((i) => i.productId === productId);
      if (existing) {
        return {
          cart: state.cart.map((i) =>
            i.productId === productId
              ? { ...i, quantity: i.quantity + qty }
              : i
          ),
        };
      }
      return {
        cart: [...state.cart, { productId, quantity: qty }],
      };
    }),
  clearCart: () => set({ cart: [] }),
}));
