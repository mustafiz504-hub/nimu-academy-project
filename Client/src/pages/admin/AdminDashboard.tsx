import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  BookOpen, 
  DollarSign, 
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Package
} from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';

import AdminLayout from '../../components/admin/AdminLayout';

const AdminDashboard = () => {
  // ... (stats and recentOrders remain same)
  const stats = [
    { label: 'Total Revenue', value: '₹1,24,500', icon: DollarSign, trend: '+12.5%', color: 'text-green-400' },
    { label: 'Active Orders', value: '45', icon: ShoppingBag, trend: '+5.2%', color: 'text-brand-gold' },
    { label: 'Total Products', value: '28', icon: Package, trend: '+3', color: 'text-blue-400' },
    { label: 'Active Courses', value: '8', icon: BookOpen, trend: '+1', color: 'text-purple-400' },
  ];

  const recentOrders = [
    { id: '#ORD-7241', customer: 'Rahul Sharma', product: 'Chocolate Truffle Cake', amount: '₹1,200', status: 'Pending', time: '2 mins ago' },
    { id: '#ORD-7240', customer: 'Priya Patel', product: 'Vanilla Sponge Course', amount: '₹4,500', status: 'Confirmed', time: '15 mins ago' },
    { id: '#ORD-7239', customer: 'Amit Kumar', product: 'Red Velvet Special', amount: '₹1,500', status: 'Delivered', time: '1 hour ago' },
  ];

  return (
    <AdminLayout>
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Dashboard Overview</h1>
          <p className="text-brand-cream/40 mt-1">Welcome back, Admin Muskan</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="bg-brand-gold/10 text-brand-gold px-4 py-2 rounded-full border border-brand-gold/20 flex items-center gap-2">
            <Clock size={16} /> Last updated: Just now
          </span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-brand-gold/30 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-white/5 group-hover:scale-110 transition-transform ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className="text-green-400 text-xs font-bold flex items-center gap-1">
                <TrendingUp size={14} /> {stat.trend}
              </span>
            </div>
            <h3 className="text-brand-cream/60 text-sm font-medium mb-1">{stat.label}</h3>
            <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingBag size={20} className="text-brand-gold" /> Recent Orders
              </h2>
              <button className="text-brand-gold text-sm hover:underline flex items-center gap-1">
                View All <ArrowUpRight size={14} />
              </button>
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
                    <th className="px-6 py-4">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 text-sm font-mono text-brand-gold">{order.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-white">{order.customer}</td>
                      <td className="px-6 py-4 text-sm text-brand-cream/60">{order.product}</td>
                      <td className="px-6 py-4 text-sm font-bold">{order.amount}</td>
                      <td className="px-6 py-4 text-xs">
                        <span className={`px-3 py-1 rounded-full flex items-center gap-1 w-fit ${
                          order.status === 'Delivered' ? 'bg-green-500/10 text-green-400' :
                          order.status === 'Confirmed' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          {order.status === 'Delivered' ? <CheckCircle2 size={12} /> : 
                           order.status === 'Pending' ? <AlertCircle size={12} /> : <Clock size={12} />}
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-brand-cream/40">{order.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Activity Sidebar */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full bg-brand-gold text-brand-dark py-3 rounded-xl font-bold hover:bg-brand-gold-muted transition-colors">
                Add New Product
              </button>
              <button className="w-full border border-brand-gold text-brand-gold py-3 rounded-xl font-bold hover:bg-brand-gold/10 transition-colors">
                Add New Course
              </button>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Recent Alerts</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="bg-red-500/20 text-red-400 p-2 rounded-lg h-fit">
                  <AlertCircle size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Low Stock: Chocolate Mix</p>
                  <p className="text-xs text-brand-cream/40">Only 2kg remaining in store</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-blue-500/20 text-blue-400 p-2 rounded-lg h-fit">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Course Batch Filled</p>
                  <p className="text-xs text-brand-cream/40">Weekend baking batch is now full</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
