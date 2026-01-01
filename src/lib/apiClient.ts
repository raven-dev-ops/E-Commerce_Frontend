import { api, getApiErrorMessage } from '@/lib/api';
import { isAxiosError } from 'axios';
import {
  addressSchema,
  createOrderResponseSchema,
  orderSchema,
  parseWithSchema,
  productSchema,
  profileSchema,
} from '@/lib/schemas';
import type { Product } from '@/types/product';

export interface Address {
  id?: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default_shipping?: boolean;
  is_default_billing?: boolean;
}

export type AddressInput = Omit<Address, 'id'>;

export interface Profile {
  email: string;
  first_name?: string | null;
  last_name?: string | null;
}

export interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  status: string;
  total: number;
  created_at?: string;
  items: OrderItem[];
}

export interface CreateOrderResponse {
  id?: string | number;
  order_id?: string | number;
  order?: Order;
  payment_intent_client_secret?: string;
  client_secret?: string;
  requires_action?: boolean;
}

const hasResults = (value: unknown): value is { results: unknown[] } => {
  if (!value || typeof value !== 'object') return false;
  return Array.isArray((value as { results?: unknown[] }).results);
};

const extractResults = (data: unknown): unknown[] => {
  if (Array.isArray(data)) return data;
  if (hasResults(data)) return data.results;
  return [];
};

const normalizeOrderList = (data: unknown): Order[] => {
  const items = extractResults(data);

  return items
    .map((item: unknown) => {
      try {
        return parseWithSchema(orderSchema, item, 'order') as Order;
      } catch {
        return null;
      }
    })
    .filter(Boolean) as Order[];
};

const normalizeProductList = (data: unknown): Product[] => {
  const items = extractResults(data);

  return items
    .map((item: unknown) => {
      try {
        return parseWithSchema(productSchema, item, 'product');
      } catch {
        return null;
      }
    })
    .filter(Boolean) as Product[];
};

const normalizeAddressList = (data: unknown): Address[] => {
  const items = extractResults(data);
  return items
    .map((item: unknown) => {
      try {
        return parseWithSchema(addressSchema, item, 'address') as Address;
      } catch {
        return null;
      }
    })
    .filter(Boolean) as Address[];
};

export const fetchAddresses = async (): Promise<Address[]> => {
  try {
    const { data } = await api.get<Address[]>('/addresses/');
    return normalizeAddressList(data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load addresses'));
  }
};

export const createAddress = async (payload: AddressInput): Promise<Address> => {
  try {
    const { data } = await api.post<Address>('/addresses/', payload);
    return parseWithSchema(addressSchema, data, 'address') as Address;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create address'));
  }
};

export const updateAddress = async (
  id: string | number,
  payload: Partial<AddressInput>
): Promise<Address> => {
  try {
    const { data } = await api.patch<Address>(`/addresses/${id}/`, payload);
    return parseWithSchema(addressSchema, data, 'address') as Address;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update address'));
  }
};

export const deleteAddress = async (id: string | number): Promise<void> => {
  try {
    await api.delete(`/addresses/${id}/`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to delete address'));
  }
};

export const fetchProfile = async (): Promise<Profile> => {
  try {
    const { data } = await api.get<Profile>('/users/profile/');
    return parseWithSchema(profileSchema, data, 'profile') as Profile;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load profile'));
  }
};

export const updateProfile = async (profile: Profile): Promise<Profile> => {
  try {
    const { data } = await api.put<Profile>('/users/profile/', profile);
    return parseWithSchema(profileSchema, data, 'profile') as Profile;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update profile'));
  }
};

export const fetchOrders = async (): Promise<Order[]> => {
  try {
    const { data } = await api.get('/orders/');
    return normalizeOrderList(data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load orders'));
  }
};

export const fetchOrder = async (orderId: string | number): Promise<Order> => {
  try {
    const { data } = await api.get(`/orders/${orderId}/`);
    return parseWithSchema(orderSchema, data, 'order') as Order;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load order'));
  }
};

export const fetchProduct = async (productId: string | number): Promise<Product | null> => {
  try {
    const { data } = await api.get(`/products/${productId}/`);
    return parseWithSchema(productSchema, data, 'product');
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw new Error(getApiErrorMessage(error, `Failed to fetch product ${productId}.`));
  }
};

export const fetchProductsByCategory = async (
  category: string,
  excludeProductId?: string | number
): Promise<Product[]> => {
  try {
    const { data } = await api.get(`/products/?category=${encodeURIComponent(category)}`);
    const products = normalizeProductList(data);
    if (!excludeProductId) return products;
    return products.filter((p) => String(p._id) !== String(excludeProductId));
  } catch {
    return [];
  }
};

export const createOrder = async (
  payload: Record<string, unknown>,
  idempotencyKey?: string
): Promise<CreateOrderResponse> => {
  try {
    const { data } = await api.post<CreateOrderResponse>('/orders/', payload, {
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
    });
    return parseWithSchema(createOrderResponseSchema, data, 'order') as CreateOrderResponse;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Payment failed, please try again.'));
  }
};
