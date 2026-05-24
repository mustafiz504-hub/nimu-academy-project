import React, { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { api, ApiOrder } from '../../lib/api';
import { useGlobal } from '../../context/GlobalContext';

const money = (value?: string | number | null) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const formatDate = (date?: string) => (date ? new Date(date).toLocaleDateString('en-IN') : '-');

const UserOrdersPage = () => {
  const { user, authLoading } = useGlobal();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const loadOrders = async () => {
      setLoading(true);
      try {
        const response = await api.user.orders();
        setOrders(response.orders);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Orders load nahi ho paye.');
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [user]);

  if (authLoading) return <div className="min-h-screen bg-brand-cream pt-32 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-brand-cream text-brand-dark">
      <Nav />
      <main className="mx-auto max-w-5xl px-4 pt-32 pb-20">
        <h1 className="text-4xl font-serif font-bold">My Orders</h1>
        <p className="mt-2 text-brand-brown">Orders linked to your account.</p>

        {!user ? (
          <div className="mt-8 rounded-2xl bg-white p-8 text-brand-brown">Please login to view your orders.</div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-3xl border border-brand-gold/20 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-brand-light text-xs uppercase tracking-widest text-brand-brown">
                  <tr>
                    <th className="px-6 py-4">Order</th>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Delivery</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-gold/10">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 font-mono text-brand-gold">#{order.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 font-semibold">
                          <ShoppingBag size={16} /> {order.product_name || 'Custom order'}
                        </div>
                        <p className="text-sm text-brand-brown/70">{order.flavor || '-'} {order.size || ''}</p>
                      </td>
                      <td className="px-6 py-4 text-brand-brown">{formatDate(order.delivery_date)}</td>
                      <td className="px-6 py-4 font-bold">{money(order.total_price)}</td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-brand-gold/10 px-3 py-1 text-xs font-bold uppercase text-brand-gold">{order.status}</span>
                      </td>
                    </tr>
                  ))}
                  {!loading && orders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-brand-brown/60">No orders yet.</td>
                    </tr>
                  )}
                  {loading && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-brand-brown/60">Loading orders...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {error && <div className="border-t border-brand-gold/10 px-6 py-4 text-red-700">{error}</div>}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default UserOrdersPage;
