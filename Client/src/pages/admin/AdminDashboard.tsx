import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ShoppingBag,
  Users,
  BookOpen,
  DollarSign,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Package,
  GraduationCap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { api, ApiEnrollment, ApiOrder } from '../../lib/api';
import { useGlobal } from '../../context/GlobalContext';

const money = (value?: number) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`;

const AdminDashboard = () => {
  const { user } = useGlobal();
  const [stats, setStats] = useState<Record<string, number>>({});
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [enrollments, setEnrollments] = useState<ApiEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const [dashboardRes, ordersRes, enrollmentsRes] = await Promise.all([
          api.admin.dashboard(),
          api.admin.orders(),
          api.admin.enrollments(),
        ]);

        setStats(dashboardRes.stats);
        setOrders(ordersRes.orders.slice(0, 5));
        setEnrollments(enrollmentsRes.enrollments.slice(0, 5));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Dashboard load nahi ho paya.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const statCards = useMemo(
    () => [
      { label: 'Total Revenue', value: money(stats.totalRevenue), icon: DollarSign, color: 'text-green-400' },
      { label: 'Orders', value: String(stats.totalOrders || 0), icon: ShoppingBag, color: 'text-brand-gold' },
      { label: 'Enrollments', value: String(stats.totalEnrollments || 0), icon: GraduationCap, color: 'text-blue-400' },
      { label: 'Users', value: String(stats.totalUsers || 0), icon: Users, color: 'text-purple-400' },
      { label: 'Pending Orders', value: String(stats.pendingOrders || 0), icon: Clock, color: 'text-yellow-400' },
      { label: 'Pending Enrollments', value: String(stats.pendingEnrollments || 0), icon: AlertCircle, color: 'text-orange-400' },
      { label: 'Active Courses', value: String(stats.activeCourses || 0), icon: BookOpen, color: 'text-cyan-400' },
      { label: 'Products', value: String(stats.availableProducts || 0), icon: Package, color: 'text-pink-400' },
    ],
    [stats]
  );

  return (
    <AdminLayout>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Dashboard Overview</h1>
          <p className="text-brand-cream/40 mt-1">Welcome back, {user?.name || 'Admin'}</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="bg-brand-gold/10 text-brand-gold px-4 py-2 rounded-full border border-brand-gold/20 flex items-center gap-2">
            <Clock size={16} /> Live from server
          </span>
        </div>
      </header>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {(loading ? statCards.slice(0, 4) : statCards).map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-brand-gold/30 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-white/5 group-hover:scale-110 transition-transform ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
            <h3 className="text-brand-cream/60 text-sm font-medium mb-1">{stat.label}</h3>
            <p className="text-2xl font-bold text-white tracking-tight">{loading ? '...' : stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingBag size={20} className="text-brand-gold" /> Recent Orders
              </h2>
              <Link to="/admin/orders" className="text-brand-gold text-sm hover:underline flex items-center gap-1">
                View All <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-brand-cream/40 text-xs uppercase tracking-wider border-b border-white/5">
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-brand-gold">#{order.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-white">{order.customer_name}</td>
                      <td className="px-6 py-4 text-sm text-brand-cream/60">{order.product_name || 'Custom order'}</td>
                      <td className="px-6 py-4 text-sm font-bold">{money(Number(order.total_price || 0))}</td>
                      <td className="px-6 py-4 text-xs">
                        <span className="px-3 py-1 rounded-full flex items-center gap-1 w-fit bg-brand-gold/10 text-brand-gold">
                          {order.status === 'delivered' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!loading && orders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-brand-cream/40">No orders yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/admin/products" className="block w-full bg-brand-gold text-brand-dark py-3 rounded-xl font-bold hover:bg-brand-gold-muted transition-colors text-center">
                Manage Products
              </Link>
              <Link to="/admin/courses" className="block w-full border border-brand-gold text-brand-gold py-3 rounded-xl font-bold hover:bg-brand-gold/10 transition-colors text-center">
                Manage Courses
              </Link>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Recent Enrollments</h2>
            <div className="space-y-4">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex gap-4 rounded-xl bg-white/[0.03] p-3">
                  <div className="bg-blue-500/20 text-blue-400 p-2 rounded-lg h-fit">
                    <GraduationCap size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{enrollment.student_name}</p>
                    <p className="text-xs text-brand-cream/40">{enrollment.course_name || 'Course'} - {enrollment.status}</p>
                  </div>
                </div>
              ))}
              {!loading && enrollments.length === 0 && (
                <p className="text-sm text-brand-cream/40">No enrollments yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
