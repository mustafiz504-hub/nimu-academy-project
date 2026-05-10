import React, { useEffect, useState } from 'react';
import { AlertCircle, Save, User } from 'lucide-react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import Button from '../../components/ui/Button';
import { api } from '../../lib/api';
import { useGlobal } from '../../context/GlobalContext';

const ProfilePage = () => {
  const { user, setUser, authLoading } = useGlobal();
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFormData({ name: user.name || '', phone: user.phone || '' });
  }, [user]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const response = await api.user.updateProfile(formData);
      setUser(response.user);
      setNotice(response.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profile update nahi ho paya.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return <div className="min-h-screen bg-brand-cream pt-32 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-brand-cream text-brand-dark">
      <Nav />
      <main className="mx-auto max-w-3xl px-4 pt-32 pb-20">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold">My Profile</h1>
          <p className="mt-2 text-brand-brown">Update your profile through the server API.</p>
        </div>

        {!user ? (
          <div className="rounded-2xl border border-brand-gold/20 bg-white p-8 text-brand-brown">
            Please login to view your profile.
          </div>
        ) : (
          <form onSubmit={handleSave} className="rounded-3xl border border-brand-gold/20 bg-white p-8 shadow-sm space-y-6">
            {(error || notice) && (
              <div className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                <AlertCircle size={18} /> {error || notice}
              </div>
            )}

            <div className="rounded-2xl bg-brand-light p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-gold">Account</p>
              <p className="mt-2 text-lg font-bold">{user.email}</p>
              <p className="text-sm text-brand-brown">Role: {user.role}</p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-brand-brown">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gold" size={18} />
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-brand-gold/20 bg-white px-4 py-3 pl-10 outline-none focus:border-brand-gold"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-brand-brown">Phone</label>
              <input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl border border-brand-gold/20 bg-white px-4 py-3 outline-none focus:border-brand-gold"
              />
            </div>

            <Button type="submit" disabled={saving} className="w-full rounded-xl py-4">
              <Save size={18} className="mr-2" /> {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
