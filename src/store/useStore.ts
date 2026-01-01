import { create, StateCreator } from 'zustand';
import {
  clearAuthStorage,
  getAuthSession,
  hasAuthTokens,
  setAuthSession,
  type AuthSession,
  type AuthUser,
} from '@/lib/authStorage';
import {
  addItemToCart as addItemToCartApi,
  fetchCartContents,
  removeCartItem as removeCartItemApi,
  updateCartItemQuantity as updateCartItemQuantityApi,
  type Cart as ServerCart,
} from '@/lib/cartApi';

// Type for a cart item
export interface CartItem {
  productId: string; // CHANGED from number to string
  quantity: number;
  serverItemId?: string;
}

// Store state type
export interface StoreState {
  isAuthenticated: boolean;
  authHydrated: boolean;
  user: AuthUser;
  cart: CartItem[];
  cartSyncStatus: 'idle' | 'loading' | 'error';
  cartMergeNotice: string | null;
  login: (session: AuthSession) => void;
  logout: () => void;
  hydrateAuth: () => void;
  syncCartFromServer: () => Promise<void>;
  mergeGuestCartToServer: () => Promise<void>;
  clearCartMergeNotice: () => void;
  addToCart: (productId: string, qty?: number) => void; // CHANGED
  clearCart: () => void;
  updateCartItemQuantity: (productId: string, newQuantity: number) => void; // CHANGED
  removeFromCart: (productId: string) => void; // CHANGED
  hydrateCart: () => void;
}

const CART_STORAGE_KEY = 'cart';
const shouldLog = process.env.NODE_ENV !== 'production';

const logStorageError = (message: string, error: unknown) => {
  if (!shouldLog) return;
  // eslint-disable-next-line no-console
  console.error(message, error);
};

const saveCartToLocalStorage = (cart: CartItem[]) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  } catch (e) {
    logStorageError('Failed to save cart to localStorage', e);
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
    logStorageError('Failed to load cart from localStorage', e);
  }
  return [];
};

const mapServerCartToLocal = (serverCart: ServerCart): CartItem[] =>
  serverCart.items.map((item) => ({
    productId: String(item.product_id),
    quantity: item.quantity,
    serverItemId: String(item.id),
  }));

export const useStore = create<StoreState>(
  (set: Parameters<StateCreator<StoreState>>[0], get) => ({
    isAuthenticated: false,
    authHydrated: false,
    user: null,
    cart: [],
    cartSyncStatus: 'idle',
    cartMergeNotice: null,

    login: (session: AuthSession) => {
      setAuthSession(session);
      set({ isAuthenticated: true, user: session.user, authHydrated: true });
      void get().mergeGuestCartToServer();
    },

    logout: () => {
      clearAuthStorage();
      set({
        isAuthenticated: false,
        user: null,
        authHydrated: true,
        cartSyncStatus: 'idle',
        cartMergeNotice: null,
      });
    },

    hydrateAuth: () => {
      const session = getAuthSession();
      const authed = hasAuthTokens();
      set({
        isAuthenticated: hasAuthTokens(),
        user: session.user,
        authHydrated: true,
      });
      if (authed) {
        void get().syncCartFromServer();
      }
    },

    syncCartFromServer: async () => {
      if (!get().isAuthenticated) return;
      set({ cartSyncStatus: 'loading' });
      try {
        const serverCart = await fetchCartContents();
        const mapped = mapServerCartToLocal(serverCart);
        saveCartToLocalStorage(mapped);
        set({ cart: mapped, cartSyncStatus: 'idle' });
      } catch {
        set({ cartSyncStatus: 'error' });
      }
    },

    mergeGuestCartToServer: async () => {
      if (!get().isAuthenticated) return;
      const localCart = get().cart;
      if (localCart.length === 0) {
        await get().syncCartFromServer();
        return;
      }

      set({ cartSyncStatus: 'loading' });
      try {
        const serverCart = await fetchCartContents();
        const serverItems = mapServerCartToLocal(serverCart);
        const serverMap = new Map(
          serverItems.map((item) => [item.productId, item])
        );
        const hasConflicts = localCart.some((item) => serverMap.has(item.productId));

        await Promise.all(
          localCart.map(async (item) => {
            const serverItem = serverMap.get(item.productId);
            if (serverItem?.serverItemId) {
              await updateCartItemQuantityApi({
                item_id: serverItem.serverItemId,
                quantity: serverItem.quantity + item.quantity,
              });
              return;
            }
            await addItemToCartApi({ product_id: item.productId, quantity: item.quantity });
          })
        );

        await get().syncCartFromServer();
        if (hasConflicts) {
          set({
            cartMergeNotice:
              'We merged your local cart with your saved cart. Quantities were combined for overlapping items.',
          });
        } else {
          set({ cartMergeNotice: null });
        }
      } catch {
        set({ cartSyncStatus: 'error' });
      }
    },

    clearCartMergeNotice: () => set({ cartMergeNotice: null }),

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
        if (state.isAuthenticated) {
          void addItemToCartApi({ product_id: productId, quantity: qty })
            .then(() => get().syncCartFromServer())
            .catch(() => get().syncCartFromServer());
        }
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
        if (state.isAuthenticated) {
          const current = state.cart.find((item) => item.productId === productId);
          if (current?.serverItemId) {
            if (newQuantity <= 0) {
              void removeCartItemApi({ item_id: current.serverItemId })
                .then(() => get().syncCartFromServer())
                .catch(() => get().syncCartFromServer());
            } else {
              void updateCartItemQuantityApi({
                item_id: current.serverItemId,
                quantity: newQuantity,
              }).catch(() => get().syncCartFromServer());
            }
          } else if (newQuantity > 0) {
            void addItemToCartApi({ product_id: productId, quantity: newQuantity })
              .then(() => get().syncCartFromServer())
              .catch(() => get().syncCartFromServer());
          }
        }
        return { cart: updatedCart };
      }),

    removeFromCart: (productId: string) =>
      set((state: StoreState) => {
        const updatedCart = state.cart.filter((item) => item.productId !== productId);
        saveCartToLocalStorage(updatedCart);
        if (state.isAuthenticated) {
          const current = state.cart.find((item) => item.productId === productId);
          if (current?.serverItemId) {
            void removeCartItemApi({ item_id: current.serverItemId })
              .then(() => get().syncCartFromServer())
              .catch(() => get().syncCartFromServer());
          }
        }
        return { cart: updatedCart };
      }),
  })
);
