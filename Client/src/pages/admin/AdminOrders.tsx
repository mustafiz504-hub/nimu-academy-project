import React from 'react';
import { ShoppingBag, Search, Filter, MoreVertical, Eye } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminOrders = () => {
  const orders = [
    { id: '#ORD-7241', customer: 'Rahul Sharma', product: 'Chocolate Truffle Cake', amount: '₹1,200', status: 'Pending', date: 'May 10, 2026' },
    { id: '#ORD-7240', customer: 'Priya Patel', product: 'Vanilla Sponge Course', amount: '₹4,500', status: 'Confirmed', date: 'May 10, 2026' },
    { id: '#ORD-7239', customer: 'Amit Kumar', product: 'Red Velvet Special', amount: '₹1,500', status: 'Delivered', date: 'May 09, 2026' },
    { id: '#ORD-7238', customer: 'Sneha Rao', product: 'Pineapple Cake', amount: '₹800', status: 'Cancelled', date: 'May 09, 2026' },
  ];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-serif font-bold text-white">Order Management</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-cream/40" size={18} />
            <input 
              type="text" 
              placeholder="Search orders..." 
              className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:border-brand-gold/50 outline-none text-sm"
            />
          </div>
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm hover:bg-white/10 transition-colors">
            <Filter size={18} /> Filter
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-brand-cream/40 text-xs uppercase tracking-wider border-b border-white/5">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-sm font-mono text-brand-gold">{order.id}</td>
                <td className="px-6 py-4 text-sm font-medium text-white">{order.customer}</td>
                <td className="px-6 py-4 text-sm text-brand-cream/60">{order.product}</td>
                <td className="px-6 py-4 text-sm font-bold">{order.amount}</td>
                <td className="px-6 py-4 text-sm text-brand-cream/40">{order.date}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    order.status === 'Delivered' ? 'bg-green-500/10 text-green-400' :
                    order.status === 'Confirmed' ? 'bg-blue-500/10 text-blue-400' :
                    order.status === 'Cancelled' ? 'bg-red-500/10 text-red-400' :
                    'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 hover:bg-brand-gold/10 text-brand-gold rounded-lg transition-colors">
                      <Eye size={18} />
                    </button>
                    <button className="p-2 hover:bg-white/10 text-brand-cream/60 rounded-lg transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
