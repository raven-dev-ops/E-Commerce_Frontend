'use client';

import { useEffect, useState } from 'react';
import {
  createAddress,
  deleteAddress,
  fetchAddresses,
  updateAddress,
  type Address,
  type AddressInput,
} from '@/lib/apiClient';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState<AddressInput>({
    line1: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
    is_default_billing: false,
    is_default_shipping: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const errorId = 'addresses-form-error';
  const describedBy = error ? errorId : undefined;

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAddresses();
      setAddresses(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (form.is_default_billing) {
        await Promise.all(addresses.map((a) => (
          a.is_default_billing && a.id != null
            ? updateAddress(a.id, { is_default_billing: false })
            : Promise.resolve()
        ))
        );
      }
      if (form.is_default_shipping) {
        await Promise.all(addresses.map((a) => (
          a.is_default_shipping && a.id != null
            ? updateAddress(a.id, { is_default_shipping: false })
            : Promise.resolve()
        ))
        );
      }
      await createAddress(form);
      setForm({
        line1: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'US',
        is_default_billing: false,
        is_default_shipping: false,
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const remove = async (id: string | number) => {
    try {
      await deleteAddress(id);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Addresses</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul className="space-y-2 mb-6">
          {addresses.map((a) => (
            <li key={String(a.id)} className="border rounded p-3 flex justify-between items-center">
              <div>
                <div>{a.line1}{a.line2 ? `, ${a.line2}` : ''}</div>
                <div className="text-sm text-gray-600">{a.city}, {a.state} {a.postal_code}, {a.country}</div>
                <div className="text-xs text-gray-500">
                  {a.is_default_shipping ? 'Default Shipping' : ''} {a.is_default_billing ? 'Default Billing' : ''}
                </div>
              </div>
              <button onClick={() => remove(a.id!)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-xl font-semibold mb-2">Add New Address</h2>
      {error && (
        <div id={errorId} role="alert" aria-live="assertive" className="text-red-600 mb-2">
          {error}
        </div>
      )}
      <form
        onSubmit={create}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        aria-describedby={describedBy}
      >
        <input className="border p-2 rounded" placeholder="Line 1" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} required />
        <input className="border p-2 rounded" placeholder="Line 2 (optional)" value={form.line2 || ''} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
        <input className="border p-2 rounded" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
        <input className="border p-2 rounded" placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
        <input className="border p-2 rounded" placeholder="Postal Code" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} required />
        <input className="border p-2 rounded" placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required />
        <label className="flex items-center gap-2 col-span-1 sm:col-span-2">
          <input type="checkbox" checked={!!form.is_default_shipping} onChange={(e) => setForm({ ...form, is_default_shipping: e.target.checked })} /> Default Shipping
        </label>
        <label className="flex items-center gap-2 col-span-1 sm:col-span-2">
          <input type="checkbox" checked={!!form.is_default_billing} onChange={(e) => setForm({ ...form, is_default_billing: e.target.checked })} /> Default Billing
        </label>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded col-span-1 sm:col-span-2">Save Address</button>
      </form>
    </div>
  );
}
