'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Address {
  id?: number | string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default_shipping?: boolean;
  is_default_billing?: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState<Address>({ line1: '', city: '', state: '', postal_code: '', country: 'US', is_default_billing: false, is_default_shipping: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Address[]>('/addresses/');
      setAddresses(data);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to load addresses');
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
        addresses.forEach(async (a) => {
          if (a.is_default_billing) await api.patch(`/addresses/${a.id}/`, { is_default_billing: false });
        });
      }
      if (form.is_default_shipping) {
        addresses.forEach(async (a) => {
          if (a.is_default_shipping) await api.patch(`/addresses/${a.id}/`, { is_default_shipping: false });
        });
      }
      await api.post('/addresses/', form);
      setForm({ line1: '', city: '', state: '', postal_code: '', country: 'US', is_default_billing: false, is_default_shipping: false });
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to create address');
    }
  };

  const remove = async (id: string | number) => {
    try {
      await api.delete(`/addresses/${id}/`);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to delete address');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Addresses</h1>
      {loading ? (
        <div>Loading…</div>
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
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form onSubmit={create} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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