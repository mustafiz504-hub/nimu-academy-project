import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Star, Clock, MapPin, Phone, CheckCircle2 } from 'lucide-react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import SectionHeading from '../components/ui/SectionHeading';
import Modal from '../components/ui/Modal';

const products = [
  {
    id: 1,
    name: 'Birthday Cake',
    description: 'Custom birthday cakes with your choice of flavor and decoration',
    price: 'Starting ₹599',
    image: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&q=80&w=600',
    options: ['Flavor', 'Size', 'Message']
  },
  {
    id: 2,
    name: 'Wedding Cake',
    description: 'Elegant multi-tier wedding cakes crafted with perfection',
    price: 'Starting ₹2,999',
    image: 'https://images.pexels.com/photos/1031200/pexels-photo-1031200.jpeg?auto=compress&cs=tinysrgb&w=600',
    options: ['Tiers', 'Flavor', 'Theme']
  },
  {
    id: 3,
    name: 'Cupcakes (Box of 6)',
    description: 'Freshly baked cupcakes with buttercream frosting',
    price: '₹349',
    image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&q=80&w=600',
    options: ['Flavor', 'Frosting']
  },
  {
    id: 4,
    name: 'Pastries (Box of 4)',
    description: 'Assorted fresh pastries baked daily',
    price: '₹299',
    image: 'https://images.unsplash.com/photo-1549590143-d5855148a9d5?auto=format&fit=crop&q=80&w=600',
    options: ['Assorted', 'Single flavor']
  },
  {
    id: 5,
    name: 'Black Forest Cake',
    description: 'Classic black forest with fresh cream and cherries',
    price: 'Starting ₹699',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=600',
    options: ['Size (500g / 1kg / 2kg)']
  },
  {
    id: 6,
    name: 'Custom Cake',
    description: 'Design your dream cake - any flavor, theme, size',
    price: 'Starting ₹999',
    image: 'https://images.unsplash.com/photo-1535254973040-607b474cb843?auto=format&fit=crop&q=80&w=600',
    options: ['Fully customizable']
  }
];

const Shop = () => {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    flavor: 'Chocolate',
    size: '500g',
    message: '',
    date: '',
    instructions: ''
  });

  const handleOrderClick = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsModalOpen(false);
      setFormData({
        name: '',
        phone: '',
        address: '',
        flavor: 'Chocolate',
        size: '500g',
        message: '',
        date: '',
        instructions: ''
      });
    }, 5000);
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

          {/* Info Banner */}
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
            <div className="h-px w-full md:w-px md:h-12 bg-brand-gold/20"></div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-gold/20 flex items-center justify-center">
                <Phone className="text-brand-gold" />
              </div>
              <div>
                <p className="font-semibold text-lg">Order via Phone</p>
                <p className="text-brand-cream/60 text-sm">9777240070 / 8249517832</p>
              </div>
            </div>
            <div className="h-px w-full md:w-px md:h-12 bg-brand-gold/20"></div>
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
                        {product.price}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow p-6">
                    <h3 className="text-xl font-serif font-bold text-brand-dark mb-2 group-hover:text-brand-gold transition-colors">{product.name}</h3>
                    <p className="text-brand-brown text-sm leading-relaxed mb-4">{product.description}</p>
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
                      Order Now
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />

      {/* Order Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={isSuccess ? "Order Received!" : `Order ${selectedProduct?.name}`}
      >
        {isSuccess ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h4 className="text-2xl font-serif font-bold text-brand-dark mb-4">Thank you!</h4>
            <p className="text-brand-brown leading-relaxed mb-6">
              Your order for <strong>{selectedProduct?.name}</strong> has been received.<br/>
              Our team will contact you on <strong>{formData.phone}</strong> within 2 hours to confirm your order.
            </p>
            <Button className="bg-brand-dark text-brand-gold w-full" onClick={() => setIsModalOpen(false)}>
              Back to Shop
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-brand-brown mb-2">Customer Name *</label>
                <input 
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-white border border-brand-gold/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold transition-all shadow-sm"
                    placeholder="10-digit mobile number"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-brand-brown mb-2">Delivery Date *</label>
                  <input 
                    required
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
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
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full bg-white border border-brand-gold/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold transition-colors h-24 resize-none"
                placeholder="Detailed Address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-brand-brown mb-1">Flavor</label>
                <select 
                  value={formData.flavor}
                  onChange={(e) => setFormData({...formData, flavor: e.target.value})}
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
                  onChange={(e) => setFormData({...formData, size: e.target.value})}
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
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full bg-white border border-brand-gold/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold transition-colors"
                placeholder="e.g. Happy Birthday Sahil"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-brand-brown mb-1">Special Instructions</label>
              <input 
                type="text"
                value={formData.instructions}
                onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                className="w-full bg-white border border-brand-gold/20 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold transition-colors"
                placeholder="Any special requests"
              />
            </div>

            <Button type="submit" className="w-full py-4 rounded-xl text-lg mt-4 shadow-lg hover:shadow-xl transition-all">
              Place Order
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Shop;
