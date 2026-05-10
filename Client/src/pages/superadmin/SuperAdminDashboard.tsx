import React, { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Activity, AlertCircle, ShieldCheck, Trash2, UserMinus, UserPlus, Users } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { ActivityLog, api, ApiUser } from '../../lib/api';
import { useGlobal } from '../../context/GlobalContext';

const statLabels: Record<string, string> = {
  totalOrders: 'Orders',
  totalEnrollments: 'Enrollments',
  totalUsers: 'Users',
  totalAdmins: 'Admins',
  totalRevenue: 'Revenue',
  pendingOrders: 'Pending Orders',
  pendingEnrollments: 'Pending Enrollments',
  activeCourses: 'Active Courses',
  availableProducts: 'Products',
};

const SuperAdminDashboard = () => {
  const { user } = useGlobal();
  const [stats, setStats] = useState<Record<string, number>>({});
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [admins, setAdmins] = useState<ApiUser[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const statCards = useMemo(
    () =>
      Object.entries(stats).map(([key, value]) => ({
        key,
        label: statLabels[key] || key,
        value: key === 'totalRevenue' ? `Rs ${Number(value || 0).toLocaleString('en-IN')}` : String(value || 0),
      })),
    [stats]
  );

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashboardRes, usersRes, adminsRes, logsRes] = await Promise.all([
        api.superadmin.dashboard(),
        api.superadmin.users(),
        api.superadmin.admins(),
        api.superadmin.activityLogs(),
      ]);
      setStats(dashboardRes.stats);
      setUsers(usersRes.users);
      setAdmins(adminsRes.admins);
      setLogs(logsRes.logs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Superadmin data load nahi ho paya.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (user?.role !== 'superadmin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const promoteUser = async (id: number) => {
    setBusyId(id);
    setError('');
    try {
      await api.superadmin.makeAdmin(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Admin promote nahi ho paya.');
    } finally {
      setBusyId(null);
    }
  };

  const demoteAdmin = async (id: number) => {
    setBusyId(id);
    setError('');
    try {
      await api.superadmin.removeAdmin(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Admin demote nahi ho paya.');
    } finally {
      setBusyId(null);
    }
  };

  const deleteUser = async (id: number) => {
    if (!window.confirm('Delete this user and related data?')) return;
    setBusyId(id);
    setError('');
    try {
      await api.superadmin.deleteUser(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'User delete nahi ho paya.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-10">
        <h1 className="flex items-center gap-3 text-3xl font-serif font-bold text-white">
          <ShieldCheck className="text-brand-gold" /> Superadmin Dashboard
        </h1>
        <p className="mt-1 text-brand-cream/40">Platform users, admins and activity logs</p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-red-200">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-3 xl:grid-cols-5">
        {(loading ? Array.from({ length: 5 }, (_, index) => ({ key: String(index), label: 'Loading', value: '...' })) : statCards).map((stat) => (
          <div key={stat.key} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-widest text-brand-cream/40">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/5">
          <div className="border-b border-white/10 p-5">
            <h2 className="flex items-center gap-2 text-xl font-bold text-white">
              <Users size={20} className="text-brand-gold" /> Users
            </h2>
          </div>
          <div className="max-h-[520px] overflow-y-auto">
            {users.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 border-b border-white/5 p-5 last:border-0">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{item.name}</p>
                  <p className="truncate text-sm text-brand-cream/45">{item.email} - {item.role}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {item.role === 'user' && (
                    <button
                      onClick={() => promoteUser(item.id)}
                      disabled={busyId === item.id}
                      className="rounded-lg bg-brand-gold/10 p-2 text-brand-gold hover:bg-brand-gold hover:text-brand-dark disabled:opacity-50"
                      aria-label="Make admin"
                    >
                      <UserPlus size={18} />
                    </button>
                  )}
                  {item.role !== 'superadmin' && (
                    <button
                      onClick={() => deleteUser(item.id)}
                      disabled={busyId === item.id}
                      className="rounded-lg bg-red-500/10 p-2 text-red-400 hover:bg-red-500 hover:text-white disabled:opacity-50"
                      aria-label="Delete user"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5">
          <div className="border-b border-white/10 p-5">
            <h2 className="flex items-center gap-2 text-xl font-bold text-white">
              <ShieldCheck size={20} className="text-brand-gold" /> Admins
            </h2>
          </div>
          <div className="max-h-[240px] overflow-y-auto border-b border-white/10">
            {admins.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 border-b border-white/5 p-5 last:border-0">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{item.name}</p>
                  <p className="truncate text-sm text-brand-cream/45">{item.email}</p>
                </div>
                <button
                  onClick={() => demoteAdmin(item.id)}
                  disabled={busyId === item.id}
                  className="rounded-lg bg-red-500/10 p-2 text-red-400 hover:bg-red-500 hover:text-white disabled:opacity-50"
                  aria-label="Remove admin"
                >
                  <UserMinus size={18} />
                </button>
              </div>
            ))}
            {!loading && admins.length === 0 && <p className="p-5 text-brand-cream/40">No admins yet.</p>}
          </div>

          <div className="p-5">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
              <Activity size={18} className="text-brand-gold" /> Activity Logs
            </h3>
            <div className="max-h-[250px] space-y-3 overflow-y-auto pr-1">
              {logs.slice(0, 20).map((log) => (
                <div key={log.id} className="rounded-xl bg-white/[0.04] p-3">
                  <p className="text-sm text-white">{log.action}</p>
                  <p className="mt-1 text-xs text-brand-cream/35">
                    {log.user_name || 'System'} - {log.created_at ? new Date(log.created_at).toLocaleString('en-IN') : ''}
                  </p>
                </div>
              ))}
              {!loading && logs.length === 0 && <p className="text-brand-cream/40">No logs yet.</p>}
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default SuperAdminDashboard;
