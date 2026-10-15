import React, { useEffect, useState } from 'react';
import { AlertCircle, Save, User, Trash2, Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import Button from '../../components/ui/Button';
import { api } from '../../lib/api';
import { useGlobal } from '../../context/GlobalContext';
import { AVATAR_LIST, DEFAULT_AVATAR } from '../../constants/avatars';

const ProfilePage = () => {
  const { user, setUser, authLoading } = useGlobal();
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [selectedAvatar, setSelectedAvatar] = useState<string>(DEFAULT_AVATAR);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFormData({ name: user.name || '', phone: user.phone || '' });
    setSelectedAvatar(user.avatar || DEFAULT_AVATAR);
  }, [user]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const response = await api.user.updateProfile({
        name: formData.name,
        phone: formData.phone,
        avatar: selectedAvatar,
      });
      setUser(response.user);
      setNotice(response.message || 'Profile updated successfully!');
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
          <h1 className="text-4xl font-serif font-bold text-brand-dark">My Profile</h1>
          <p className="mt-2 text-brand-brown">Manage your profile details and personal avatar.</p>
        </div>

        {!user ? (
          <div className="rounded-2xl border border-brand-gold/20 bg-white p-8 text-brand-brown">
            Please login to view your profile.
          </div>
        ) : (
          <form onSubmit={handleSave} className="rounded-3xl border border-brand-gold/20 bg-white p-8 shadow-sm space-y-8">
            {(error || notice) && (
              <div className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                <AlertCircle size={18} /> {error || notice}
              </div>
            )}

            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-gradient-to-br from-brand-light to-white border border-brand-gold/20">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-brand-gold shadow-lg bg-brand-light flex items-center justify-center">
                  <img
                    src={selectedAvatar}
                    alt="Current Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="absolute bottom-0 right-0 bg-brand-gold text-brand-dark p-2 rounded-full shadow-md hover:scale-110 active:scale-95 transition-transform"
                  title="Change Avatar"
                >
                  <Sparkles size={14} className="stroke-[2.5]" />
                </button>
              </div>

              <div className="text-center sm:text-left flex-1">
                <h3 className="font-bold text-lg text-brand-dark">{user.name || 'Member'}</h3>
                <p className="text-xs text-brand-brown/70 font-mono mt-0.5">{user.email}</p>
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-brand-gold uppercase tracking-wider hover:underline"
                >
                  <Sparkles size={13} /> {showAvatarPicker ? 'Hide Avatar Options' : 'Choose New Avatar'}
                </button>
              </div>
            </div>

            {/* Avatar Picker Gallery */}
            {showAvatarPicker && (
              <div className="p-6 rounded-2xl border border-brand-gold/30 bg-brand-light/60 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-brand-dark">Select Your Profile Avatar</h4>
                    <p className="text-xs text-brand-brown">Choose from 20 exclusive culinary avatars</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-gold/20 text-brand-dark">
                    20 Avatars
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                  {AVATAR_LIST.map((av) => {
                    const isSelected = selectedAvatar === av.url || selectedAvatar === av.localUrl;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setSelectedAvatar(av.url)}
                        className={`relative rounded-2xl p-2 transition-all group flex flex-col items-center ${
                          isSelected
                            ? 'bg-brand-gold/20 ring-2 ring-brand-gold shadow-md scale-105'
                            : 'bg-white hover:bg-brand-gold/10 hover:scale-105 border border-brand-gold/15'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-white/80 flex items-center justify-center">
                          <img
                            src={av.localUrl}
                            alt={av.name}
                            loading="lazy"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to R2 URL if local is unreachable
                              (e.target as HTMLImageElement).src = av.url;
                            }}
                          />
                        </div>
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-gold text-brand-dark flex items-center justify-center shadow">
                            <Check size={12} className="stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="rounded-2xl bg-brand-light p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-gold">Account Role</p>
              <p className="mt-1 text-sm text-brand-brown capitalize font-medium">Role: {user.role}</p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-brand-brown">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gold" size={18} />
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-brand-gold/20 bg-white px-4 py-3 pl-10 outline-none focus:border-brand-gold font-medium"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-brand-brown">Phone Number</label>
              <input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +91 9876543210"
                className="w-full rounded-xl border border-brand-gold/20 bg-white px-4 py-3 outline-none focus:border-brand-gold font-medium"
              />
            </div>

            <Button type="submit" disabled={saving} className="w-full rounded-xl py-4 font-bold text-sm">
              <Save size={18} className="mr-2" /> {saving ? 'Saving Profile...' : 'Save Profile Changes'}
            </Button>

            <div className="pt-4 border-t border-red-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Trash2 size={14} /> Danger Zone
                </p>
                <p className="text-xs text-brand-brown/70 mt-0.5">Permanently delete account and all data</p>
              </div>
              <Link
                to="/delete-account"
                className="px-3.5 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                Delete Account
              </Link>
            </div>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
