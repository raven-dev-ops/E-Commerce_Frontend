'use client';

import { useEffect, useState } from 'react';
import { fetchProfile, updateProfile, type Profile } from '@/lib/apiClient';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const errorId = 'profile-form-error';
  const successId = 'profile-form-success';
  const describedBy = [error ? errorId : null, success ? successId : null]
    .filter(Boolean)
    .join(' ') || undefined;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchProfile();
        setProfile(data);
      } catch (e) {
        setError((e as Error).message);
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
      const updated = await updateProfile(profile);
      setProfile(updated);
      setSuccess('Profile updated');
    } catch (e) {
      setError((e as Error).message);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!profile) return <div className="p-4">No profile</div>;

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <form onSubmit={onSubmit} className="space-y-3" aria-describedby={describedBy}>
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
        {success && (
          <div id={successId} role="status" aria-live="polite" className="text-green-600">
            {success}
          </div>
        )}
        {error && (
          <div id={errorId} role="alert" aria-live="assertive" className="text-red-600">
            {error}
          </div>
        )}
        <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">Save</button>
      </form>
    </div>
  );
}
