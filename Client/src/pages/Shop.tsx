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
    image: product.image_url || productImages[index % productImages.length],
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
  const [error, setError] = useState('');

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



  const handleOrderClick = (product: ReturnType<typeof mapProduct>) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
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
                    <CardHeader className="p-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4">
                        <div className="bg-brand-gold text-brand-dark px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          {product.priceLabel}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-3 -mt-4 relative z-10 bg-white shadow-[0_-6px_20px_rgba(0,0,0,0.08)]">
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
                    <CardFooter className="px-4 pb-4 pt-0">
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
        title={selectedProduct ? `Order ${selectedProduct.name}` : 'Order Product'}
        maxWidth="max-w-md"
        headerClassName="bg-[#1a110a] text-brand-gold border-b border-white/5"
      >
        <div className="py-8 px-2 text-center">
          <div className="w-20 h-20 bg-brand-gold/10 text-brand-gold rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-gold/20">
            <ShoppingBag size={32} />
          </div>
          
          <h3 className="text-2xl font-serif font-bold text-brand-dark mb-2">
            Order {selectedProduct?.name}
          </h3>
          
          <p className="text-brand-brown/70 mb-8 max-w-[280px] mx-auto text-sm leading-relaxed">
            Contact our bakery team to place your order and confirm delivery details.
          </p>

          <div className="space-y-3">
            <a 
              href="tel:+919777240070"
              className="flex items-center justify-center gap-3 w-full py-4 bg-[#1a110a] text-brand-gold rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10"
            >
              <Phone size={20} /> Call Now: +91 97772 40070
            </a>
            
            <a 
              href={`https://wa.me/919777240070?text=${encodeURIComponent(`Hi Nimu Bakery, I'd like to order ${selectedProduct?.name}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 bg-[#25D366] text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-green-500/20"
            >
              <ShoppingBag size={20} /> Order via WhatsApp
            </a>
          </div>

          <p className="mt-8 text-[10px] text-brand-brown/40 font-black uppercase tracking-[0.2em]">
            Freshly Baked in Rourkela, Odisha
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default Shop;
