'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Profile {
  email: string;
  first_name?: string;
  last_name?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get<Profile>('/users/profile/');
        setProfile(data);
      } catch (e: any) {
        setError(e?.response?.data?.detail || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setError(null);
    setSuccess(null);
    try {
      await api.put('/users/profile/', profile);
      setSuccess('Profile updated');
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to update profile');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!profile) return <div className="p-4">No profile</div>;

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm">Email</label>
          <input value={profile.email} disabled className="border rounded p-2 w-full bg-gray-100" />
        </div>
        <div>
          <label className="block text-sm">First Name</label>
          <input value={profile.first_name || ''} onChange={(e) => setProfile({ ...profile, first_name: e.target.value })} className="border rounded p-2 w-full" />
        </div>
        <div>
          <label className="block text-sm">Last Name</label>
          <input value={profile.last_name || ''} onChange={(e) => setProfile({ ...profile, last_name: e.target.value })} className="border rounded p-2 w-full" />
        </div>
        {success && <div className="text-green-600">{success}</div>}
        {error && <div className="text-red-600">{error}</div>}
        <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">Save</button>
      </form>
    </div>
  );
}