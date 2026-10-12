import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  UserMinus, 
  UserPlus, 
  Mail, 
  Phone, 
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Trash2,
  Clock,
  Check
} from 'lucide-react';
import { api, ApiUser as User } from '../../lib/api';
import AdminLayout from '../../components/admin/AdminLayout';

interface DeletionRequest {
  id: number;
  name?: string | null;
  email: string;
  phone?: string | null;
  reason?: string | null;
  status: 'pending' | 'completed' | string;
  created_at: string;
  user_id?: number | null;
  user_name?: string | null;
}

const AdminUsers = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'deletions'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<DeletionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      const data = await api.admin.users();
      setUsers(data.users);
    } catch (err: any) {
      setError('Failed to fetch users.');
    }
  };

  const fetchDeletionRequests = async () => {
    try {
      const data = await api.admin.deletionRequests();
      setDeletionRequests(data.requests || []);
    } catch (err: any) {
      console.warn('Could not load deletion requests:', err?.message);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchDeletionRequests()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleToggleAdmin = async (userId: number, currentRole: string) => {
    try {
      if (currentRole === 'admin') {
        await api.admin.removeAdmin(userId);
      } else {
        await api.admin.makeAdmin(userId);
      }
      setSuccess(`User role updated successfully!`);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update user role.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleProcessDeletion = async (requestId: number) => {
    if (!confirm('Are you sure you want to delete this user and all associated data permanently?')) {
      return;
    }
    setProcessingId(requestId);
    try {
      const res = await api.admin.processDeletionRequest(requestId);
      setSuccess(res.message || 'User deleted and request completed.');
      await Promise.all([fetchUsers(), fetchDeletionRequests()]);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to process deletion request.');
      setTimeout(() => setError(''), 4000);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  );

  const pendingRequestsCount = deletionRequests.filter(r => r.status === 'pending').length;

  return (
    <AdminLayout>
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-gold flex items-center gap-3">
            <Users className="text-brand-gold" /> User Management
          </h1>
          <p className="text-brand-cream/60 mt-1 text-sm font-medium">
            Control administrative access, view registered users, and process account deletion requests.
          </p>
        </div>

        {activeTab === 'users' && (
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/40 group-focus-within:text-brand-gold transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-gold/50 transition-all text-sm font-medium"
            />
          </div>
        )}
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-brand-gold text-brand-dark shadow-lg shadow-brand-gold/20'
              : 'bg-white/5 text-brand-cream/60 hover:bg-white/10'
          }`}
        >
          <Users size={16} /> All Registered Users ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('deletions')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'deletions'
              ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
              : 'bg-white/5 text-brand-cream/60 hover:bg-white/10'
          }`}
        >
          <Trash2 size={16} /> Deletion Requests ({deletionRequests.length})
          {pendingRequestsCount > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-red-500 text-white font-extrabold animate-pulse">
              {pendingRequestsCount} Pending
            </span>
          )}
        </button>
      </div>

      {success && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 flex items-center gap-3 text-sm font-bold shadow-xl">
          <CheckCircle2 size={18} /> {success}
        </motion.div>
      )}

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 flex items-center gap-3 text-sm font-bold shadow-xl">
          <AlertCircle size={18} /> {error}
        </motion.div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-brand-gold gap-4">
          <Loader2 className="animate-spin" size={40} />
          <p className="font-bold tracking-widest text-xs uppercase animate-pulse">Initializing user data...</p>
        </div>
      ) : activeTab === 'users' ? (
        /* ═════ TAB 1: USERS LIST ═════ */
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/5">
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em] text-brand-gold">Full Name</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em] text-brand-gold">Contact Details</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em] text-brand-gold">Role</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em] text-brand-gold">Joined Date</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em] text-brand-gold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center font-bold text-brand-gold">
                          {user.name ? user.name[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-white text-base tracking-wide">{user.name || 'Anonymous User'}</p>
                          <span className="text-[10px] font-bold tracking-widest text-brand-gold/60 uppercase">ID: #{user.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-brand-cream/80 text-sm">
                          <Mail size={14} className="text-brand-gold/40" /> {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-brand-cream/50 text-xs">
                            <Phone size={14} className="text-brand-gold/40" /> {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        user.role === 'admin' 
                          ? 'bg-brand-gold/15 text-brand-gold border border-brand-gold/20' 
                          : 'bg-white/5 text-brand-cream/40 border border-white/5'
                      }`}>
                        {user.role === 'admin' ? <ShieldCheck size={12} /> : null}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2 text-brand-cream/40 text-xs font-bold">
                        <Calendar size={14} /> {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <button
                        onClick={() => handleToggleAdmin(user.id, user.role)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${
                          user.role === 'admin'
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                            : 'bg-brand-gold text-brand-dark hover:bg-brand-gold-muted shadow-lg shadow-brand-gold/10'
                        }`}
                      >
                        {user.role === 'admin' ? (
                          <><UserMinus size={14} /> Revoke Admin</>
                        ) : (
                          <><UserPlus size={14} /> Make Admin</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="py-20 text-center">
              <Users size={48} className="mx-auto text-brand-gold/20 mb-4" />
              <p className="text-brand-cream/40 font-bold tracking-widest text-xs uppercase">No matching users found</p>
            </div>
          )}
        </div>
      ) : (
        /* ═════ TAB 2: ACCOUNT DELETION REQUESTS ═════ */
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
          <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-brand-cream flex items-center gap-2">
                <Trash2 className="text-red-400" size={20} /> Account Deletion Requests
              </h3>
              <p className="text-xs text-brand-cream/50 mt-1">
                These requests are submitted via the Google Play compliance link. Process requests within 30 days.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/5">
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em] text-brand-gold">Requester Email</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em] text-brand-gold">Full Name & Phone</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em] text-brand-gold">Reason</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em] text-brand-gold">Requested At</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em] text-brand-gold">Status</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em] text-brand-gold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {deletionRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-6">
                      <div className="font-bold text-white text-sm">{req.email}</div>
                      {req.user_id ? (
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                          Active Account (ID: #{req.user_id})
                        </span>
                      ) : (
                        <span className="text-[10px] text-brand-cream/40 font-bold uppercase tracking-wider">
                          No Active Account Found
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-6 text-sm text-brand-cream/80">
                      <div>{req.name || '—'}</div>
                      <div className="text-xs text-brand-cream/50">{req.phone || '—'}</div>
                    </td>
                    <td className="px-6 py-6 text-xs text-brand-cream/60 max-w-xs">
                      {req.reason || 'No reason specified'}
                    </td>
                    <td className="px-6 py-6 text-xs text-brand-cream/50">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} /> {new Date(req.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        req.status === 'completed'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/15 text-red-400 border border-red-500/20 animate-pulse'
                      }`}>
                        {req.status === 'completed' ? <Check size={12} /> : <Clock size={12} />}
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      {req.status !== 'completed' ? (
                        <button
                          disabled={processingId === req.id}
                          onClick={() => handleProcessDeletion(req.id)}
                          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg shadow-red-950/40 inline-flex items-center gap-1.5"
                        >
                          <Trash2 size={14} />
                          {processingId === req.id ? 'Deleting...' : 'Delete User & Complete'}
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-400 font-bold">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {deletionRequests.length === 0 && (
            <div className="py-20 text-center">
              <CheckCircle2 size={48} className="mx-auto text-emerald-400/30 mb-4" />
              <p className="text-brand-cream/40 font-bold tracking-widest text-xs uppercase">No deletion requests yet</p>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
