import React, { useEffect, useMemo, useState } from 'react';
import { Search, Filter, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { api, ApiOrder } from '../../lib/api';

const statuses = ['pending', 'confirmed', 'delivered', 'cancelled'];

const statusClass = (status: string) => {
  if (status === 'delivered') return 'bg-green-500/10 text-green-400';
  if (status === 'confirmed') return 'bg-blue-500/10 text-blue-400';
  if (status === 'cancelled') return 'bg-red-500/10 text-red-400';
  return 'bg-yellow-500/10 text-yellow-400';
};

const formatDate = (date?: string) => (date ? new Date(date).toLocaleDateString('en-IN') : '-');
const money = (value?: string | number | null) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`;

const AdminOrders = () => {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.admin.orders();
      setOrders(response.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Orders load nahi ho paye.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return orders.filter((order) =>
      [order.customer_name, order.product_name, order.phone, String(order.id), order.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [orders, searchQuery]);

  const updateStatus = async (id: number, status: string) => {
    setSavingId(id);
    setError('');
    try {
      const response = await api.admin.updateOrderStatus(id, status);
      setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status: response.order.status } : order)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Status update nahi ho paya.');
    } finally {
      setSavingId(null);
    }
  };

  const deleteOrder = async (id: number) => {
    if (!window.confirm('Delete this order?')) return;
    setSavingId(id);
    setError('');
    try {
      await api.orders.delete(id);
      setOrders((prev) => prev.filter((order) => order.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order delete nahi ho paya.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-10">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Order Management</h1>
          <p className="text-brand-cream/40 mt-1">Live orders from server</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-cream/40" size={18} />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:border-brand-gold/50 outline-none text-sm"
            />
          </div>
          <button onClick={loadOrders} className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm hover:bg-white/10 transition-colors">
            <RefreshCw size={18} /> Refresh
          </button>
          <button className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm text-brand-cream/70">
            <Filter size={18} /> {filteredOrders.length}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-red-200">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-brand-cream/40 text-xs uppercase tracking-wider border-b border-white/5">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Delivery</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-brand-gold">#{order.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-white">
                    <div>{order.customer_name}</div>
                    <div className="text-xs text-brand-cream/35">{order.address}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-brand-cream/60">
                    <div>{order.product_name || 'Custom order'}</div>
                    <div className="text-xs text-brand-cream/35">{order.flavor || '-'} {order.size || ''}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-brand-cream/60">{order.phone}</td>
                  <td className="px-6 py-4 text-sm font-bold">{money(order.total_price)}</td>
                  <td className="px-6 py-4 text-sm text-brand-cream/40">{formatDate(order.delivery_date)}</td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      disabled={savingId === order.id}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className={`rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider outline-none ${statusClass(order.status)} bg-brand-dark`}
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => deleteOrder(order.id)}
                      disabled={savingId === order.id}
                      className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                      aria-label="Delete order"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-brand-cream/40">No orders found.</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-brand-cream/40">Loading orders...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
