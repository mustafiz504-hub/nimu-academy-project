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
  CheckCircle2
} from 'lucide-react';
import { api, ApiUser as User } from '../../lib/api';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      const data = await api.admin.users();
      setUsers(data.users);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch users.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  );

  return (
    <AdminLayout>
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-gold flex items-center gap-3">
            <Users className="text-brand-gold" /> User Management
          </h1>
          <p className="text-brand-cream/60 mt-1 text-sm font-medium">Control administrative access and view registered users.</p>
        </div>

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
      </header>

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
      ) : (
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/5">
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em] text-brand-gold">Full Name</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em] text-brand-gold">Contact Details</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em] text-brand-gold">Role Status</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em] text-brand-gold">Registration</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em] text-brand-gold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold font-bold border border-brand-gold/20 group-hover:scale-110 transition-transform">
                          {user.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-brand-gold transition-colors">{user.name}</p>
                          <p className="text-[10px] text-brand-cream/30 uppercase tracking-widest font-black">ID: #{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-brand-cream/60 text-sm font-medium">
                          <Mail size={14} className="text-brand-gold/40" /> {user.email}
                        </div>
                        <div className="flex items-center gap-2 text-brand-cream/60 text-sm font-medium">
                          <Phone size={14} className="text-brand-gold/40" /> {user.phone || 'N/A'}
                        </div>
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
                        <Calendar size={14} /> {new Date(user.created_at).toLocaleDateString()}
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
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
