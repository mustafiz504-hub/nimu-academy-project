import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Search, Plus, Edit, Trash2, X, Save, Image as ImageIcon } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/ui/Button';

interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  stock: string;
  image: string;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: 'Chocolate Truffle Cake', category: 'Cakes', price: '₹1,200', stock: '12', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60' },
    { id: 2, name: 'Vanilla Sponge Cake', category: 'Cakes', price: '₹800', stock: '8', image: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=500&auto=format&fit=crop&q=60' },
    { id: 3, name: 'Red Velvet Pastry', category: 'Pastries', price: '₹150', stock: '25', image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&auto=format&fit=crop&q=60' },
    { id: 4, name: 'Blueberry Cheesecake', category: 'Cakes', price: '₹1,500', stock: '5', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=60' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      if (editingProduct.id === 0) {
        setProducts([...products, { ...editingProduct, id: Date.now() }]);
      } else {
        setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
      }
      setIsModalOpen(false);
      setEditingProduct(null);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Product Catalog</h1>
          <p className="text-brand-cream/40 mt-1">Manage your bakery items and inventory</p>
        </div>
        <Button 
          variant="primary" 
          className="flex items-center gap-2"
          onClick={() => {
            setEditingProduct({ id: 0, name: '', category: 'Cakes', price: '', stock: '', image: '' });
            setIsModalOpen(true);
          }}
        >
          <Plus size={20} /> Add New Product
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-cream/40" size={18} />
          <input 
            type="text" 
            placeholder="Search by product name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:border-brand-gold/50 outline-none text-white transition-all"
          />
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={product.id} 
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-brand-gold/30 transition-all"
            >
              <div className="relative h-48 overflow-hidden">
                <img src={product.image || 'https://via.placeholder.com/500'} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEdit(product)}
                    className="p-2 bg-white/10 backdrop-blur-md text-white rounded-lg hover:bg-brand-gold hover:text-brand-dark transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="p-2 bg-white/10 backdrop-blur-md text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 px-3 py-1 bg-brand-gold text-brand-dark text-[10px] font-bold uppercase rounded-full">
                  {product.category}
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-bold truncate pr-2">{product.name}</h3>
                  <span className="text-brand-gold font-bold">{product.price}</span>
                </div>
                <div className="flex items-center justify-between mt-4 text-xs text-brand-cream/40">
                  <div className="flex items-center gap-1">
                    <Package size={14} /> Stock: <span className="text-brand-cream">{product.stock} units</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Edit/Add Modal */}
      <AnimatePresence>
        {isModalOpen && editingProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-brand-dark border border-brand-gold/20 rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-serif font-bold text-brand-gold">
                    {editingProduct.id === 0 ? 'Add New Product' : 'Edit Product'}
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-brand-cream/60">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-gold uppercase tracking-widest ml-1">Product Name</label>
                    <input 
                      type="text" 
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-brand-gold/50 text-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-brand-gold uppercase tracking-widest ml-1">Category</label>
                      <select 
                        value={editingProduct.category}
                        onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-brand-gold/50 text-white"
                      >
                        <option value="Cakes">Cakes</option>
                        <option value="Pastries">Pastries</option>
                        <option value="Cookies">Cookies</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-brand-gold uppercase tracking-widest ml-1">Price</label>
                      <input 
                        type="text" 
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-brand-gold/50 text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-gold uppercase tracking-widest ml-1">Stock (Units)</label>
                    <input 
                      type="text" 
                      value={editingProduct.stock}
                      onChange={(e) => setEditingProduct({...editingProduct, stock: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-brand-gold/50 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-gold uppercase tracking-widest ml-1">Image URL</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gold/50" size={18} />
                      <input 
                        type="text" 
                        value={editingProduct.image}
                        onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 outline-none focus:border-brand-gold/50 text-white"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button type="submit" variant="primary" className="w-full py-4 flex items-center justify-center gap-2">
                      <Save size={20} /> Save Product Changes
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminProducts;
