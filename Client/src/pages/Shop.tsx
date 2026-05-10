import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Clock, MapPin, Phone, CheckCircle2, AlertCircle } from 'lucide-react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import SectionHeading from '../components/ui/SectionHeading';
import Modal from '../components/ui/Modal';
import { api, ApiProduct } from '../lib/api';
import { useGlobal } from '../context/GlobalContext';

const productImages = [
  'https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&q=80&w=600',
  'https://images.pexels.com/photos/1031200/pexels-photo-1031200.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1549590143-d5855148a9d5?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1535254973040-607b474cb843?auto=format&fit=crop&q=80&w=600',
];

const optionMap: Record<string, string[]> = {
  cake: ['Flavor', 'Size', 'Message'],
  cupcakes: ['Flavor', 'Frosting'],
  pastries: ['Assorted', 'Single flavor'],
};

const mapProduct = (product: ApiProduct, index: number) => {
  const category = product.category || 'Bakery';
  const lowerCategory = category.toLowerCase();

  return {
    ...product,
    category,
    image: productImages[index % productImages.length],
    priceLabel: `Starting Rs ${Number(product.price || 0).toLocaleString('en-IN')}`,
    options: optionMap[lowerCategory] || ['Freshly baked', 'Customizable'],
  };
};

const Shop = () => {
  const { user } = useGlobal();
  const [products, setProducts] = useState<ReturnType<typeof mapProduct>[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<ReturnType<typeof mapProduct> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    flavor: 'Chocolate',
    size: '500g',
    message: '',
    date: '',
    instructions: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadProducts = async () => {
      setLoading(true);
      try {
        const response = await api.products.list();
        setProducts(response.products.map(mapProduct));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Products load nahi ho paye.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    if (!user) return;
    setFormData((prev) => ({
      ...prev,
      name: prev.name || user.name || '',
      phone: prev.phone || user.phone || '',
    }));
  }, [user]);

  const minimumDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  const handleOrderClick = (product: ReturnType<typeof mapProduct>) => {
    setSelectedProduct(product);
    setError('');
    setIsSuccess(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('Order place karne ke liye pehle login karein.');
      return;
    }

    if (!selectedProduct) return;

    setSubmitting(true);
    setError('');

    try {
      await api.orders.create({
        product_id: selectedProduct.id,
        customer_name: formData.name,
        phone: formData.phone,
        address: formData.address,
        flavor: formData.flavor,
        size: formData.size,
        custom_message: formData.message,
        delivery_date: formData.date,
        special_instructions: formData.instructions,
        total_price: Number(selectedProduct.price || 0),
      });

      setIsSuccess(true);
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: '',
        flavor: 'Chocolate',
        size: '500g',
        message: '',
        date: '',
        instructions: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order submit nahi ho paya.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream font-sans text-brand-dark">
      <Nav />

      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Our Cake Shop"
            subtitle="Order fresh, handcrafted cakes & pastries delivered to your doorstep."
          />

          <div className="bg-brand-dark text-brand-gold rounded-3xl p-6 md:p-8 mb-16 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-brand-gold/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-gold/20 flex items-center justify-center">
                <Clock className="text-brand-gold" />
              </div>
              <div>
                <p className="font-semibold text-lg">Next Day Delivery</p>
                <p className="text-brand-cream/60 text-sm italic">Orders placed before 5 PM will be delivered next day</p>
              </div>
            </div>
            <div className="h-px w-full md:w-px md:h-12 bg-brand-gold/20" />
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-gold/20 flex items-center justify-center">
                <Phone className="text-brand-gold" />
              </div>
              <div>
                <p className="font-semibold text-lg">Order via Phone</p>
                <p className="text-brand-cream/60 text-sm">9777240070 / 8249517832</p>
              </div>
            </div>
            <div className="h-px w-full md:w-px md:h-12 bg-brand-gold/20" />
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-gold/20 flex items-center justify-center">
                <MapPin className="text-brand-gold" />
              </div>
              <div>
                <p className="font-semibold text-lg">Pick-up Point</p>
                <p className="text-brand-cream/60 text-sm">Jhirpani, Rourkela 769042, Odisha</p>
              </div>
            </div>
          </div>

          {error && !isModalOpen && (
            <div className="mb-8 flex items-center gap-3 rounded-2xl border border-red-400/30 bg-red-50 px-5 py-4 text-red-700">
              <AlertCircle size={20} /> {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-96 animate-pulse rounded-3xl bg-white/70" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full flex flex-col group overflow-hidden border-brand-gold/10 hover:border-brand-gold/30 transition-all duration-500 shadow-lg hover:shadow-2xl">
                    <CardHeader className="p-0 overflow-hidden aspect-video">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4">
                        <div className="bg-brand-gold text-brand-dark px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          {product.priceLabel}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow p-6">
                      <h3 className="text-xl font-serif font-bold text-brand-dark mb-2 group-hover:text-brand-gold transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-brand-brown text-sm leading-relaxed mb-4">
                        {product.description || 'Freshly baked with premium ingredients.'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {product.options.map((opt) => (
                          <span key={opt} className="text-[10px] uppercase tracking-widest text-brand-gold font-bold bg-brand-gold/10 px-2 py-1 rounded">
                            {opt}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="p-6 pt-0">
                      <Button
                        className="w-full rounded-2xl group-hover:bg-brand-dark group-hover:text-brand-gold transition-all"
                        onClick={() => handleOrderClick(product)}
                      >
                        <ShoppingBag size={18} className="mr-2" /> Order Now
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isSuccess ? 'Order Received!' : `Order ${selectedProduct?.name || ''}`}
      >
        {isSuccess ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h4 className="text-2xl font-serif font-bold text-brand-dark mb-4">Thank you!</h4>
            <p className="text-brand-brown leading-relaxed mb-6">
              Your order has been received. Our team will contact you soon to confirm delivery.
            </p>
            <Button className="bg-brand-dark text-brand-gold w-full" onClick={() => setIsModalOpen(false)}>
              Back to Shop
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle size={18} className="mt-0.5 shrink-0" /> {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-brand-brown mb-2">Customer Name *</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white border border-brand-gold/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold transition-all shadow-sm"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-brown mb-2">Phone Number *</label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white border border-brand-gold/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold transition-all shadow-sm"
                    placeholder="10-digit mobile number"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-brown mb-2">Delivery Date *</label>
                  <input
                    required
                    type="date"
                    min={minimumDate}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-white border border-brand-gold/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-brand-brown mb-1">Delivery Address *</label>
              <textarea
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-white border border-brand-gold/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold transition-colors h-24 resize-none"
                placeholder="Detailed Address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-brand-brown mb-1">Flavor</label>
                <select
                  value={formData.flavor}
                  onChange={(e) => setFormData({ ...formData, flavor: e.target.value })}
                  className="w-full bg-white border border-brand-gold/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold transition-colors"
                >
                  <option>Chocolate</option>
                  <option>Vanilla</option>
                  <option>Red Velvet</option>
                  <option>Butterscotch</option>
                  <option>Pineapple</option>
                  <option>Mango</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-brand-brown mb-1">Size / Weight</label>
                <select
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="w-full bg-white border border-brand-gold/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold transition-colors"
                >
                  <option>500g</option>
                  <option>1kg</option>
                  <option>1.5kg</option>
                  <option>2kg</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-brand-brown mb-1">Message on Cake</label>
              <input
                type="text"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-white border border-brand-gold/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold transition-colors"
                placeholder="e.g. Happy Birthday"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-brand-brown mb-1">Special Instructions</label>
              <input
                type="text"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="w-full bg-white border border-brand-gold/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold transition-colors"
                placeholder="Any special requests"
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full py-4 rounded-xl text-lg mt-4 shadow-lg hover:shadow-xl transition-all">
              {submitting ? 'Placing Order...' : 'Place Order'}
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Shop;
